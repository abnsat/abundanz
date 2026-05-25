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
} from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
  const insets = useSafeAreaInsets()

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

  const header = (
    <View>
      <View style={[styles.hero, { marginTop: -insets.top, height: HERO_HEIGHT + insets.top }]}>
        {(featured?.previewUrl ?? featured?.thumbnailUrl) ? (
          <ExpoImage
            source={{ uri: featured.previewUrl ?? featured.thumbnailUrl ?? undefined }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            autoplay
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
        {featured && (
          <TouchableOpacity style={styles.heroMeta} onPress={() => handleVideoPress(featured.id)} activeOpacity={0.85}>
            <View style={styles.newReleaseBadge}>
              <Text style={styles.newReleaseText}>NEW RELEASE</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={3}>{featured.title}</Text>
            {featured.language && (
              <View style={styles.langBadge}>
                <Text style={styles.langBadgeText}>{featured.language}</Text>
              </View>
            )}
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>▶  Watch</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category}</Text>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.centered}><ActivityIndicator color="#fff" /></View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        {header}
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
        data={videos}
        keyExtractor={(v) => v.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
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
                  <Ionicons name="lock-closed" size={16} color="white" />
                </View>
              )}
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            {item.language && (
              <Text style={styles.cardLang}>{item.language}</Text>
            )}
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
  newReleaseBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  newReleaseText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
  },
  heroMeta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: GRID_PADDING,
    paddingTop: 24,
    paddingBottom: 88,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
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
  categoryHeader: { paddingHorizontal: GRID_PADDING, paddingTop: 8, paddingBottom: 8, marginTop: -40 },
  categoryTitle: { color: '#a1a1aa', fontSize: 17, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', includeFontPadding: false, paddingBottom: 10 },
  grid: { backgroundColor: '#000', paddingTop: 0 },
  gridRow: { justifyContent: 'space-between', marginBottom: GRID_GAP, paddingHorizontal: GRID_PADDING, marginTop: 0 },
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
  cardTitle: { color: '#a1a1aa', fontSize: 12, lineHeight: 16, fontWeight: '500' },
  cardLang: { color: '#52525b', fontSize: 10, marginTop: 3 },
  langBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  langBadgeText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  guestTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  guestSub: { color: '#52525b', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  guestButton: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40 },
  guestButtonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  empty: { color: '#3f3f46', fontSize: 14, textAlign: 'center' },
})
