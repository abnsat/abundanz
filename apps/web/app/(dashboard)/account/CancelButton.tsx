'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CancelButton() {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    if (!confirmed) {
      setConfirmed(true)
      return
    }
    setLoading(true)
    await fetch('/api/subscription/cancel', { method: 'POST' })
    setCancelled(true)
    setLoading(false)
    router.refresh()
  }

  if (cancelled) {
    return (
      <p className="text-xs text-zinc-500">Cancellation scheduled — access until expiry date above.</p>
    )
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
    >
      {loading ? 'Cancelling…' : confirmed ? 'Tap again to confirm cancellation' : 'Cancel subscription'}
    </button>
  )
}
