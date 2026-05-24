import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { useVideoPlayer, VideoView } from 'expo-video'
import type { Video } from '@abundanz/shared'
import { api } from '@/utils/api'
import { useSession } from '@/utils/session'

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const session = useSession()
  const [video, setVideo] = useState<Video | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [subscribed, setSubscribed] = useState<boolean | null>(null)

  const player = useVideoPlayer(null, (p) => {
    p.loop = false
  })

  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'readyToPlay') player.play()
      if (status === 'error') setError(error?.message ?? 'Playback error')
    })
    return () => sub.remove()
  }, [player])

  // Re-check subscription each time this screen comes into focus (e.g. returning from paywall)
  useFocusEffect(
    useCallback(() => {
      setSubscribed(null)
      setError(null)

      api.getSubscription()
        .then(({ isSubscribed }) => {
          setSubscribed(isSubscribed)
          if (!isSubscribed) return

          Promise.all([api.getVideo(id), api.getStreamUrl(id)])
            .then(([{ video }, { url }]) => {
              setVideo(video)
              setStreamUrl(url)
              player.replaceAsync({ uri: url, contentType: 'hls' })
            })
            .catch((e) => setError(e.message))
        })
        .catch(() => setSubscribed(false))
    }, [id])
  )

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.lockTitle}>Sign in to watch</Text>
        <Text style={styles.lockSub}>Create a free account to get started.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (subscribed === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fff" />
      </View>
    )
  }

  if (!subscribed) {
    return (
      <View style={styles.centered}>
        <Text style={styles.lockTitle}>Subscribe to watch</Text>
        <Text style={styles.lockSub}>Get unlimited access to all content.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(app)/paywall')}>
          <Text style={styles.buttonText}>See plans</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!video || !streamUrl) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fff" />
      </View>
    )
  }

  const minutes = video.durationSeconds ? Math.floor(video.durationSeconds / 60) : null
  const seconds = video.durationSeconds ? video.durationSeconds % 60 : null
  const duration = minutes !== null && seconds !== null
    ? `${minutes}:${String(seconds).padStart(2, '0')}`
    : null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <VideoView
        player={player}
        style={styles.player}
        fullscreenOptions={{ supportedOrientations: 'landscape' }}
        allowsPictureInPicture
      />

      <View style={styles.meta}>
        <Text style={styles.title}>{video.title}</Text>
        <View style={styles.tags}>
          {video.category && <Text style={styles.tag}>{video.category}</Text>}
          {duration && <Text style={styles.tag}>{duration}</Text>}
        </View>
        {video.description && (
          <Text style={styles.description}>{video.description}</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  backButton: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  backText: { color: '#a1a1aa', fontSize: 15 },
  player: { width: '100%', aspectRatio: 16 / 9 },
  meta: { paddingHorizontal: 16, paddingTop: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: { color: '#71717a', fontSize: 13 },
  description: { color: '#a1a1aa', fontSize: 14, lineHeight: 22 },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center' },
  lockTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  lockSub: { color: '#71717a', fontSize: 14, textAlign: 'center' },
  button: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  backLink: { marginTop: 8 },
  backLinkText: { color: '#52525b', fontSize: 14 },
})
