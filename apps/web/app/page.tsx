import { createClient } from '@/utils/supabase/server'
import { videos, users } from '@abundanz/shared'
import { db } from '@/utils/db'
import { desc, eq, and } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import type { Video } from '@abundanz/shared'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function CatalogPage({ searchParams }: Props) {
  // User is optional — unauthenticated users can browse freely
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { category: activeCategory } = await searchParams

  const [userRow] = user
    ? await db.select({ preferredLanguage: users.preferredLanguage }).from(users).where(eq(users.id, user.id))
    : []
  const languageFilter = userRow?.preferredLanguage ?? null

  const whereClause = languageFilter
    ? and(eq(videos.status, 'ready'), eq(videos.language, languageFilter))
    : eq(videos.status, 'ready')
  const allVideos = await db.select().from(videos).where(whereClause).orderBy(desc(videos.createdAt))

  const byCategory = allVideos.reduce<Record<string, Video[]>>((acc, v) => {
    const cat = v.category ?? 'Other'
    ;(acc[cat] ??= []).push(v)
    return acc
  }, {})

  // Case-insensitive category key lookup
  function findCategoryVideos(cat: string): Video[] {
    const key = Object.keys(byCategory).find(k => k.toLowerCase() === cat.toLowerCase())
    return key ? byCategory[key] : []
  }

  const CATEGORY_ORDER = ['Movies', 'Documentaries', 'Kids', 'Discipleship']

  const displayCategories = activeCategory
    ? { [activeCategory]: findCategoryVideos(activeCategory) }
    : Object.fromEntries(
        Object.entries(byCategory).sort(([a], [b]) => {
          const ai = CATEGORY_ORDER.indexOf(a)
          const bi = CATEGORY_ORDER.indexOf(b)
          if (ai !== -1 && bi !== -1) return ai - bi
          if (ai !== -1) return -1
          if (bi !== -1) return 1
          return 0
        })
      )

  const featuredPool = activeCategory ? findCategoryVideos(activeCategory) : allVideos
  const featured = featuredPool[0] ?? null

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      {featured && (
        <div className="relative h-[70vh] sm:h-screen overflow-hidden">
          {featured.previewUrl ? (
            <img
              src={featured.previewUrl}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : featured.thumbnailUrl ? (
            <Image
              src={featured.thumbnailUrl}
              alt={featured.title}
              fill
              className="object-cover object-center"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

           <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 sm:px-12 sm:pb-20 sm:max-w-2xl sm:right-auto">
            <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase border border-white/40 text-white/80 px-2.5 py-1 rounded-sm mb-3 sm:mb-5">
              New Release
            </span>

            <h1 className="text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight mb-3 sm:mb-4">
              {featured.title}
            </h1>

            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              {featured.category && (
                <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
                  {featured.category}
                </span>
              )}
              {featured.category && featured.durationSeconds && (
                <span className="text-zinc-600">·</span>
              )}
              {featured.durationSeconds && (
                <span className="text-xs text-zinc-400">
                  {formatDuration(featured.durationSeconds)}
                </span>
              )}
              {!languageFilter && featured.language && (
                <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded-sm">
                  {featured.language}
                </span>
              )}
            </div>

            {featured.description && (
              <p className="hidden sm:block text-zinc-300 text-sm leading-relaxed line-clamp-2 mb-8 max-w-sm">
                {featured.description}
              </p>
            )}

            <Link
              href={user ? `/videos/${featured.id}` : '/login'}
              className="inline-flex items-center gap-2.5 bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-bold px-8 py-3.5 rounded text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 1.5l10 5.5-10 5.5V1.5z" />
              </svg>
              Watch
            </Link>
          </div>
        </div>
      )}

      {/* ── Category rows ───────────────────────────────────────── */}
      <div className="bg-black px-4 sm:px-12 pb-10 space-y-8">
        {allVideos.length === 0 && (
          <p className="text-zinc-600 text-sm">No videos yet.</p>
        )}

        {Object.entries(displayCategories).map(([category, categoryVideos]) => {
          const total = categoryVideos.length
          // On the category page (activeCategory set) show everything; on home show one row max
          const rowVideos = activeCategory ? categoryVideos : categoryVideos.slice(0, 6)
          // "See all" is hidden once all videos fit at that breakpoint.
          // count ≤ 3 → never needed; 4 → hide at sm+; 5 → hide at md+; 6 → hide at lg+; >6 → always visible
          const seeAllHide =
            total <= 3 ? 'hidden' :
            total === 4 ? 'sm:hidden' :
            total === 5 ? 'md:hidden' :
            total === 6 ? 'lg:hidden' : ''

          return (
          <section key={category}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold tracking-widest uppercase text-zinc-400">
                {category}
              </h2>
              {!activeCategory && total > 3 && (
                <Link
                  href={`/?category=${encodeURIComponent(category)}`}
                  className={`flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0 group ${seeAllHide}`}
                >
                  See all
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                    <path d="M2 7h10M8 3l4 4-4 4"/>
                  </svg>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-5">
              {rowVideos.map((video, index) => {
                // Hide cards that overflow one row — only on the home page, never on the category page
                const cardHide = activeCategory ? '' :
                  index === 3 ? 'hidden sm:block' :
                  index === 4 ? 'hidden md:block' :
                  index === 5 ? 'hidden lg:block' : ''

                return (
                <Link
                  key={video.id}
                  href={user ? `/videos/${video.id}` : '/login'}
                  className={`group ${cardHide}`}
                >
                  <div className="aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden relative mb-3">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="#3f3f46">
                          <path d="M6 4l20 12L6 28V4z" />
                        </svg>
                      </div>
                    )}

                    {/* Lock overlay for unauthenticated users */}
                    {!user && (
                      <div className="absolute inset-0 bg-black/40 flex items-end justify-start p-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="2" y="6" width="10" height="7" rx="1.5" fill="#71717a"/>
                          <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}

                    {/* Play overlay on hover (authenticated) */}
                    {user && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="#000" className="ml-1">
                            <path d="M3 2l10 6-10 6V2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    {video.durationSeconds && (
                      <span className="text-[11px] text-zinc-500">
                        {formatDuration(video.durationSeconds)}
                      </span>
                    )}
                    {!languageFilter && video.language && (
                      <span className="text-[10px] font-medium text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-px rounded">
                        {video.language}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-300 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                    {video.title}
                  </p>
                </Link>
                )
              })}
            </div>
          </section>
          )
        })}
      </div>

      <Footer preferredLanguage={languageFilter} />
    </div>
  )
}
