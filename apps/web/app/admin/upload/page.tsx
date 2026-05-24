import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { users } from '@abundanz/shared'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Navbar } from '@/app/components/Navbar'
import { UploadForm } from './UploadForm'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id))
  if (row?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-lg mx-auto px-6 pt-28 pb-16">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-8 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to library
        </Link>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Upload video</h1>
          <p className="text-zinc-500 text-sm mt-1">Video encodes on Bunny.net after upload — usually ready within a few minutes.</p>
        </div>
        <UploadForm />
      </main>
    </div>
  )
}
