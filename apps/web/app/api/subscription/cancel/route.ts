import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe'
import { db } from '@/utils/db'
import { subscriptions } from '@abundanz/shared'
import { eq } from 'drizzle-orm'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id))
  if (!sub?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No active Stripe subscription' }, { status: 400 })
  }

  // Cancel at period end — user keeps access until expiresAt
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  return NextResponse.json({ cancelled: true })
}
