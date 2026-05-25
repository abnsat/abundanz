import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { users, videos } from '@abundanz/shared'
import { eq, isNull } from 'drizzle-orm'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id))
  return row?.role === 'admin' ? user : null
}

export async function POST() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rows = await db
    .select({ id: videos.id, bunnyVideoId: videos.bunnyVideoId })
    .from(videos)
    .where(isNull(videos.durationSeconds))

  let updated = 0
  let failed = 0

  await Promise.all(rows.map(async ({ id, bunnyVideoId }) => {
    try {
      const res = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${bunnyVideoId}`,
        { headers: { AccessKey: process.env.BUNNY_API_KEY! } }
      )
      if (!res.ok) { failed++; return }
      const data = await res.json()
      const duration = data.length ? Math.round(data.length) : null
      if (!duration) { failed++; return }
      await db.update(videos).set({ durationSeconds: duration }).where(eq(videos.id, id))
      updated++
    } catch {
      failed++
    }
  }))

  return NextResponse.json({ updated, failed, total: rows.length })
}
