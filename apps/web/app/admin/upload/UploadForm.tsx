'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { LANGUAGES } from '@abundanz/shared'

const CATEGORIES = ['Movies', 'Documentaries', 'Kids', 'Discipleship']

type Stage = 'idle' | 'preparing' | 'uploading' | 'done' | 'error'

export function UploadForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [language, setLanguage] = useState<string>(LANGUAGES[0])
  const [file, setFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) return

    setStage('preparing')
    setErrorMsg('')

    try {
      // Step 1: create Bunny video + DB record, get TUS credentials
      const res = await fetch('/api/admin/upload/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, language }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { id, bunnyVideoId, signature, expiry, libraryId } = await res.json()

      // Step 2: upload directly to Bunny.net via TUS
      setStage('uploading')
      const tus = await import('tus-js-client')

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: 'https://video.bunnycdn.com/tusupload',
          retryDelays: [0, 3000, 5000, 10000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: String(expiry),
            VideoId: bunnyVideoId,
            LibraryId: libraryId,
          },
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onProgress(uploaded, total) {
            setProgress(Math.round((uploaded / total) * 100))
          },
          onSuccess() { resolve() },
          onError(err) { reject(err) },
        })
        upload.start()
      })

      // Upload custom thumbnail if provided (best effort)
      if (thumbnail) {
        const fd = new FormData()
        fd.append('thumbnail', thumbnail)
        await fetch(`/api/admin/videos/${id}/thumbnail`, { method: 'POST', body: fd }).catch(() => {})
      }

      setStage('done')
      setTimeout(() => router.push('/admin'), 1500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
      setStage('error')
    }
  }

  const busy = stage === 'preparing' || stage === 'uploading'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Title <span className="text-red-500">*</span></label>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={busy}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Category <span className="text-red-500">*</span></label>
        <select
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500"
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={busy}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Language <span className="text-red-500">*</span></label>
        <select
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={busy}
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Description</label>
        <textarea
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 resize-none"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={busy}
        />
      </div>

      {/* File */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Video file <span className="text-red-500">*</span></label>
        <div
          className="border border-dashed border-zinc-700 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {file ? (
            <div>
              <p className="text-sm text-white font-medium truncate">{file.name}</p>
              <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Click to select a video file</p>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          disabled={busy}
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">
          Thumbnail <span className="text-zinc-600">(optional — Bunny.net auto-generates a fallback)</span>
        </label>
        <div
          className="border border-dashed border-zinc-700 rounded-lg px-4 py-5 text-center cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => thumbRef.current?.click()}
        >
          {thumbnail ? (
            <div>
              <p className="text-sm text-white font-medium truncate">{thumbnail.name}</p>
              <p className="text-xs text-zinc-500 mt-1">{(thumbnail.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Click to select an image</p>
          )}
        </div>
        <input
          ref={thumbRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => setThumbnail(e.target.files?.[0] ?? null)}
          disabled={busy}
        />
      </div>

      {/* Progress */}
      {stage === 'uploading' && (
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {stage === 'preparing' && (
        <p className="text-xs text-zinc-500">Preparing upload…</p>
      )}

      {stage === 'done' && (
        <p className="text-xs text-green-400">Upload complete — encoding in progress. Redirecting…</p>
      )}

      {stage === 'error' && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={busy || !file || !title.trim()}
        className="w-full bg-white text-black font-semibold py-3 rounded-lg text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40"
      >
        {stage === 'preparing' ? 'Preparing…' : stage === 'uploading' ? `Uploading ${progress}%` : 'Upload'}
      </button>
    </form>
  )
}
