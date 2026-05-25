import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/actions/auth'
import { NavbarMobileMenu } from './NavbarMobileMenu'
import { LanguagePicker } from './LanguagePicker'
import { SocialMenu } from './SocialMenu'
import { db } from '@/utils/db'
import { users } from '@abundanz/shared'
import { eq } from 'drizzle-orm'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Movies', href: '/?category=Movies' },
  { label: 'Documentaries', href: '/?category=Documentaries' },
  { label: 'Kids', href: '/?category=Kids' },
  { label: 'Discipleship', href: '/?category=Discipleship' },
]

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [userRow] = user
    ? await db.select({ preferredLanguage: users.preferredLanguage }).from(users).where(eq(users.id, user.id))
    : []

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 md:gap-8 px-4 md:px-8 py-3 md:py-4 bg-black/90 pointer-events-none">
      {/* Logo */}
      <Link href="/" className="pointer-events-auto shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AbundanZ" style={{ width: 60, height: 'auto', display: 'block' }} />
      </Link>

      {/* Category nav — desktop only */}
      <div className="hidden md:flex items-center gap-6 flex-1 pointer-events-auto">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors tracking-widest uppercase"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Spacer so right side stays right on mobile */}
      <div className="flex-1 md:hidden" />

      {/* Right side — desktop */}
      <div className="hidden md:flex items-center gap-3 pointer-events-auto">
        {user ? (
          <>
            {user.user_metadata?.first_name && (
              <span className="hidden lg:inline text-sm text-zinc-400 mr-1">
                Hi, {user.user_metadata.first_name}
              </span>
            )}
            <Link
              href="/account"
              className="flex items-center gap-1.5 text-sm text-zinc-300 border border-zinc-700 hover:border-zinc-400 hover:text-white px-3 py-1.5 rounded-full transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
                <circle cx="7" cy="4.5" r="2.5"/>
                <path d="M1.5 12c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" strokeLinecap="round"/>
              </svg>
              Account
            </Link>
            <LanguagePicker currentLanguage={userRow?.preferredLanguage ?? null} />
            <SocialMenu preferredLanguage={userRow?.preferredLanguage ?? null} />
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 px-3 py-1.5 rounded-full border border-transparent hover:border-red-800 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 7h7M9.5 4.5L12 7l-2.5 2.5"/>
                  <path d="M8 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5"/>
                </svg>
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Hamburger — mobile only */}
      <div className="md:hidden pointer-events-auto">
        <NavbarMobileMenu
          navLinks={NAV_LINKS}
          user={user ? {
            firstName: user.user_metadata?.first_name,
            email: user.email,
          } : null}
          preferredLanguage={userRow?.preferredLanguage ?? null}
        />
      </div>
    </nav>
  )
}
