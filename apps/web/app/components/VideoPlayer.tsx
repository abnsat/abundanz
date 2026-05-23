'use client'

import { useEffect, useState } from 'react'
import { MediaPlayer, MediaProvider } from '@vidstack/react'
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'

export function VideoPlayer({ videoId }: { videoId: string }) {
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/stream/${videoId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stream')
        return r.json()
      })
      .then((data) => setSrc(data.url))
      .catch((e) => setError(e.message))
  }, [videoId])

  if (error) {
    return (
      <div className="aspect-video bg-zinc-900 flex items-center justify-center rounded-lg">
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    )
  }

  if (!src) {
    return (
      <div className="aspect-video bg-zinc-900 flex items-center justify-center rounded-lg animate-pulse" />
    )
  }

  return (
    <MediaPlayer src={src} className="w-full aspect-video rounded-lg overflow-hidden">
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}
