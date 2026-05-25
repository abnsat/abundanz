import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSession } from '@/utils/session'

export default function ContactScreen() {
  const session = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(session?.user.email ?? '')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('All fields are required.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Message sent!</Text>
          <Text style={styles.successSub}>We'll get back to you as soon as possible.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>We'd love to hear from you.</Text>

          {status === 'error' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#52525b"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#52525b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={message}
              onChangeText={setMessage}
              placeholder="How can we help?"
              placeholderTextColor="#52525b"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, status === 'loading' && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={status === 'loading'}
            activeOpacity={0.85}
          >
            {status === 'loading'
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.buttonText}>Send Message</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  back: { color: '#a1a1aa', fontSize: 16 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#52525b', fontSize: 14, marginBottom: 24 },

  errorBox: {
    backgroundColor: 'rgba(127,29,29,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(153,27,27,0.4)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: { color: '#f87171', fontSize: 13 },

  field: { marginBottom: 16 },
  label: { color: '#71717a', fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 15,
  },
  textarea: { height: 120, paddingTop: 13 },

  button: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 10 },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  successSub: { color: '#52525b', fontSize: 14, textAlign: 'center', marginBottom: 8 },
})
