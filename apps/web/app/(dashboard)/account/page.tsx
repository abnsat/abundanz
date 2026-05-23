import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { subscriptions } from '@abundanz/shared'
import { eq } from 'drizzle-orm'
import { signOut } from '@/app/actions/auth'
import { isSubscribed } from '@/utils/subscription'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CancelButton } from './CancelButton'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id))

  // Use same source-of-truth as the gating checks (falls back to live Stripe/RevenueCat)
  const isActive = await isSubscribed(user.id)
  const formattedExpiry = sub?.expiresAt && sub.expiresAt > new Date()
    ? sub.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-zinc-300 transition-colors">
          Abundanz
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">Account</h1>

        <section className="space-y-6">
          <div className="border border-zinc-800 rounded-lg p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-zinc-200">{user.email}</p>
          </div>

          <div className="border border-zinc-800 rounded-lg p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Subscription</p>
            {isActive ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-zinc-200 font-medium">Active</span>
                  {sub?.source && (
                    <span className="text-xs text-zinc-500 capitalize">via {sub.source}</span>
                  )}
                </div>
                {formattedExpiry && (
                  <p className="text-sm text-zinc-400">
                    {sub?.cancelAtPeriodEnd ? 'Expires' : sub?.stripeSubscriptionId ? 'Renews' : 'Expires'} {formattedExpiry}
                  </p>
                )}
                {sub?.stripeSubscriptionId && !sub?.cancelAtPeriodEnd && <CancelButton />}
                {sub?.cancelAtPeriodEnd && (
                  <p className="text-xs text-zinc-500">Cancellation scheduled — access until expiry date above.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400">No active subscription</span>
                </div>
                <Link
                  href="/pricing"
                  className="inline-block bg-white text-black font-semibold px-5 py-2 rounded text-sm hover:bg-zinc-200 transition-colors"
                >
                  Subscribe
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
