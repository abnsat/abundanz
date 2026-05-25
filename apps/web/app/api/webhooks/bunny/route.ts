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
  console.log('[bunny webhook] body:', JSON.stringify(body))

  const { VideoGuid: bunnyVideoId, Status: status, Duration: durationSeconds } = body

  if (!bunnyVideoId) return NextResponse.json({ received: true })

  if (status === FINISHED) {
    // Prefer the payload duration but always confirm via the API — payload often sends 0
    let resolvedDuration = durationSeconds ? Math.round(durationSeconds) : null
    console.log('[bunny webhook] duration from payload:', durationSeconds, '→ resolved:', resolvedDuration)

    try {
      const url = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${bunnyVideoId}`
      console.log('[bunny webhook] fetching from API:', url)
      const res = await fetch(url, { headers: { AccessKey: process.env.BUNNY_API_KEY! } })
      const data = await res.json()
      console.log('[bunny webhook] API response:', JSON.stringify(data))
      if (data.length) resolvedDuration = Math.round(data.length)
    } catch (e) {
      console.error('[bunny webhook] API fetch error:', e)
    }

    console.log('[bunny webhook] final duration to save:', resolvedDuration)
    await db
      .update(videos)
      .set({
        status: 'ready',
        ...(resolvedDuration ? { durationSeconds: resolvedDuration } : {}),
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
