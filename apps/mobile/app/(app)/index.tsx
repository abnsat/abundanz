import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import { useRouter, type Href } from 'expo-router'
import type { Video } from '@abundanz/shared'
import { api } from '@/utils/api'
import { useSession } from '@/utils/session'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = 130
const HERO_HEIGHT = SCREEN_WIDTH * 1.1

function CategoryRow({ title, videos, isGuest }: { title: string; videos: Video[]; isGuest: boolean }) {
  const router = useRouter()
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={videos}
        keyExtractor={(v) => v.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => isGuest
              ? router.push('/(auth)/login' as Href)
              : router.push(`/(app)/videos/${item.id}` as Href)
            }
            activeOpacity={0.8}
          >
            <View style={styles.cardThumb}>
              {item.thumbnailUrl ? (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
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


export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const session = useSession()
  const isGuest = !session

  useEffect(() => {
    api.getVideos()
      .then(({ videos }) => setVideos(videos))
      .catch((e) => setError(e?.message ?? 'Failed to load videos'))
      .finally(() => setLoading(false))
  }, [])

  const featured = videos[0] ?? null
  const byCategory = videos.reduce<Record<string, Video[]>>((acc, v) => {
    const cat = v.category ?? 'Other'
    ;(acc[cat] ??= []).push(v)
    return acc
  }, {})

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {featured?.thumbnailUrl ? (
            <Image
              source={{ uri: featured.thumbnailUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
          )}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />

          {/* Safe area spacer so hero content clears the status bar */}
          <SafeAreaView />

          {/* Hero meta */}
          {featured && (
            <TouchableOpacity
              style={styles.heroMeta}
              onPress={() => isGuest
                ? router.push('/(auth)/login' as Href)
                : router.push(`/(app)/videos/${featured.id}` as Href)
              }
              activeOpacity={0.85}
            >
              {featured.category && (
                <Text style={styles.heroCategory}>{featured.category.toUpperCase()}</Text>
              )}
              <Text style={styles.heroTitle} numberOfLines={3}>{featured.title}</Text>
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>
                  {isGuest ? 'Sign In to Watch' : '▶  Watch Now'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Content ─────────────────────────────────────────────── */}
        <View style={styles.content}>
          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator color="#fff" />
            </View>
          )}

          {!loading && error && (
            <View style={styles.centered}>
              {(error.includes('401') || error.includes('Unauthorized')) && isGuest ? (
                <>
                  <Text style={styles.guestTitle}>Sign in to browse</Text>
                  <Text style={styles.guestSub}>Create a free account to explore all content.</Text>
                  <TouchableOpacity
                    style={styles.guestButton}
                    onPress={() => router.push('/(auth)/login' as Href)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.guestButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.errorText}>
                  {error.includes('401') || error.includes('Unauthorized')
                    ? 'Session expired. Please sign in again.'
                    : error}
                </Text>
              )}
            </View>
          )}

          {!loading && !error && videos.length === 0 && (
            <View style={styles.centered}>
              <Text style={styles.empty}>No videos available yet.</Text>
            </View>
          )}

          {!loading && !error && Object.entries(byCategory).map(([cat, catVideos]) => (
            <CategoryRow key={cat} title={cat} videos={catVideos} isGuest={isGuest} />
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  /* Hero */
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
  heroCategory: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
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

  /* Content */
  content: { backgroundColor: '#000', minHeight: 200 },
  centered: { paddingVertical: 40, alignItems: 'center', paddingHorizontal: 32 },
  section: { marginTop: 28 },
  sectionTitle: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  row: { paddingHorizontal: 20 },
  card: { width: CARD_WIDTH },
  cardThumb: {
    width: CARD_WIDTH,
    aspectRatio: 2 / 3,
    backgroundColor: '#18181b',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playIcon: { color: '#3f3f46', fontSize: 20 },
  cardTitle: { color: '#a1a1aa', fontSize: 12, lineHeight: 16, fontWeight: '500' },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 6,
  },
  lockIcon: { fontSize: 12 },
  guestTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  guestSub: { color: '#52525b', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  guestButton: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40 },
  guestButtonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  empty: { color: '#3f3f46', fontSize: 14, textAlign: 'center' },
})
