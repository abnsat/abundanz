'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PublicVideo } from '@abundanz/shared'
import { LANGUAGES } from '@abundanz/shared'

const CATEGORIES = ['Movies', 'Documentaries', 'Kids', 'Discipleship']

interface Props {
  initialVideos: PublicVideo[]
}

interface EditState {
  title: string
  description: string
  category: string
  language: string
}

export function VideoList({ initialVideos }: Props) {
  const [videos, setVideos] = useState(initialVideos)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EditState>({ title: '', description: '', category: '', language: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startEdit(video: PublicVideo) {
    setEditingId(video.id)
    setForm({
      title: video.title,
      description: video.description ?? '',
      category: video.category ?? '',
      language: (video as any).language ?? '',
    })
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
  }

  async function saveEdit(id: string) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())

      setVideos(vs => vs.map(v => v.id === id ? { ...v, ...form } : v))
      setEditingId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function deleteVideo(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      setVideos(vs => vs.filter(v => v.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-2">
      {videos.map(video => (
        <div key={video.id} className="border border-zinc-800 rounded-xl overflow-hidden">
          {editingId === video.id ? (
            <div className="p-5 space-y-3">
              <span className="text-xs text-zinc-600 font-mono block truncate">{video.id}</span>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Title</label>
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Category</label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">— none —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Language</label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                  value={form.language}
                  onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                >
                  <option value="">— none —</option>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Description</label>
                <textarea
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 resize-none"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(video.id)}
                  disabled={saving || !form.title.trim()}
                  className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-4">
              {video.thumbnailUrl && (
                <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
                  <Image src={video.thumbnailUrl} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{video.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {video.category && (
                    <span className="text-xs text-zinc-500">{video.category}</span>
                  )}
                  {video.description && (
                    <span className="text-xs text-zinc-700 truncate max-w-xs hidden sm:block">
                      {video.description}
                    </span>
                  )}
                </div>
              </div>
              {video.status === 'processing' && (
                <span className="text-[10px] font-semibold text-amber-400 border border-amber-400/30 px-2 py-1 rounded shrink-0">
                  Encoding
                </span>
              )}
              {video.status === 'error' && (
                <span className="text-[10px] font-semibold text-red-400 border border-red-400/30 px-2 py-1 rounded shrink-0">
                  Failed
                </span>
              )}
              <button
                onClick={() => startEdit(video)}
                className="text-xs text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                Edit
              </button>
              <button
                onClick={() => deleteVideo(video.id, video.title)}
                disabled={deleting === video.id}
                className="text-xs text-zinc-600 hover:text-red-400 border border-zinc-800 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-40"
              >
                {deleting === video.id ? '…' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
