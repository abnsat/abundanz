'use client'

import { useEffect, useState } from 'react'

interface Props {
  thumbnails: string[]
}

export function LoginCarousel({ thumbnails }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (thumbnails.length < 2) return
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % thumbnails.length)
    }, 4000)
    return () => clearInterval(id)
  }, [thumbnails.length])

  if (thumbnails.length === 0) {
    return <div className="absolute inset-0 bg-zinc-900" />
  }

  return (
    <>
      {thumbnails.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      {/* Dot indicators */}
      {thumbnails.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {thumbnails.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i === current ? '#fff' : 'rgba(255,255,255,0.35)' }}
            />
          ))}
        </div>
      )}
    </>
  )
}
