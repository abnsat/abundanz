import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { isSubscribed } from '@/utils/subscription'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscribed = await isSubscribed(user.id)
  return NextResponse.json({ isSubscribed: subscribed })
}
