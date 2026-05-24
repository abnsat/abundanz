import { createClient } from '@/utils/supabase/server'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { VideoPlayer } from '@/app/components/VideoPlayer'
import { isSubscribed } from '@/utils/subscription'
import { Navbar } from '@/app/components/Navbar'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function VideoPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!await isSubscribed(user.id)) redirect('/pricing')

  const { id } = await params
  const [video] = await db.select().from(videos).where(eq(videos.id, id))
  if (!video) notFound()

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-20 max-w-5xl mx-auto px-6 pb-16">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>

        {/* Player */}
        <div className="rounded-xl overflow-hidden bg-zinc-950 mb-8">
          <VideoPlayer videoId={id} />
        </div>

        {/* Metadata */}
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3 leading-tight">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            {video.category && (
              <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-500 border border-zinc-800 px-2.5 py-1 rounded-sm">
                {video.category}
              </span>
            )}
            {video.durationSeconds && (
              <span className="text-sm text-zinc-500">
                {formatDuration(video.durationSeconds)}
              </span>
            )}
          </div>

          {video.description && (
            <p className="text-zinc-400 leading-relaxed text-sm">{video.description}</p>
          )}
        </div>
      </main>
    </div>
  )
}
