import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { users, videos } from '@abundanz/shared'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Navbar } from '@/app/components/Navbar'
import { VideoList } from './VideoList'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id))
  if (row?.role !== 'admin') redirect('/')

  const allVideos = await db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      category: videos.category,
      language: videos.language,
      thumbnailUrl: videos.thumbnailUrl,
      previewUrl: videos.previewUrl,
      durationSeconds: videos.durationSeconds,
      status: videos.status,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .orderBy(desc(videos.createdAt))

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Video Library</h1>
            <p className="text-zinc-500 text-sm mt-1">{allVideos.length} videos · click Edit to update metadata</p>
          </div>
          <Link
            href="/admin/upload"
            className="bg-white text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-zinc-200 transition-colors shrink-0"
          >
            + Upload
          </Link>
        </div>
        <VideoList initialVideos={allVideos} />
      </main>
    </div>
  )
}
