'use client'

import { useState, useRef } from 'react'
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const thumbRef = useRef<HTMLInputElement>(null)

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
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())

      if (thumbnailFile) {
        const fd = new FormData()
        fd.append('thumbnail', thumbnailFile)
        const thumbRes = await fetch(`/api/admin/videos/${id}/thumbnail`, { method: 'POST', body: fd })
        if (!thumbRes.ok) throw new Error('Thumbnail upload failed')
      }

      setVideos(vs => vs.map(v => v.id === id ? {
        ...v,
        ...form,
        ...(thumbnailPreview ? { thumbnailUrl: thumbnailPreview } : {}),
      } : v))
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

  return (
    <div className="space-y-2">
      {videos.map(video => (
        <div key={video.id} className="border border-zinc-800 rounded-xl overflow-hidden">
          {editingId === video.id ? (
            <div className="p-5 space-y-3">
              <span className="text-xs text-zinc-600 font-mono block truncate">{video.id}</span>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Thumbnail</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                    {thumbnailPreview || video.thumbnailUrl ? (
                      <Image
                        src={thumbnailPreview ?? video.thumbnailUrl!}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={!!thumbnailPreview}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#52525b">
                          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => thumbRef.current?.click()}
                      className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {thumbnailFile ? 'Change image' : 'Upload image'}
                    </button>
                    {thumbnailFile ? (
                      <p className="text-[11px] text-green-400">{thumbnailFile.name}</p>
                    ) : (
                      <p className="text-[11px] text-zinc-600">Bunny.net thumbnail used as fallback</p>
                    )}
                  </div>
                  <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={onThumbnailChange} />
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
      ))}
    </div>
  )
}
