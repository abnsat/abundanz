import { createClient } from '@/utils/supabase/server'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { signOut } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Video } from '@abundanz/shared'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const allVideos = await db.select().from(videos)
  const featured = allVideos[0] ?? null

  const byCategory = allVideos.reduce<Record<string, Video[]>>((acc, v) => {
    const cat = v.category ?? 'Other'
    ;(acc[cat] ??= []).push(v)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
        <span className="text-xl font-bold tracking-tight">Abundanz</span>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">{user.email}</span>
          <Link href="/account" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Account
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Hero */}
      {featured && (
        <Link href={`/videos/${featured.id}`} className="block relative h-[56vw] max-h-[600px] min-h-[300px] overflow-hidden group">
          {featured.thumbnailUrl ? (
            <Image
              src={featured.thumbnailUrl}
              alt={featured.title}
              fill
              className="object-cover opacity-60 group-hover:opacity-70 transition-opacity"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-3">{featured.title}</h1>
            {featured.description && (
              <p className="text-zinc-300 text-base line-clamp-2">{featured.description}</p>
            )}
            <div className="mt-4 inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded text-sm group-hover:bg-zinc-200 transition-colors">
              ▶ Play
            </div>
          </div>
        </Link>
      )}

      {/* Category rows */}
      <main className="px-8 py-8 space-y-10">
        {allVideos.length === 0 && (
          <p className="text-zinc-500">No videos yet. Upload some in Bunny.net and seed the database.</p>
        )}
        {Object.entries(byCategory).map(([category, categoryVideos]) => (
          <section key={category}>
            <h2 className="text-lg font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categoryVideos.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`} className="group">
                  <div className="aspect-video bg-zinc-800 rounded-md overflow-hidden relative mb-2">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-2xl">▶</div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">
                    {video.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
