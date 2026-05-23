'use client'

import { useState } from 'react'

export function CheckoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/checkout', { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
    >
      {loading ? 'Redirecting…' : 'Subscribe now'}
    </button>
  )
}
