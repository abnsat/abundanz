import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native'
import { LANGUAGES, getSocials } from '@abundanz/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href, useFocusEffect } from 'expo-router'
import { supabase } from '@/utils/supabase'
import { api } from '@/utils/api'
import { checkEntitlement } from '@/utils/purchases'
import { useSession } from '@/utils/session'

type AccountData = Awaited<ReturnType<typeof api.getAccount>>

const MANAGE_URLS: Record<string, string> = {
  apple: 'https://apps.apple.com/account/subscriptions',
  google: 'https://play.google.com/store/account/subscriptions',
  stripe: 'https://abundanz.ai/account',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function AccountScreen() {
  const [account, setAccount] = useState<AccountData | null>(null)
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [langModalOpen, setLangModalOpen] = useState(false)
  const [savingLang, setSavingLang] = useState(false)
  const session = useSession()
  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      if (!session) return
      setLoading(true)

      // Check subscription directly from RevenueCat SDK — most reliable source
      checkEntitlement()
        .then(setIsSubscribed)
        .catch(() => setIsSubscribed(false))

      // Fetch supplementary details (expiry, source, name) from API
      api.getAccount()
        .then(setAccount)
        .catch(() => {})
        .finally(() => setLoading(false))
    }, [session])
  )

  function manageSubscription() {
    const url = (account?.source && MANAGE_URLS[account.source]) ?? MANAGE_URLS.apple
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open', 'Visit abundanz.ai/account to manage your subscription.')
    })
  }

  async function selectLanguage(lang: string | null) {
    setSavingLang(true)
    try {
      await api.updatePreferences({ preferredLanguage: lang })
      setAccount(a => a ? { ...a, preferredLanguage: lang } : a)
    } catch {}
    finally {
      setSavingLang(false)
      setLangModalOpen(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.guestTitle}>Sign in to view your account</Text>
          <Text style={styles.guestSub}>Access your subscription and manage your profile.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login' as Href)} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const name = [account?.firstName, account?.lastName].filter(Boolean).join(' ')
  const subscribed = account?.isSubscribed ?? isSubscribed ?? false

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {account?.firstName?.[0]?.toUpperCase() ?? account?.email?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            <Text style={styles.email}>{account?.email ?? session.user.email}</Text>
          </View>
        </View>

        {/* Subscription card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Subscription</Text>

          {loading && isSubscribed === null ? (
            <ActivityIndicator color="#52525b" style={{ marginTop: 12 }} />
          ) : subscribed ? (
            <View style={styles.cardBody}>
              <View style={styles.statusRow}>
                <View style={styles.dot} />
                <Text style={styles.statusText}>Active</Text>
                {account?.source && (
                  <View style={styles.sourcePill}>
                    <Text style={styles.sourceText}>{account.source}</Text>
                  </View>
                )}
              </View>

              {account?.expiresAt && (
                <Text style={styles.renewalText}>
                  {account.cancelAtPeriodEnd ? 'Expires' : 'Renews'} {formatDate(account.expiresAt)}
                </Text>
              )}

              {account?.cancelAtPeriodEnd && (
                <Text style={styles.cancelNote}>
                  Cancellation scheduled — access until expiry date above.
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.cardBody}>
              <View style={styles.statusRow}>
                <View style={[styles.dot, styles.dotInactive]} />
                <Text style={styles.statusInactive}>No active subscription</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(app)/paywall' as Href)}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Actions */}
        {subscribed && account?.source === 'stripe' ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Manage Subscription</Text>
            <Text style={styles.manageNote}>
              Your subscription is billed via the web. Visit{' '}
              <Text style={styles.manageLink} onPress={manageSubscription}>abundanz.ai/account</Text>
              {' '}to cancel or update billing.
            </Text>
          </View>
        ) : subscribed && (account?.source === 'apple' || account?.source === 'google') ? (
          <View style={styles.section}>
            <TouchableOpacity style={styles.row} onPress={manageSubscription} activeOpacity={0.7}>
              <Text style={styles.rowText}>
                {account.source === 'apple' ? 'Manage in App Store' : 'Manage in Play Store'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Follow us */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Follow Us</Text>
          <View style={styles.cardBody}>
            {getSocials(account?.preferredLanguage ?? null).map(({ label, href }) => (
              <TouchableOpacity
                key={label}
                style={styles.socialRow}
                onPress={() => Linking.openURL(href).catch(() => {})}
                activeOpacity={0.7}
              >
                <Text style={styles.socialLabel}>{label}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setLangModalOpen(true)} activeOpacity={0.7} disabled={savingLang}>
            <Text style={styles.rowText}>Language</Text>
            <Text style={styles.rowValue}>{account?.preferredLanguage ?? 'All'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={signOut} activeOpacity={0.7}>
            <Text style={styles.danger}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Language picker modal */}
      <Modal visible={langModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLangModalOpen(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Language</Text>
            <TouchableOpacity onPress={() => setLangModalOpen(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={[null, ...LANGUAGES]}
            keyExtractor={(item) => item ?? '__all__'}
            renderItem={({ item }) => {
              const isSelected = item === null
                ? !account?.preferredLanguage
                : account?.preferredLanguage === item
              return (
                <TouchableOpacity
                  style={styles.langRow}
                  onPress={() => selectLanguage(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langText, isSelected && styles.langTextActive]}>
                    {item ?? 'All Languages'}
                  </Text>
                  {isSelected && <Text style={styles.langCheck}>✓</Text>}
                </TouchableOpacity>
              )
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 32 },
  guestTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  guestSub: { color: '#52525b', fontSize: 14, textAlign: 'center', marginBottom: 8 },

  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#27272a',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 2 },
  email: { color: '#52525b', fontSize: 13 },

  card: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: { color: '#52525b', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  cardBody: { gap: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  dotInactive: { backgroundColor: '#3f3f46' },
  statusText: { color: '#e4e4e7', fontSize: 15, fontWeight: '600' },
  statusInactive: { color: '#52525b', fontSize: 15 },
  sourcePill: {
    backgroundColor: '#27272a', borderRadius: 6,
    paddingVertical: 2, paddingHorizontal: 8,
  },
  sourceText: { color: '#71717a', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  renewalText: { color: '#71717a', fontSize: 13 },
  cancelNote: { color: '#52525b', fontSize: 12, lineHeight: 18 },
  manageNote: { color: '#71717a', fontSize: 13, lineHeight: 20 },
  manageLink: { color: '#a1a1aa', textDecorationLine: 'underline' },

  section: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 16,
  },
  rowText: { color: '#e4e4e7', fontSize: 15, fontWeight: '500' },
  chevron: { color: '#52525b', fontSize: 20 },
  danger: { color: '#f87171', fontSize: 15, fontWeight: '500' },
  rowValue: { color: '#71717a', fontSize: 14 },
  socialRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8,
  },
  socialLabel: { color: '#e4e4e7', fontSize: 14, fontWeight: '500' },

  button: { width: 130, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },

  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#27272a',
  },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  modalClose: { color: '#a1a1aa', fontSize: 15 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  langText: { color: '#71717a', fontSize: 15 },
  langTextActive: { color: '#fff', fontWeight: '600' },
  langCheck: { color: '#fff', fontSize: 16 },
  separator: { height: 1, backgroundColor: '#18181b', marginHorizontal: 20 },
})
