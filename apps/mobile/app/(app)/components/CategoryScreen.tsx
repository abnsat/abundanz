import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import { useRouter, type Href } from 'expo-router'
import type { Video } from '@abundanz/shared'
import { api } from '@/utils/api'
import { useSession } from '@/utils/session'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const GRID_PADDING = 16
const GRID_GAP = 10
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2
const HERO_HEIGHT = SCREEN_WIDTH * 1.1

interface Props {
  category: string
}

export function CategoryScreen({ category }: Props) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const session = useSession()
  const isGuest = !session

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getVideos(category)
      .then(({ videos }) => setVideos(videos))
      .catch((e) => setError(e?.message ?? 'Failed to load videos'))
      .finally(() => setLoading(false))
  }, [category])

  const featured = videos[0] ?? null

  function handleVideoPress(id: string) {
    if (isGuest) router.push('/(auth)/login' as Href)
    else router.push(`/videos/${id}` as Href)
  }

  const hero = (
    <View style={styles.hero}>
      {featured?.thumbnailUrl ? (
        <Image source={{ uri: featured.thumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
      <SafeAreaView />
      {featured && (
        <TouchableOpacity style={styles.heroMeta} onPress={() => handleVideoPress(featured.id)} activeOpacity={0.85}>
          <Text style={styles.heroTitle} numberOfLines={3}>{featured.title}</Text>
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>▶  Watch</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        {hero}
        <View style={styles.centered}><ActivityIndicator color="#fff" /></View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        {hero}
        <View style={styles.centered}>
          {(error.includes('401') || error.includes('Unauthorized')) && isGuest ? (
            <>
              <Text style={styles.guestTitle}>Sign in to browse</Text>
              <Text style={styles.guestSub}>Create a free account to explore all content.</Text>
              <TouchableOpacity style={styles.guestButton} onPress={() => router.push('/(auth)/login' as Href)} activeOpacity={0.85}>
                <Text style={styles.guestButtonText}>Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos.slice(1)}
        keyExtractor={(v) => v.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={hero}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.empty}>No videos in this category yet.</Text>
          </View>
        }
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        ListFooterComponent={<View style={{ height: 40 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleVideoPress(item.id)} activeOpacity={0.8}>
            <View style={styles.cardThumb}>
              {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <Text style={styles.playIcon}>▶</Text>
              )}
              {isGuest && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hero: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: '#18181b',
    overflow: 'hidden',
  },
  heroMeta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 28,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
  },
  heroButtonText: { color: '#000', fontWeight: '700', fontSize: 14 },
  centered: { paddingVertical: 40, alignItems: 'center', paddingHorizontal: 32 },
  grid: { backgroundColor: '#000', paddingHorizontal: GRID_PADDING, paddingTop: 20 },
  gridRow: { justifyContent: 'space-between', marginBottom: GRID_GAP },
  card: { width: CARD_WIDTH },
  cardThumb: {
    width: CARD_WIDTH,
    aspectRatio: 2 / 3,
    backgroundColor: '#18181b',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playIcon: { color: '#3f3f46', fontSize: 20 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 6,
  },
  lockIcon: { fontSize: 12 },
  cardTitle: { color: '#a1a1aa', fontSize: 12, lineHeight: 16, fontWeight: '500' },
  guestTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  guestSub: { color: '#52525b', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  guestButton: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40 },
  guestButtonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  empty: { color: '#3f3f46', fontSize: 14, textAlign: 'center' },
})
