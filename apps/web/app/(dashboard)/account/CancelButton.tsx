'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CancelButton() {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    if (!confirmed) {
      setConfirmed(true)
      return
    }
    setLoading(true)
    await fetch('/api/subscription/cancel', { method: 'POST' })
    router.refresh()
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
