import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getSupabaseAdmin } from '@/utils/supabase/admin'
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const [video] = await db.select({ id: videos.id }).from(videos).where(eq(videos.id, id))
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('thumbnail') as File | null
  if (!file) return NextResponse.json({ error: 'No thumbnail file' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${id}/thumbnail.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const storage = getSupabaseAdmin().storage.from('thumbnails')
  const { error: uploadError } = await storage.upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  })

  if (uploadError) {
    console.error('[thumbnail upload] storage error:', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = storage.getPublicUrl(path)

  await db.update(videos).set({ thumbnailUrl: publicUrl }).where(eq(videos.id, id))

  return NextResponse.json({ ok: true, thumbnailUrl: publicUrl })
}
