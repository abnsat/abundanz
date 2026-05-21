import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '@/utils/supabase'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Abundanz</Text>
      <Text style={styles.subtitle}>Videos coming in Phase 2.</Text>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 40,
  },
  signOutText: {
    color: '#71717a',
    fontSize: 14,
  },
})
