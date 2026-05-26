import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { db } from '@/utils/db'
import { videoReactions } from '@abundanz/shared'
import { eq, and, count } from 'drizzle-orm'
import { isSubscribed } from '@/utils/subscription'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isSubscribed(user.id)) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { reaction } = await req.json() as { reaction: 'like' | 'dislike' | null }

  if (reaction === null) {
    await db.delete(videoReactions)
      .where(and(eq(videoReactions.userId, user.id), eq(videoReactions.videoId, id)))
  } else {
    await db.insert(videoReactions)
      .values({ userId: user.id, videoId: id, reaction })
      .onConflictDoUpdate({
        target: [videoReactions.userId, videoReactions.videoId],
        set: { reaction },
      })
  }

  const [likesRow] = await db
    .select({ count: count() })
    .from(videoReactions)
    .where(and(eq(videoReactions.videoId, id), eq(videoReactions.reaction, 'like')))

  const [dislikesRow] = await db
    .select({ count: count() })
    .from(videoReactions)
    .where(and(eq(videoReactions.videoId, id), eq(videoReactions.reaction, 'dislike')))

  return NextResponse.json({
    likes: likesRow?.count ?? 0,
    dislikes: dislikesRow?.count ?? 0,
    userReaction: reaction,
  })
}
