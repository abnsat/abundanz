import { createHash } from 'crypto'

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
