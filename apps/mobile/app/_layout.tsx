import 'react-native-url-polyfill/auto'
import { useEffect, useState } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'
import { configurePurchases, loginPurchases, logoutPurchases } from '@/utils/purchases'
import { SessionContext } from '@/utils/session'

configurePurchases()

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loginPurchases(session.user.id).catch(() => {})
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loginPurchases(session.user.id).catch(() => {})
      else logoutPurchases().catch(() => {})
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === undefined) return
    // Only redirect authenticated users away from the login screen.
    // Unauthenticated users can browse the catalog — gating happens per-screen.
    const inAuthGroup = segments[0] === '(auth)'
    if (session && inAuthGroup) {
      router.replace('/(app)')
    }
  }, [session, segments])

  if (session === undefined) return null

  return (
    <SessionContext.Provider value={session}>
      <Slot />
    </SessionContext.Provider>
  )
}
