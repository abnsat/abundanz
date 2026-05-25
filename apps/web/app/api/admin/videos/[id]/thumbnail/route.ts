import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { users, videos } from '@abundanz/shared'
import { eq } from 'drizzle-orm'
import { uploadBunnyThumbnail } from '@/utils/video-provider'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id))
  return row?.role === 'admin' ? user : null
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const [video] = await db.select({ bunnyVideoId: videos.bunnyVideoId }).from(videos).where(eq(videos.id, id))
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('thumbnail') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = await file.arrayBuffer()
  await uploadBunnyThumbnail(video.bunnyVideoId, buffer, file.type || 'image/jpeg')

  return NextResponse.json({ ok: true })
}
