import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { createClient } from './server'
import type { NextRequest } from 'next/server'

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    return user
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
