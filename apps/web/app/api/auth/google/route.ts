import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return (request.headers.get('cookie') ?? '')
            .split(';')
            .filter(Boolean)
            .map((c) => {
              const [name, ...rest] = c.trim().split('=')
              return { name: name.trim(), value: rest.join('=') }
            })
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', process.env.NEXT_PUBLIC_APP_URL)
    )
  }

  const response = NextResponse.redirect(data.url)
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })
  return response
}
