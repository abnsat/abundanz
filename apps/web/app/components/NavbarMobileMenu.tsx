'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'

interface NavLink {
  label: string
  href: string
}

interface Props {
  navLinks: NavLink[]
  user: { firstName?: string; email?: string } | null
}

export function NavbarMobileMenu({ navLinks, user }: Props) {
  const [open, setOpen] = useState(false)

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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
        <nav className="flex flex-col px-4 py-4 gap-1 flex-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg text-sm font-medium tracking-widest uppercase transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom auth section */}
        <div className="px-4 pb-8 pt-4 border-t border-zinc-800 flex flex-col gap-2">
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
                  className="w-full flex items-center gap-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
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
