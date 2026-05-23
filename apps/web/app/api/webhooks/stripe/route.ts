import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { db } from '@/utils/db'
import { subscriptions } from '@abundanz/shared'
import type Stripe from 'stripe'

async function getPeriodEnd(subscription: Stripe.Subscription): Promise<Date | null> {
  // Fetch period_end from the latest invoice since current_period_end was removed in dahlia API
  if (!subscription.latest_invoice) return null
  const invoiceId = typeof subscription.latest_invoice === 'string'
    ? subscription.latest_invoice
    : subscription.latest_invoice.id
  const invoice = await stripe.invoices.retrieve(invoiceId)
  return invoice.period_end ? new Date(invoice.period_end * 1000) : null
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
