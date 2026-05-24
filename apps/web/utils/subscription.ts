import { db } from './db'
import { subscriptions } from '@abundanz/shared'
import { eq } from 'drizzle-orm'
import { stripe } from './stripe'

async function checkAndSyncStripe(userId: string, stripeSubscriptionId: string): Promise<boolean> {
  try {
    const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    const active = sub.status === 'active' || sub.status === 'trialing'

    // Fetch the current period end from the latest invoice
    const item = sub.items?.data?.[0]
    const expiresAt = item?.current_period_end ? new Date(item.current_period_end * 1000) : null

    // Sync the fresh data back to DB so next request hits the fast path
    await db
      .insert(subscriptions)
      .values({ userId, isActive: active, source: 'stripe', expiresAt, stripeSubscriptionId, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { isActive: active, expiresAt, updatedAt: new Date() },
      })

    return active
  } catch {
    return false
  }
}

async function checkRevenueCat(userId: string): Promise<boolean> {
  const secretKey = process.env.REVENUECAT_SECRET_KEY
  if (!secretKey) return false
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const data = await res.json()
    const entitlements: Record<string, unknown> = data.subscriber?.entitlements ?? {}
    return Object.keys(entitlements).length > 0
  } catch {
    return false
  }
}

export async function isSubscribed(userId: string): Promise<boolean> {
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId))

  if (sub?.isActive) {
    // Fast path: DB says active and expiry is in the future (or no expiry set)
    if (!sub.expiresAt || sub.expiresAt > new Date()) return true

    // Stale expiry — check live sources to see if it renewed
    if (sub.stripeSubscriptionId) return checkAndSyncStripe(userId, sub.stripeSubscriptionId)
  }

  if (sub?.isActive === false) return false

  // No DB record — check live sources (webhook not yet fired)
  return checkRevenueCat(userId)
}
