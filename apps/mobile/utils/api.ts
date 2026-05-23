import { createApiClient } from '@abundanz/shared'
import { supabase } from './supabase'

export const api = createApiClient(
  process.env.EXPO_PUBLIC_API_URL!,
  async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }
)
