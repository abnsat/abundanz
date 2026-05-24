import { NextRequest, NextResponse } from 'next/server'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { sql, desc } from 'drizzle-orm'

const { bunnyVideoId: _omit, ...publicColumns } = videos

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category')
  const rows = category
    ? await db.select(publicColumns).from(videos)
        .where(sql`lower(${videos.category}) = lower(${category})`)
        .orderBy(desc(videos.createdAt))
    : await db.select(publicColumns).from(videos).orderBy(desc(videos.createdAt))

  return NextResponse.json({ videos: rows })
}
