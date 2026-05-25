import { createHash } from 'crypto'

export async function createBunnyVideo(title: string): Promise<string> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: { AccessKey: process.env.BUNNY_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }
  )
  if (!res.ok) throw new Error(`Bunny create video failed: ${res.status}`)
  const data = await res.json()
  return data.guid as string
}

export function generateTusCredentials(bunnyVideoId: string) {
  const expiry = Math.floor(Date.now() / 1000) + 3600
  const libraryId = process.env.BUNNY_LIBRARY_ID!
  const signature = createHash('sha256')
    .update(libraryId + process.env.BUNNY_API_KEY! + expiry.toString() + bunnyVideoId)
    .digest('hex')
  return { signature, expiry, libraryId }
}

export function getBunnyThumbnailUrl(bunnyVideoId: string): string {
  return `https://${process.env.BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/thumbnail.jpg`
}

export function getBunnyPreviewUrl(bunnyVideoId: string): string {
  return `https://${process.env.BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/preview.webp`
}

export async function deleteBunnyVideo(bunnyVideoId: string): Promise<void> {
  await fetch(
    `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${bunnyVideoId}`,
    { method: 'DELETE', headers: { AccessKey: process.env.BUNNY_API_KEY! } }
  )
}

export async function uploadBunnyThumbnail(
  bunnyVideoId: string,
  buffer: ArrayBuffer,
  contentType: string
): Promise<void> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${bunnyVideoId}/thumbnail`,
    {
      method: 'POST',
      headers: { AccessKey: process.env.BUNNY_API_KEY!, 'Content-Type': contentType },
      body: buffer,
    }
  )
  if (!res.ok) throw new Error(`Bunny thumbnail upload failed: ${res.status}`)
}

export function getStreamUrl(bunnyVideoId: string): string {
  return `https://${process.env.BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/playlist.m3u8`
}

// Phase 3: enable once subscription gating is in place and token auth is verified end-to-end
export function getSignedStreamUrl(bunnyVideoId: string, ttlSeconds = 3600): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds
  const filePath = `/${bunnyVideoId}/playlist.m3u8`
  const hashable = process.env.BUNNY_TOKEN_AUTH_KEY! + filePath + expires
  const token = createHash('sha256')
    .update(hashable)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return `https://${process.env.BUNNY_CDN_HOSTNAME}${filePath}?token=${token}&expires=${expires}`
}
