import { createClient } from '@/utils/supabase/server'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { VideoPlayer } from '@/app/components/VideoPlayer'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VideoPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const [video] = await db.select().from(videos).where(eq(videos.id, id))
  if (!video) notFound()

  const minutes = video.durationSeconds ? Math.floor(video.durationSeconds / 60) : null
  const seconds = video.durationSeconds ? video.durationSeconds % 60 : null
  const duration = minutes !== null && seconds !== null
    ? `${minutes}:${String(seconds).padStart(2, '0')}`
    : null

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-zinc-300 transition-colors">
          Abundanz
        </Link>
        <span className="text-zinc-400 text-sm">{user.email}</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <VideoPlayer videoId={id} />

        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          <div className="flex items-center gap-3 text-sm text-zinc-400 mb-4">
            {video.category && <span>{video.category}</span>}
            {duration && <span>{duration}</span>}
          </div>
          {video.description && (
            <p className="text-zinc-300 leading-relaxed">{video.description}</p>
          )}
        </div>
      </main>
    </div>
  )
}
