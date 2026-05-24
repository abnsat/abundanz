import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { db } from '@/utils/db'
import { subscriptions } from '@abundanz/shared'
import type Stripe from 'stripe'

function getPeriodEnd(subscription: Stripe.Subscription): Date | null {
  // current_period_end moved to subscription item level in the dahlia API
  const item = subscription.items?.data?.[0]
  if (item?.current_period_end) return new Date(item.current_period_end * 1000)
  return null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId || session.mode !== 'subscription') break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const expiresAt = await getPeriodEnd(subscription)

      await db
        .insert(subscriptions)
        .values({
          userId,
          isActive: true,
          source: 'stripe',
          expiresAt,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            isActive: true,
            source: 'stripe',
            expiresAt,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            updatedAt: new Date(),
          },
        })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (!userId) break

      const isActive = subscription.status === 'active' || subscription.status === 'trialing'
      const cancelAtPeriodEnd = subscription.cancel_at_period_end ?? false
      const expiresAt = await getPeriodEnd(subscription)

      await db
        .insert(subscriptions)
        .values({
          userId,
          isActive,
          source: 'stripe',
          expiresAt,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          cancelAtPeriodEnd,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: { isActive, expiresAt, cancelAtPeriodEnd, updatedAt: new Date() },
        })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (!userId) break

      await db
        .insert(subscriptions)
        .values({
          userId,
          isActive: false,
          source: 'stripe',
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: { isActive: false, updatedAt: new Date() },
        })
      break
    }
  }

  return NextResponse.json({ received: true })
}
