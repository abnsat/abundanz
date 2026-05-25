import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { videos, users } from '@abundanz/shared'
import { db } from '@/utils/db'
import { sql, desc, eq, and } from 'drizzle-orm'

const publicColumns = {
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
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category')

  const user = await getUserFromRequest(request)
  let languageFilter: string | null = null
  if (user) {
    const [row] = await db.select({ preferredLanguage: users.preferredLanguage })
      .from(users).where(eq(users.id, user.id))
    languageFilter = row?.preferredLanguage ?? null
  }

  const conditions = []
  if (category) conditions.push(sql`lower(${videos.category}) = lower(${category})`)
  if (languageFilter) conditions.push(eq(videos.language, languageFilter))

  const rows = await db.select(publicColumns).from(videos)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(videos.createdAt))

  return NextResponse.json({ videos: rows })
}
