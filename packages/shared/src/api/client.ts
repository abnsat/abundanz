// Typed API client used by apps/mobile to call apps/web API routes.
// Base URL is injected so it works in both dev (localhost) and production.

export function createApiClient(baseUrl: string, getToken: () => Promise<string | null>) {
  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await getToken()
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(error || `Request failed: ${res.status}`)
    }
    return res.json() as Promise<T>
  }

  return {
    getStreamUrl: (videoId: string) =>
      request<{ url: string }>(`/api/stream/${videoId}`),

    getVideos: (category?: string) =>
      request<{ videos: import('../types').Video[] }>(
        `/api/videos${category ? `?category=${category}` : ''}`
      ),

    getVideo: (videoId: string) =>
      request<{ video: import('../types').Video }>(`/api/videos/${videoId}`),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
