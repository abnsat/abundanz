import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
        <span className="text-xl font-bold tracking-tight">Abundanz</span>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-zinc-400">Videos coming in Phase 2.</p>
      </main>
    </div>
  )
}
