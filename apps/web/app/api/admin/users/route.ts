import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getSupabaseAdmin } from '@/utils/supabase/admin'
import { db } from '@/utils/db'
import { users } from '@abundanz/shared'
import { eq, sql } from 'drizzle-orm'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id))
  return row?.role === 'admin' ? user : null
}

// Promote a user to admin by email
export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email } = await request.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const { data: target } = await getSupabaseAdmin()
    .from('users')
    .select('id, email, first_name, last_name, role')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (!target) return NextResponse.json({ error: 'No account found for that email' }, { status: 404 })
  if (target.role === 'admin') return NextResponse.json({ error: 'User is already an admin' }, { status: 409 })

  await getSupabaseAdmin().from('users').update({ role: 'admin' }).eq('id', target.id)
  return NextResponse.json({ user: { ...target, role: 'admin' } })
}

// Demote an admin back to user
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  if (id === admin.id) return NextResponse.json({ error: 'You cannot remove your own admin role' }, { status: 400 })

  await getSupabaseAdmin().from('users').update({ role: 'user' }).eq('id', id)
  return NextResponse.json({ ok: true })
}
