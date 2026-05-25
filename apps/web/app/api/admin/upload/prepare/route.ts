import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { users, videos } from '@abundanz/shared'
import { eq } from 'drizzle-orm'
import {
  createBunnyVideo,
  generateTusCredentials,
  getBunnyThumbnailUrl,
  getBunnyPreviewUrl,
} from '@/utils/video-provider'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id))
  return row?.role === 'admin' ? user : null
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, category, language } = await request.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const bunnyVideoId = await createBunnyVideo(title.trim())

  const [video] = await db
    .insert(videos)
    .values({
      title: title.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      language: language?.trim() || null,
      bunnyVideoId,
      thumbnailUrl: getBunnyThumbnailUrl(bunnyVideoId),
      previewUrl: getBunnyPreviewUrl(bunnyVideoId),
      status: 'processing',
    })
    .returning({ id: videos.id })

  const tus = generateTusCredentials(bunnyVideoId)

  return NextResponse.json({
    id: video.id,
    bunnyVideoId,
    ...tus,
  })
}
