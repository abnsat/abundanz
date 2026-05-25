import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { isSubscribed } from '@/utils/subscription'
import { db } from '@/utils/db'
import { subscriptions, users } from '@abundanz/shared'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [[sub], [userRow]] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)),
    db.select({ preferredLanguage: users.preferredLanguage }).from(users).where(eq(users.id, user.id)),
  ])
  const subscribed = await isSubscribed(user.id)

  return NextResponse.json({
    email: user.email,
    firstName: user.user_metadata?.first_name ?? null,
    lastName: user.user_metadata?.last_name ?? null,
    isSubscribed: subscribed,
    source: sub?.source ?? null,
    expiresAt: sub?.expiresAt?.toISOString() ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    preferredLanguage: userRow?.preferredLanguage ?? null,
  })
}
