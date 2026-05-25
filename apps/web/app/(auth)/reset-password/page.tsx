import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { updatePassword } from '@/app/actions/auth'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?error=Reset+link+has+expired.+Please+request+a+new+one.')

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[340px]">
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="AbundanZ" style={{ width: 140, height: 'auto', display: 'block' }} />
        </div>

        <h1 className="text-white text-2xl font-bold mb-1">Set new password</h1>
        <p className="text-zinc-500 text-sm mb-8">Choose a strong password for your account.</p>

        {error && (
          <div className="bg-red-950/60 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
            {decodeURIComponent(error)}
          </div>
        )}

        <form className="space-y-3">
          <input
            name="password"
            type="password"
            placeholder="New password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <button
            formAction={updatePassword}
            className="w-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  )
}
