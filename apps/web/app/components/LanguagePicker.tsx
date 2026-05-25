'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LANGUAGES } from '@abundanz/shared'

interface Props {
  currentLanguage: string | null
}

export function LanguagePicker({ currentLanguage }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function select(lang: string | null) {
    setOpen(false)
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLanguage: lang }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors disabled:opacity-50 ${
          currentLanguage
            ? 'border-zinc-500 text-white'
            : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-white'
        }`}
        title="Language"
      >
        <GlobeIcon />
        <span className="text-xs max-w-[80px] truncate">{currentLanguage ?? 'All Languages'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="max-h-72 overflow-y-auto">
            <button
              onClick={() => select(null)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800 flex items-center justify-between ${
                !currentLanguage ? 'text-white font-medium' : 'text-zinc-400'
              }`}
            >
              All Languages
              {!currentLanguage && <CheckIcon />}
            </button>
            <div className="border-t border-zinc-800" />
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => select(lang)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800 flex items-center justify-between ${
                  currentLanguage === lang ? 'text-white font-medium' : 'text-zinc-400'
                }`}
              >
                {lang}
                {currentLanguage === lang && <CheckIcon />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
