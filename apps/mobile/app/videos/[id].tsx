import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, FlatList, useWindowDimensions } from 'react-native'
import Svg, { Path } from 'react-native-svg'
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
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null)
  const [reactionLoading, setReactionLoading] = useState(false)

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

              api.getReactions(id)
                .then((r) => {
                  setLikes(r.likes)
                  setDislikes(r.dislikes)
                  setUserReaction(r.userReaction)
                })
                .catch(() => {})
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

  async function handleReact(reaction: 'like' | 'dislike') {
    if (reactionLoading) return
    const next = userReaction === reaction ? null : reaction
    setReactionLoading(true)
    try {
      const data = await api.react(id, next)
      setLikes(data.likes)
      setDislikes(data.dislikes)
      setUserReaction(data.userReaction)
    } catch {}
    finally { setReactionLoading(false) }
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
        <View style={styles.reactions}>
          <TouchableOpacity
            style={[styles.reactionBtn, userReaction === 'like' && styles.reactionBtnActive]}
            onPress={() => handleReact('like')}
            disabled={reactionLoading}
            activeOpacity={0.7}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={userReaction === 'like' ? '#fff' : '#71717a'}>
              <Path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
            </Svg>
            <Text style={[styles.reactionCount, userReaction === 'like' && styles.reactionCountActive]}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reactionBtn, userReaction === 'dislike' && styles.reactionBtnActive]}
            onPress={() => handleReact('dislike')}
            disabled={reactionLoading}
            activeOpacity={0.7}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={userReaction === 'dislike' ? '#fff' : '#71717a'}>
              <Path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
            </Svg>
            <Text style={[styles.reactionCount, userReaction === 'dislike' && styles.reactionCountActive]}>{dislikes}</Text>
          </TouchableOpacity>
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
                  {item.language && <Text style={styles.cardLang}>{item.language}</Text>}
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
  reactions: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  reactionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#3f3f46', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  reactionBtnActive: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' },
  reactionCount: { color: '#71717a', fontSize: 13, fontWeight: '500' },
  reactionCountActive: { color: '#fff' },
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
  cardLang: { color: '#3f3f46', fontSize: 11, marginTop: 2 },
})
