import 'react-native-url-polyfill/auto'
import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
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
    const inAuthGroup = segments[0] === '(auth)'
    if (session && inAuthGroup) {
      // If login was opened as a sheet over the catalog, just dismiss it.
      // Otherwise (cold launch with no prior screen), replace with the app.
      if (router.canGoBack()) router.back()
      else router.replace('/(app)')
    }
  }, [session, segments])

  if (session === undefined) return null

  return (
    <SessionContext.Provider value={session}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="videos/[id]" />
        <Stack.Screen
          name="(auth)/login"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </SessionContext.Provider>
  )
}
