import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/utils/supabase'

const IOS_SUBSCRIPTION_MANAGEMENT_URL = 'https://apps.apple.com/account/subscriptions'

export default function SettingsScreen() {
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
  }

  function manageSubscription() {
    Linking.openURL(IOS_SUBSCRIPTION_MANAGEMENT_URL).catch(() => {
      Alert.alert('Could not open', 'Go to iOS Settings → Apple ID → Subscriptions to manage your plan.')
    })
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={manageSubscription}>
          <Text style={styles.rowText}>Manage subscription</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={signOut}>
          <Text style={[styles.rowText, styles.danger]}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  back: { paddingTop: 60, paddingBottom: 8 },
  backText: { color: '#a1a1aa', fontSize: 15 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 16, marginBottom: 32 },
  section: {
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#18181b',
  },
  rowText: { color: '#e4e4e7', fontSize: 15 },
  chevron: { color: '#52525b', fontSize: 18 },
  danger: { color: '#f87171' },
})
