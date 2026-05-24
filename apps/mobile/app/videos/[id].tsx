import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, FlatList, useWindowDimensions } from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import type { Video } from '@abundanz/shared'
import { api } from '@/utils/api'
import { useSession } from '@/utils/session'

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const session = useSession()
  const { width } = useWindowDimensions()
  const [video, setVideo] = useState<Video | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [related, setRelated] = useState<Video[]>([])
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

  // Pause playback when leaving the screen, resume check on re-focus
  useFocusEffect(
    useCallback(() => {
      setSubscribed(null)
      setError(null)
      setRelated([])

      api.getSubscription()
        .then(({ isSubscribed }) => {
          setSubscribed(isSubscribed)
          if (!isSubscribed) {
            router.replace('/(app)/paywall')
            return
          }

          Promise.all([api.getVideo(id), api.getStreamUrl(id)])
            .then(([{ video }, { url }]) => {
              setVideo(video)
              setStreamUrl(url)
              player.replaceAsync({ uri: url, contentType: 'hls' })

              if (video.category) {
                api.getVideos(video.category)
                  .then(({ videos }) => setRelated(videos.filter((v) => v.id !== id)))
                  .catch(() => {})
              }
            })
            .catch((e) => setError(e.message))
        })
        .catch(() => setSubscribed(false))

      return () => {
        try { player.pause() } catch {}
      }
    }, [id])
  )

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.lockTitle}>Sign in to watch</Text>
        <Text style={styles.lockSub}>Create a free account to get started.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
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

  const CARD_WIDTH = (width - 16 * 2 - 12) / 2

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

      {related.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedHeading}>More {video.category}</Text>
          <FlatList
            data={related}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => {
              const itemMinutes = item.durationSeconds ? Math.floor(item.durationSeconds / 60) : null
              const itemSecs = item.durationSeconds ? item.durationSeconds % 60 : null
              const itemDuration = itemMinutes !== null && itemSecs !== null
                ? `${itemMinutes}:${String(itemSecs).padStart(2, '0')}`
                : null
              return (
                <TouchableOpacity
                  style={[styles.card, { width: CARD_WIDTH }]}
                  onPress={() => router.push(`/videos/${item.id}`)}
                  activeOpacity={0.75}
                >
                  {item.thumbnailUrl ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={[styles.thumbnail, { width: CARD_WIDTH, height: CARD_WIDTH * 9 / 16 }]} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumbnailPlaceholder, { width: CARD_WIDTH, height: CARD_WIDTH * 9 / 16 }]} />
                  )}
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  {itemDuration && <Text style={styles.cardDuration}>{itemDuration}</Text>}
                </TouchableOpacity>
              )
            }}
          />
        </View>
      )}
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
  relatedSection: { paddingHorizontal: 16, paddingTop: 32 },
  relatedHeading: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 16 },
  gridRow: { gap: 12, marginBottom: 12 },
  card: { gap: 8 },
  thumbnail: { borderRadius: 8, backgroundColor: '#18181b' },
  thumbnailPlaceholder: { borderRadius: 8, backgroundColor: '#18181b' },
  cardTitle: { color: '#e4e4e7', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  cardDuration: { color: '#52525b', fontSize: 12 },
})
