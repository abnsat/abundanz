import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { db } from '@/utils/db'
import { subscriptions } from '@abundanz/shared'

// Called by the mobile app after a successful RevenueCat purchase to sync the
// subscription to the DB without waiting for the webhook.
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const secretKey = process.env.REVENUECAT_SECRET_KEY
  if (!secretKey) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

  // Verify with RevenueCat before writing to DB
  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`,
    { headers: { Authorization: `Bearer ${secretKey}` }, cache: 'no-store' }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'RevenueCat lookup failed' }, { status: 502 })
  }

  const data = await res.json()
  const entitlements: Record<string, { expires_date: string | null }> =
    data.subscriber?.entitlements ?? {}

  // RevenueCat only includes active entitlements in this field — no expires check needed
  const isActive = Object.keys(entitlements).length > 0

  if (!isActive) {
    return NextResponse.json({ isSubscribed: false })
  }

  // Use the furthest expiry across all entitlements (null = no expiry)
  let expiresAt: Date | null = new Date(0)
  for (const e of Object.values(entitlements)) {
    if (e.expires_date === null) { expiresAt = null; break }
    const d = new Date(e.expires_date)
    if (expiresAt !== null && d > expiresAt) expiresAt = d
  }
  if (expiresAt instanceof Date && expiresAt.getTime() === 0) expiresAt = null

  await db
    .insert(subscriptions)
    .values({
      userId: user.id,
      isActive: true,
      source: 'apple',
      expiresAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { isActive: true, expiresAt, updatedAt: new Date() },
    })

  return NextResponse.json({ isSubscribed: true })
}
