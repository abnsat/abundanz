import { createClient } from '@/utils/supabase/server'
import { videos, videoReactions, users } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq, ne, and, count } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { VideoPlayer } from '@/app/components/VideoPlayer'
import { isSubscribed } from '@/utils/subscription'
import { Navbar } from '@/app/components/Navbar'
import { ReactionBar } from '@/app/components/ReactionBar'

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

  const related = video.category
    ? await db.select().from(videos).where(and(eq(videos.category, video.category), ne(videos.id, id)))
    : []

  const [userRow] = await db.select({ preferredLanguage: users.preferredLanguage })
    .from(users).where(eq(users.id, user.id))
  const showLanguage = !userRow?.preferredLanguage

  const [[likesRow], [dislikesRow], [userReactionRow]] = await Promise.all([
    db.select({ count: count() }).from(videoReactions)
      .where(and(eq(videoReactions.videoId, id), eq(videoReactions.reaction, 'like'))),
    db.select({ count: count() }).from(videoReactions)
      .where(and(eq(videoReactions.videoId, id), eq(videoReactions.reaction, 'dislike'))),
    db.select({ reaction: videoReactions.reaction }).from(videoReactions)
      .where(and(eq(videoReactions.videoId, id), eq(videoReactions.userId, user.id))),
  ]).catch(() => [[undefined], [undefined], [undefined]])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-20 max-w-5xl mx-auto px-6 pb-16">
        {/* Back */}
        <Link
          href="/"
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
            <ReactionBar
              videoId={id}
              initialLikes={likesRow?.count ?? 0}
              initialDislikes={dislikesRow?.count ?? 0}
              initialUserReaction={(userReactionRow?.reaction ?? null) as 'like' | 'dislike' | null}
            />
          </div>

          {video.description && (
            <p className="text-zinc-400 leading-relaxed text-sm">{video.description}</p>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-base font-semibold tracking-widest uppercase text-zinc-400 mb-6">
              More {video.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((v) => (
                <Link key={v.id} href={`/videos/${v.id}`} className="group">
                  <div className="aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden relative mb-3">
                    {v.thumbnailUrl ? (
                      <Image
                        src={v.thumbnailUrl}
                        alt={v.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="#3f3f46">
                          <path d="M6 4l20 12L6 28V4z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#000" className="ml-0.5">
                          <path d="M3 2l10 6-10 6V2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {v.durationSeconds && (
                      <span className="text-[11px] text-zinc-500">
                        {formatDuration(v.durationSeconds)}
                      </span>
                    )}
                    {showLanguage && v.language && (
                      <span className="text-[10px] font-medium text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-px rounded">
                        {v.language}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors leading-snug line-clamp-2">
                    {v.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
