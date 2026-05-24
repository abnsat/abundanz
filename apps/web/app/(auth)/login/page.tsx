import { db } from '@/utils/db'
import { videos } from '@abundanz/shared'
import { LoginCarousel } from '@/app/components/LoginCarousel'
import { AuthForm } from '@/app/components/AuthForm'

interface Props {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const { error, message } = params

  // Best-effort: grab thumbnails for the carousel (non-critical)
  let thumbnails: string[] = []
  try {
    const rows = await db.select({ thumbnailUrl: videos.thumbnailUrl }).from(videos)
    thumbnails = rows.map((r) => r.thumbnailUrl).filter(Boolean) as string[]
  } catch {
    // DB unavailable — carousel falls back to dark background
  }

  return (
    <div className="min-h-screen bg-black flex">

      {/* ── Carousel left panel ──────────────────────────────────────── */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <LoginCarousel thumbnails={thumbnails} />

        {/* Vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

        {/* Branding overlay */}
        <div className="absolute bottom-16 left-10 right-10 pointer-events-none">
          <h2 className="text-white text-4xl font-bold leading-tight mb-3">
            Where faith<br />comes alive.
          </h2>
          <p className="text-white/50 text-sm font-medium tracking-[0.2em] uppercase">
            Faith · Truth · Purpose
          </p>
        </div>
      </div>

      {/* ── Auth panel ───────────────────────────────────────────────── */}
      <div className="w-full lg:w-[440px] shrink-0 flex flex-col items-center justify-center px-10 py-16 bg-black">

        {/* Logo — simple <img> crop: show top ~50% of the JPEG (AZ icon only) */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="overflow-hidden"
            style={{ width: 120, height: 86 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="AbundanZ logo"
              style={{ width: 120, height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        <div className="w-full max-w-[340px]">
          <h1 className="text-white text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-zinc-500 text-sm mb-8">Sign in or create an account to continue.</p>

          {error && (
            <div className="bg-red-950/60 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {decodeURIComponent(error)}
            </div>
          )}
          {message && (
            <div className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
              {message}
            </div>
          )}

          <AuthForm />

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <a
            href="/api/auth/google"
            className="w-full border border-zinc-700 text-zinc-300 py-3.5 rounded-lg text-sm hover:border-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            Continue with Google
          </a>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  )
}
