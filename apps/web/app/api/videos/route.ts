import { NextRequest, NextResponse } from 'next/server'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { sql } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category')
  const rows = category
    ? await db.select().from(videos)
        .where(sql`lower(${videos.category}) = lower(${category})`)
        .orderBy(desc(videos.createdAt))
    : await db.select().from(videos).orderBy(desc(videos.createdAt))

  return NextResponse.json({ videos: rows })
}
