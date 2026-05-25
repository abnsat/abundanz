'use client'

import { useState } from 'react'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })

    if (res.ok) {
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm px-5 py-4 rounded-lg">
        Message sent! We'll be in touch soon.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {status === 'error' && (
        <div className="bg-red-950/60 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Message</label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="How can we help?"
          className="bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-semibold py-3 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
