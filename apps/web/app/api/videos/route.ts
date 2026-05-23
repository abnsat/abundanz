import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const category = request.nextUrl.searchParams.get('category')
  const rows = category
    ? await db.select().from(videos).where(eq(videos.category, category))
    : await db.select().from(videos)

  return NextResponse.json({ videos: rows })
}
