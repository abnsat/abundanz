import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db'
import { subscriptions } from '@abundanz/shared'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.REVENUECAT_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const event = body.event
  if (!event) return NextResponse.json({ received: true })

  const userId = event.app_user_id as string | undefined
  if (!userId) return NextResponse.json({ received: true })

  const activeTypes = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION']
  const inactiveTypes = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE']
  const source = event.store === 'APP_STORE' ? 'apple' : 'google'

  if (activeTypes.includes(event.type)) {
    const expiresAt = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : null

    await db
      .insert(subscriptions)
      .values({
        userId,
        isActive: true,
        source,
        expiresAt,
        revenueCatCustomerId: event.original_app_user_id,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { isActive: true, source, expiresAt, updatedAt: new Date() },
      })
  } else if (inactiveTypes.includes(event.type)) {
    await db
      .insert(subscriptions)
      .values({
        userId,
        isActive: false,
        source,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { isActive: false, updatedAt: new Date() },
      })
  }

  return NextResponse.json({ received: true })
}
