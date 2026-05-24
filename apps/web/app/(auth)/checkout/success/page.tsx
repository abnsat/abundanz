import Link from 'next/link'
import { stripe } from '@/utils/stripe'
import { db } from '@/utils/db'
import { subscriptions } from '@abundanz/shared'

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

async function syncFromSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.mode !== 'subscription' || !session.subscription) return

    const userId = session.metadata?.userId
    if (!userId) return

    const sub = await stripe.subscriptions.retrieve(session.subscription as string)
    const item = sub.items?.data?.[0]
    const expiresAt = item?.current_period_end ? new Date(item.current_period_end * 1000) : null

    await db
      .insert(subscriptions)
      .values({
        userId,
        isActive: true,
        source: 'stripe',
        expiresAt,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: sub.id,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          isActive: true,
          source: 'stripe',
          expiresAt,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          updatedAt: new Date(),
        },
      })
  } catch (err) {
    console.error('[checkout/success] syncFromSession failed:', err)
  }
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams
  if (session_id) await syncFromSession(session_id)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-3">You&apos;re subscribed!</h1>
      <p className="text-zinc-400 mb-8">Welcome to Abundanz. Start watching now.</p>
      <Link
        href="/dashboard"
        className="bg-white text-black font-semibold px-8 py-3 rounded hover:bg-zinc-200 transition-colors"
      >
        Go to app
      </Link>
    </div>
  )
}
