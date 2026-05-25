import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { db } from '@/utils/db'
import { users } from '@abundanz/shared'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { preferredLanguage } = await request.json() as { preferredLanguage: string | null }

  await db.update(users)
    .set({ preferredLanguage: preferredLanguage })
    .where(eq(users.id, user.id))

  return NextResponse.json({ ok: true })
}
