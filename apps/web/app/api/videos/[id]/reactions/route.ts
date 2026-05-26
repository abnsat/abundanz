import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { db } from '@/utils/db'
import { videoReactions } from '@abundanz/shared'
import { eq, and, count } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const user = await getUserFromRequest(req)

  const [likesRow] = await db
    .select({ count: count() })
    .from(videoReactions)
    .where(and(eq(videoReactions.videoId, id), eq(videoReactions.reaction, 'like')))

  const [dislikesRow] = await db
    .select({ count: count() })
    .from(videoReactions)
    .where(and(eq(videoReactions.videoId, id), eq(videoReactions.reaction, 'dislike')))

  let userReaction: 'like' | 'dislike' | null = null
  if (user) {
    const [existing] = await db
      .select({ reaction: videoReactions.reaction })
      .from(videoReactions)
      .where(and(eq(videoReactions.videoId, id), eq(videoReactions.userId, user.id)))
    userReaction = (existing?.reaction ?? null) as 'like' | 'dislike' | null
  }

  return NextResponse.json({
    likes: likesRow?.count ?? 0,
    dislikes: dislikesRow?.count ?? 0,
    userReaction,
  })
}
