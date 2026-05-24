'use client'

import { useState } from 'react'
import { signInWithEmail, signUpWithEmail } from '@/app/actions/auth'

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

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
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <input
              name="lastName"
              type="text"
              placeholder="Last name"
              required
              autoComplete="family-name"
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        )}
        <input
          name="email"
          type="email"
          placeholder="Email address"
          required
          autoComplete="email"
          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
        />
        {mode === 'signin' ? (
          <button
            formAction={signInWithEmail}
            className="w-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        ) : (
          <button
            formAction={signUpWithEmail}
            className="w-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
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
