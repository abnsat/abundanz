'use client'

import { useState } from 'react'

interface AdminUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
}

interface Props {
  initialAdmins: AdminUser[]
  currentUserId: string
}

export function AdminUsers({ initialAdmins, currentUserId }: Props) {
  const [admins, setAdmins] = useState(initialAdmins)
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAdmins(prev => [...prev, data.user])
      setEmail('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add admin')
    } finally {
      setAdding(false)
    }
  }

  async function removeAdmin(id: string) {
    setRemoving(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAdmins(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove admin')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div>
      {/* Add admin form */}
      <form onSubmit={addAdmin} className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 shrink-0"
        >
          {adding ? 'Adding…' : 'Add admin'}
        </button>
      </form>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      {/* Admin list */}
      <div className="space-y-2">
        {admins.length === 0 && (
          <p className="text-xs text-zinc-600">No admins found.</p>
        )}
        {admins.map(user => (
          <div key={user.id} className="flex items-center gap-3 border border-zinc-800 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.first_name || user.last_name
                  ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                  : user.email}
              </p>
              {(user.first_name || user.last_name) && (
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              )}
            </div>
            {user.id === currentUserId ? (
              <span className="text-[10px] text-zinc-600 border border-zinc-800 px-2 py-1 rounded shrink-0">You</span>
            ) : (
              <button
                onClick={() => removeAdmin(user.id)}
                disabled={removing === user.id}
                className="text-xs text-zinc-600 hover:text-red-400 border border-zinc-800 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-40"
              >
                {removing === user.id ? '…' : 'Remove'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
