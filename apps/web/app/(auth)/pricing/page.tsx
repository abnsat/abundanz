import { createClient } from '@/utils/supabase/server'
import { isSubscribed } from '@/utils/subscription'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/app/components/Navbar'
import { CheckoutButton } from './CheckoutButton'

const FEATURES = [
  'Unlimited access to all content',
  'Web + iOS + Android',
  'New content added regularly',
  'Cancel anytime',
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && await isSubscribed(user.id)) redirect('/')

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <p className="text-zinc-600 text-xs font-semibold tracking-widest uppercase mb-4">
          Subscription
        </p>
        <h1 className="text-4xl font-bold mb-3 text-center tracking-tight">
          Unlimited access
        </h1>
        <p className="text-zinc-500 text-base mb-12 text-center max-w-sm">
          Stream the full AbundanZ library on web and mobile, anytime.
        </p>

        <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
          <div className="mb-6 pb-6 border-b border-zinc-800">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-zinc-500 text-sm">/ month</span>
            </div>
          </div>

          <ul className="space-y-3.5 mb-8">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#3f3f46"/>
                  <path d="M4.5 8l2.5 2.5 4-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {user ? (
            <CheckoutButton />
          ) : (
            <Link
              href="/login"
              className="block w-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold py-3.5 rounded-lg text-center text-sm hover:opacity-90 transition-opacity"
            >
              Sign in to subscribe
            </Link>
          )}
        </div>

        <p className="text-zinc-700 text-xs mt-6">
          Secure payment via Stripe · Cancel anytime
        </p>
      </main>
    </div>
  )
}
