import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { supabase } from '@/utils/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert('Sign in failed', error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert('Sign up failed', error.message)
    else Alert.alert('Check your email', 'Confirmation link sent.')
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Abundanz</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#71717a"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#71717a"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={signInWithEmail}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonOutline, loading && styles.buttonDisabled]}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          <Text style={styles.buttonOutlineText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#27272a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
})
