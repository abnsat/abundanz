import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { supabase } from '@/utils/supabase'
import { api } from '@/utils/api'
import { useSession } from '@/utils/session'

export default function AccountScreen() {
  const [subscribed, setSubscribed] = useState<boolean | null>(null)
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) return
    api.getSubscription()
      .then(({ isSubscribed }) => setSubscribed(isSubscribed))
      .catch(() => setSubscribed(false))
  }, [session])

  function manageSubscription() {
    Linking.openURL('https://apps.apple.com/account/subscriptions').catch(() => {
      Alert.alert('Could not open', 'Go to iOS Settings → Apple ID → Subscriptions.')
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestWrap}>
          <Text style={styles.guestTitle}>Sign in to view your account</Text>
          <Text style={styles.guestSub}>Access your subscription and manage your profile.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login' as Href)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        {session.user.email && <Text style={styles.email}>{session.user.email}</Text>}
      </View>

      {/* Subscription status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Plan</Text>
          {subscribed === null ? (
            <ActivityIndicator size="small" color="#52525b" />
          ) : (
            <View style={[styles.badge, subscribed ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={[styles.badgeText, subscribed ? styles.badgeTextActive : styles.badgeTextInactive]}>
                {subscribed ? 'Active' : 'No subscription'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={manageSubscription} activeOpacity={0.7}>
          <Text style={styles.rowText}>Manage Subscription</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={signOut} activeOpacity={0.7}>
          <Text style={[styles.rowText, styles.danger]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20 },
  guestWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  guestTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  guestSub: { color: '#52525b', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  button: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  header: { paddingTop: 16, marginBottom: 32 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  email: { color: '#52525b', fontSize: 13 },

  statusCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 16,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statusLabel: { color: '#e4e4e7', fontSize: 15, fontWeight: '500' },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10 },
  badgeActive: { backgroundColor: '#14532d' },
  badgeInactive: { backgroundColor: '#27272a' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: '#4ade80' },
  badgeTextInactive: { color: '#52525b' },

  section: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rowText: { color: '#e4e4e7', fontSize: 15, fontWeight: '500' },
  chevron: { color: '#52525b', fontSize: 20 },
  danger: { color: '#f87171' },
})
