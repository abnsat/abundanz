import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 absolute top-0 left-0 right-0 z-10">
        <span className="text-xl font-bold tracking-tight">Abundanz</span>
        <Link
          href={user ? '/dashboard' : '/login'}
          className="text-sm font-medium bg-white text-black px-5 py-2 rounded hover:bg-zinc-200 transition-colors"
        >
          {user ? 'Go to App' : 'Sign In'}
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)] pointer-events-none" />

        {/* Placeholder thumbnail grid — blurred behind hero */}
        <div className="absolute inset-0 grid grid-cols-4 gap-2 p-8 opacity-10 blur-sm scale-105 pointer-events-none select-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md bg-zinc-800 aspect-video"
              style={{ opacity: 0.4 + (i % 4) * 0.15 }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-5">
            AI-generated video,<br />on demand.
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl mb-10 max-w-lg mx-auto">
            Unlimited access to a curated library of AI-generated content. Stream anywhere, anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-white text-black font-semibold px-8 py-3.5 rounded text-base hover:bg-zinc-200 transition-colors"
            >
              Get Started
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="border border-zinc-600 text-white font-medium px-8 py-3.5 rounded text-base hover:bg-zinc-900 transition-colors"
              >
                Continue Watching
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-zinc-600 text-sm">
        © {new Date().getFullYear()} Abundanz
      </footer>

    </div>
  )
}
