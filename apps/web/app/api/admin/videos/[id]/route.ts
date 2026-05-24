import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { users, videos } from '@abundanz/shared'
import { eq } from 'drizzle-orm'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id))
  return row?.role === 'admin' ? user : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { title, description, category } = await request.json()

  const [updated] = await db
    .update(videos)
    .set({
      ...(title !== undefined && { title: String(title).trim() }),
      ...(description !== undefined && { description: description ? String(description).trim() : null }),
      ...(category !== undefined && { category: category ? String(category).trim() : null }),
    })
    .where(eq(videos.id, id))
    .returning({ id: videos.id, title: videos.title, description: videos.description, category: videos.category })

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ video: updated })
}
