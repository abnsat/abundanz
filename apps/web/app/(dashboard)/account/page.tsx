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

  const firstName = user.user_metadata?.first_name
  const lastName = user.user_metadata?.last_name

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800/60">
        <Link href="/" className="overflow-hidden shrink-0" style={{ width: 80, height: 50 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="AbundanZ" style={{ width: 80, height: 'auto', display: 'block' }} />
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white px-3 py-1.5 rounded-full border border-transparent hover:border-zinc-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 7h7M9.5 4.5L12 7l-2.5 2.5"/>
              <path d="M8 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5"/>
            </svg>
            Sign out
          </button>
        </form>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#71717a">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8"/>
            </svg>
          </div>
          <div>
            {(firstName || lastName) && (
              <p className="text-white font-semibold text-lg leading-tight">
                {[firstName, lastName].filter(Boolean).join(' ')}
              </p>
            )}
            <p className="text-zinc-500 text-sm">{user.email}</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="border border-zinc-800 rounded-xl p-5">
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
                  <span className="inline-block w-2 h-2 rounded-full bg-zinc-600" />
                  <span className="text-zinc-400">No active subscription</span>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Subscribe now
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
