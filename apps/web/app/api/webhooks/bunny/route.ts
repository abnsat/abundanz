import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db'
import { videos } from '@abundanz/shared'
import { eq } from 'drizzle-orm'

// Bunny.net encoding status codes
const FINISHED = 3
const FAILED = 5

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token !== process.env.BUNNY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { VideoGuid: bunnyVideoId, Status: status, Duration: durationSeconds } = body

  if (!bunnyVideoId) return NextResponse.json({ received: true })

  if (status === FINISHED) {
    await db
      .update(videos)
      .set({
        status: 'ready',
        ...(durationSeconds ? { durationSeconds: Math.round(durationSeconds) } : {}),
      })
      .where(eq(videos.bunnyVideoId, bunnyVideoId))
  } else if (status === FAILED) {
    await db
      .update(videos)
      .set({ status: 'error' })
      .where(eq(videos.bunnyVideoId, bunnyVideoId))
  }

  return NextResponse.json({ received: true })
}
