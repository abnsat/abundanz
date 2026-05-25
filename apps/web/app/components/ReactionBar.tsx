'use client'

import { useState } from 'react'

interface Props {
  videoId: string
  initialLikes: number
  initialDislikes: number
  initialUserReaction: 'like' | 'dislike' | null
}

export function ReactionBar({ videoId, initialLikes, initialDislikes, initialUserReaction }: Props) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(initialUserReaction)
  const [loading, setLoading] = useState(false)

  async function react(reaction: 'like' | 'dislike') {
    if (loading) return
    const next = userReaction === reaction ? null : reaction
    setLoading(true)
    try {
      const res = await fetch(`/api/videos/${videoId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: next }),
      })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes)
        setDislikes(data.dislikes)
        setUserReaction(data.userReaction)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => react('like')}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
          userReaction === 'like'
            ? 'border-white text-white bg-white/10'
            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046z"/>
        </svg>
        {likes}
      </button>

      <button
        onClick={() => react('dislike')}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
          userReaction === 'dislike'
            ? 'border-white text-white bg-white/10'
            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7v-4c0-.845.682-1.464 1.448-1.545 1.07-.114 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484.397-.136.861-.217 1.466-.217h3.5c.937 0 1.599.477 1.934 1.064.164.287.254.607.254.912 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065z"/>
        </svg>
        {dislikes}
      </button>
    </div>
  )
}
