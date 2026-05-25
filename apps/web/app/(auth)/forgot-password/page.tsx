import Link from 'next/link'
import { sendPasswordReset } from '@/app/actions/auth'

interface Props {
  searchParams: Promise<{ message?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { message } = await searchParams

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[340px]">
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="AbundanZ" style={{ width: 140, height: 'auto', display: 'block' }} />
        </div>

        <h1 className="text-white text-2xl font-bold mb-1">Forgot password?</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {message ? (
          <div className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
            {decodeURIComponent(message)}
          </div>
        ) : (
          <form className="space-y-3 mb-5">
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              autoComplete="email"
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <button
              formAction={sendPasswordReset}
              className="w-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Send reset link
            </button>
          </form>
        )}

        <p className="text-center text-xs text-zinc-600">
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
