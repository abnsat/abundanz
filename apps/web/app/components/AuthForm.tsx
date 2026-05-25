'use client'

import { useState } from 'react'
import { signInWithEmail, signUpWithEmail, sendPasswordReset } from '@/app/actions/auth'

type Mode = 'signin' | 'signup' | 'forgot'

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin')
  const [resetSent, setResetSent] = useState(false)

  const inputClass = 'w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors'
  const btnClass = 'w-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity'

  if (mode === 'forgot') {
    return (
      <>
        {resetSent ? (
          <div className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
            If an account exists for that email, a reset link is on its way.
          </div>
        ) : (
          <form className="space-y-3 mb-5">
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              autoComplete="email"
              className={inputClass}
            />
            <button
              formAction={async (fd) => { await sendPasswordReset(fd); setResetSent(true) }}
              className={btnClass}
            >
              Send reset link
            </button>
          </form>
        )}
        <p className="text-center text-xs text-zinc-600 mb-5">
          <button
            type="button"
            onClick={() => { setMode('signin'); setResetSent(false) }}
            className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Back to sign in
          </button>
        </p>
      </>
    )
  }

  return (
    <>
      <form className="space-y-3 mb-5">
        {mode === 'signup' && (
          <div className="flex gap-3">
            <input
              name="firstName"
              type="text"
              placeholder="First name"
              required
              autoComplete="given-name"
              className={inputClass}
            />
            <input
              name="lastName"
              type="text"
              placeholder="Last name"
              required
              autoComplete="family-name"
              className={inputClass}
            />
          </div>
        )}
        <input
          name="email"
          type="email"
          placeholder="Email address"
          required
          autoComplete="email"
          className={inputClass}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className={inputClass}
        />
        {mode === 'signin' ? (
          <>
            <button formAction={signInWithEmail} className={btnClass}>
              Sign In
            </button>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </>
        ) : (
          <button formAction={signUpWithEmail} className={btnClass}>
            Create Account
          </button>
        )}
      </form>

      <p className="text-center text-xs text-zinc-600 mb-5">
        {mode === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </>
  )
}
