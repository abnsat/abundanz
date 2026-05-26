'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { LANGUAGES, getSocials } from '@abundanz/shared'

interface NavLink {
  label: string
  href: string
}

interface Props {
  navLinks: NavLink[]
  user: { firstName?: string; email?: string } | null
  preferredLanguage: string | null
}

export function NavbarMobileMenu({ navLinks, user, preferredLanguage }: Props) {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) window.scrollTo(0, -parseInt(scrollY))
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [open])

  async function selectLanguage(lang: string | null) {
    setLangOpen(false)
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLanguage: lang }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col justify-center items-center w-9 h-9 gap-1.5 pointer-events-auto"
        aria-label="Open menu"
      >
        <span className="w-5 h-px bg-white block" />
        <span className="w-5 h-px bg-white block" />
        <span className="w-5 h-px bg-white block" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          {user?.firstName ? (
            <p className="text-white font-semibold">Hi, {user.firstName}</p>
          ) : (
            <p className="text-zinc-400 text-sm">{user?.email ?? 'Menu'}</p>
          )}
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 3l12 12M15 3L3 15"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-4 py-2 gap-1 flex-1 overflow-y-auto">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-lg text-xs font-medium tracking-widest uppercase transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Language section */}
        {user && (
          <div className="px-4 py-3 border-t border-zinc-800">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="w-full flex items-center justify-between text-zinc-400 hover:text-white px-2 py-2 text-sm transition-colors"
              disabled={isPending}
            >
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
                </svg>
                Language
              </span>
              <span className="text-xs text-zinc-500">{preferredLanguage ?? 'All'}</span>
            </button>
            {langOpen && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg bg-zinc-900 border border-zinc-800">
                <button
                  onClick={() => selectLanguage(null)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-zinc-800 transition-colors ${!preferredLanguage ? 'text-white font-medium' : 'text-zinc-400'}`}
                >
                  All Languages
                  {!preferredLanguage && <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => selectLanguage(lang)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-zinc-800 transition-colors ${preferredLanguage === lang ? 'text-white font-medium' : 'text-zinc-400'}`}
                  >
                    {lang}
                    {preferredLanguage === lang && <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Follow us */}
        <div className="px-4 py-3 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest px-2 mb-1">Follow Us</p>
          <div className="flex flex-col">
            {getSocials(preferredLanguage).map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white px-2 py-2 text-sm transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom auth section */}
        <div className="px-4 pt-4 border-t border-zinc-800 flex flex-col gap-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          {user ? (
            <>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 14 14" fill="currentColor">
                  <circle cx="7" cy="4.5" r="2.5"/>
                  <path d="M1.5 12c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"/>
                </svg>
                Account
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 text-red-500 hover:text-red-400 hover:bg-zinc-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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
              onClick={() => setOpen(false)}
              className="w-full text-center bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold px-4 py-3 rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
