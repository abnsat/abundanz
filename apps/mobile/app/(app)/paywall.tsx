import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native'
import Purchases, { PurchasesPackage } from 'react-native-purchases'
import { api } from '@/utils/api'
import { useRouter } from 'expo-router'

export default function PaywallScreen() {
  const router = useRouter()
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => {
        const monthly = offerings.current?.monthly ?? offerings.current?.availablePackages[0] ?? null
        setPkg(monthly)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function purchase() {
    if (!pkg) return
    setPurchasing(true)
    try {
      await Purchases.purchasePackage(pkg)
      // Sync to DB immediately so the stream API doesn't rely on webhook timing
      await api.syncSubscription().catch(() => {})
      // Go back to whatever screen triggered the paywall (video screen re-checks on focus)
      router.back()
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string }
      if (!err.userCancelled) {
        Alert.alert('Purchase failed', err.message ?? 'Please try again.')
      }
    } finally {
      setPurchasing(false)
    }
  }

  async function restore() {
    setRestoring(true)
    try {
      const info = await Purchases.restorePurchases()
      const entitlementId = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID!
      if (!info.entitlements.active[entitlementId]) {
        Alert.alert('No subscription found', 'No active subscription was found for this Apple ID.')
      }
      // If restored successfully, _layout.tsx will re-route
    } catch (e: unknown) {
      Alert.alert('Restore failed', (e as Error).message ?? 'Please try again.')
    } finally {
      setRestoring(false)
    }
  }

  const price = pkg?.product.priceString ?? '—'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Abundanz</Text>
      <Text style={styles.subtitle}>Unlimited access to all content</Text>

      <View style={styles.features}>
        {['Stream all videos', 'New content added regularly', 'Cancel anytime'].map((f) => (
          <Text key={f} style={styles.feature}>✓  {f}</Text>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={styles.loader} />
      ) : (
        <TouchableOpacity
          style={[styles.button, purchasing && styles.buttonDisabled]}
          onPress={purchase}
          disabled={purchasing || !pkg}
        >
          {purchasing
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.buttonText}>Subscribe · {price}/month</Text>
          }
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={restore}
        disabled={restoring}
      >
        <Text style={styles.restoreText}>
          {restoring ? 'Restoring…' : 'Restore purchases'}
        </Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: { color: '#fff', fontSize: 34, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#a1a1aa', fontSize: 16, marginBottom: 40, textAlign: 'center' },
  features: { gap: 12, marginBottom: 40, alignSelf: 'stretch' },
  feature: { color: '#e4e4e7', fontSize: 15 },
  loader: { marginBottom: 24 },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 16 },
  restoreButton: { marginBottom: 32 },
  restoreText: { color: '#71717a', fontSize: 14 },
})
