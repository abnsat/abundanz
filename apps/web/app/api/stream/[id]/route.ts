import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'
import { getSignedStreamUrl } from '@/utils/video-provider'
import { isSubscribed } from '@/utils/subscription'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!await isSubscribed(user.id)) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
  }

  const { id } = await params
  const [video] = await db.select().from(videos).where(eq(videos.id, id))
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = getSignedStreamUrl(video.bunnyVideoId)
  return NextResponse.json({ url })
}
