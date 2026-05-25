'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { PublicVideo } from '@abundanz/shared'
import { LANGUAGES } from '@abundanz/shared'

const CATEGORIES = ['Movies', 'Documentaries', 'Kids', 'Discipleship']
const CATEGORY_ORDER = [...CATEGORIES, 'Uncategorized']

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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  async function syncDurations() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/videos/sync-metadata', { method: 'POST' })
      const data = await res.json()
      setSyncResult(`Updated ${data.updated} of ${data.total} videos`)
      if (data.updated > 0) window.location.reload()
    } catch {
      setSyncResult('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  function startEdit(video: PublicVideo) {
    setEditingId(video.id)
    setForm({
      title: video.title,
      description: video.description ?? '',
      category: video.category ?? '',
      language: (video as any).language ?? '',
    })
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setError(null)
  }

  function onThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setThumbnailFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    } else {
      setThumbnailPreview(null)
    }
  }

  async function saveEdit(id: string) {
    setSaving(true)
    setError(null)
    try {
      // Upload thumbnail first if one was selected
      let newThumbnailUrl: string | null = null
      if (thumbnailFile) {
        const fd = new FormData()
        fd.append('thumbnail', thumbnailFile)
        const res = await fetch(`/api/admin/videos/${id}/thumbnail`, { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Thumbnail upload failed')
        const data = await res.json()
        newThumbnailUrl = data.thumbnailUrl
      }

      // Save metadata
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())

      setVideos(vs => vs.map(v =>
        v.id === id
          ? { ...v, ...form, ...(newThumbnailUrl ? { thumbnailUrl: newThumbnailUrl } : {}) }
          : v
      ))
      setEditingId(null)
      setThumbnailFile(null)
      setThumbnailPreview(null)
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

  const grouped = CATEGORY_ORDER.reduce<Record<string, PublicVideo[]>>((acc, cat) => {
    const matches = videos.filter(v => (v.category ?? 'Uncategorized') === cat)
    if (matches.length > 0) acc[cat] = matches
    return acc
  }, {})

  function renderVideoRow(video: PublicVideo) {
    return (
      <div key={video.id} className="border border-zinc-800 rounded-xl overflow-hidden">
          {editingId === video.id ? (
            <div className="p-5 space-y-3">
              <span className="text-xs text-zinc-600 font-mono block truncate">{video.id}</span>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Thumbnail</label>
                <div className="flex items-start gap-3">
                  <div
                    className="relative w-16 h-24 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0 cursor-pointer group"
                    onClick={() => thumbInputRef.current?.click()}
                  >
                    {(thumbnailPreview ?? video.thumbnailUrl) ? (
                      <Image
                        src={thumbnailPreview ?? video.thumbnailUrl!}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={!!thumbnailPreview}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="#52525b">
                          <path d="M4 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4zm0 1.5h12a.5.5 0 0 1 .5.5v6.44l-3.22-3.22a.75.75 0 0 0-1.06 0L9 11.44l-1.97-1.97a.75.75 0 0 0-1.06 0L3.5 12V5a.5.5 0 0 1 .5-.5z"/>
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                        <path d="M12.854 3.146a.5.5 0 0 0-.708 0L8 7.293 3.854 3.146a.5.5 0 1 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146a.5.5 0 0 0 0-.708z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => thumbInputRef.current?.click()}
                      className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {thumbnailFile ? thumbnailFile.name : 'Choose image…'}
                    </button>
                    {thumbnailFile && (
                      <button
                        type="button"
                        onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); if (thumbInputRef.current) thumbInputRef.current.value = '' }}
                        className="text-xs text-zinc-600 hover:text-red-400 transition-colors text-left"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onThumbnailChange}
                  />
                </div>
              </div>

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
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={syncDurations}
          disabled={syncing}
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {syncing ? 'Syncing…' : 'Sync durations from Bunny'}
        </button>
        {syncResult && <span className="text-xs text-zinc-500">{syncResult}</span>}
      </div>

      {Object.entries(grouped).map(([category, catVideos]) => (
        <div key={category}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-500">{category}</h2>
            <span className="text-xs text-zinc-700">{catVideos.length}</span>
          </div>
          <div className="space-y-2">
            {catVideos.map(renderVideoRow)}
          </div>
        </div>
      ))}
    </div>
  )
}
