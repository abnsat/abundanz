import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'
import { getStreamUrl } from '@/utils/video-provider'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Phase 2: subscription check deferred — all authenticated users can stream
  // Phase 3: replace with RevenueCat entitlement check

  const { id } = await params
  const [video] = await db.select().from(videos).where(eq(videos.id, id))
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = getStreamUrl(video.bunnyVideoId)
  return NextResponse.json({ url })
}
