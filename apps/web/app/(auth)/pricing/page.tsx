import { createClient } from '@/utils/supabase/server'
import { isSubscribed } from '@/utils/subscription'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckoutButton } from './CheckoutButton'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && await isSubscribed(user.id)) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5">
        <Link href="/" className="text-xl font-bold tracking-tight">Abundanz</Link>
        {user && (
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Back to app
          </Link>
        )}
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-4xl font-bold mb-3 text-center">Unlimited access</h1>
        <p className="text-zinc-400 text-lg mb-12 text-center max-w-md">
          Stream the full Abundanz library on web and mobile.
        </p>

        <div className="w-full max-w-sm border border-zinc-700 rounded-xl p-8 bg-zinc-900">
          <div className="mb-6">
            <span className="text-4xl font-bold">$9.99</span>
            <span className="text-zinc-400 ml-2">/ month</span>
          </div>

          <ul className="space-y-3 mb-8 text-sm text-zinc-300">
            {[
              'Full library access',
              'Web + iOS + Android',
              'New content added regularly',
              'Cancel anytime',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-white">✓</span> {feature}
              </li>
            ))}
          </ul>

          {user ? (
            <CheckoutButton />
          ) : (
            <Link
              href="/login"
              className="block w-full bg-white text-black font-semibold py-3 rounded text-center hover:bg-zinc-200 transition-colors"
            >
              Sign in to subscribe
            </Link>
          )}
        </div>

        <p className="text-zinc-600 text-xs mt-6">
          Secure payment via Stripe. Cancel anytime from your account page.
        </p>
      </main>
    </div>
  )
}
