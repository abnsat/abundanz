'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createBaseClient } from '@supabase/supabase-js'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) redirect('/login?error=oauth_failed')
  if (data.url) redirect(data.url)
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  redirect('/dashboard')
}

export async function signUpWithEmail(formData: FormData) {
  // Implicit flow so Supabase generates a plain token hash (not pkce_-prefixed).
  // PKCE tokens require the originating device's verifier, breaking cross-device confirmation.
  const supabase = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: 'implicit', persistSession: false } }
  )
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = (formData.get('firstName') as string | null)?.trim() ?? ''
  const lastName = (formData.get('lastName') as string | null)?.trim() ?? ''

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  })

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=Check your email to confirm your account')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function sendPasswordReset(formData: FormData) {
  // Use implicit flow so the token_hash has no pkce_ prefix — same reason as signUpWithEmail.
  // PKCE tokens require the originating device's verifier cookie, which doesn't exist cross-device.
  const supabase = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: 'implicit', persistSession: false } }
  )
  const email = formData.get('email') as string

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  })
  // Always show success — never reveal whether the email exists
  redirect('/forgot-password?message=If+an+account+exists+for+that+email%2C+a+reset+link+is+on+its+way.')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)

  await supabase.auth.signOut()
  redirect('/login?message=Password+updated.+Please+sign+in+with+your+new+password.')
}
