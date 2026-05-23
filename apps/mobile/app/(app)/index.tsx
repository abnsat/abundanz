import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useRouter, type Href, Link } from 'expo-router'
import type { Video } from '@abundanz/shared'
import { api } from '@/utils/api'

export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    api.getVideos()
      .then(({ videos }) => setVideos(videos))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Abundanz</Text>
        <Link href="/(app)/settings" style={styles.settingsLink}>
          <Text style={styles.signOut}>Settings</Text>
        </Link>
      </View>

      {videos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>No videos yet.</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(v) => v.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/videos/${item.id}` as Href)}
            >
              <View style={styles.thumbnail}>
                {item.thumbnailUrl ? (
                  <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <Text style={styles.playIcon}>▶</Text>
                )}
              </View>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  logo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  signOut: { color: '#71717a', fontSize: 14 },
  settingsLink: { color: '#71717a' },
  list: { padding: 12 },
  row: { gap: 8 },
  card: { flex: 1, marginBottom: 12 },
  thumbnail: {
    aspectRatio: 16 / 9,
    backgroundColor: '#27272a',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  playIcon: { color: '#52525b', fontSize: 24 },
  title: { color: '#e4e4e7', fontSize: 12, lineHeight: 16 },
  empty: { color: '#71717a', fontSize: 14 },
})
