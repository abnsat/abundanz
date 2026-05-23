import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

function clearVerifierCookies(response: NextResponse, request: NextRequest) {
  // Wipe any Supabase auth/verifier cookies so the next attempt starts clean
  for (const cookie of request.cookies.getAll()) {
    if (/^sb-.*(code-verifier|auth-token)/.test(cookie.name)) {
      response.cookies.delete(cookie.name)
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[auth/callback] params:', {
    hasCode: !!code,
    hasTokenHash: !!token_hash,
    type,
    cookieNames: request.cookies.getAll().map((c) => c.name),
  })

  // Email confirmation, magic link, password reset — works cross-device
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] verifyOtp error:', error)
    const response = NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Confirmation link is invalid or has expired. Please try again.')}`
    )
    clearVerifierCookies(response, request)
    return response
  }

  // OAuth PKCE flow (Google etc.)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] exchangeCodeForSession error:', error)
    const isPkceError = /pkce|verifier/i.test(error.message)
    const message = isPkceError
      ? 'Sign-in session expired. Please try signing in again.'
      : error.message
    const response = NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    )
    if (isPkceError) clearVerifierCookies(response, request)
    return response
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
