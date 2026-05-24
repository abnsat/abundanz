import { Tabs } from 'expo-router'
import { View } from 'react-native'

function IconMovies({ color }: { color: string }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 0, height: 0, borderTopWidth: 11, borderBottomWidth: 11, borderLeftWidth: 18, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color }} />
    </View>
  )
}

function IconDocumentaries({ color }: { color: string }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 20, height: 2.5, borderRadius: 1.5, backgroundColor: color }} />
      <View style={{ width: 20, height: 2.5, borderRadius: 1.5, backgroundColor: color }} />
      <View style={{ width: 13, height: 2.5, borderRadius: 1.5, backgroundColor: color }} />
    </View>
  )
}

function IconKids({ color }: { color: string }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: 7, height: 7, borderRadius: 1.5, backgroundColor: color, top: 1 }} />
      <View style={{ position: 'absolute', width: 7, height: 7, borderRadius: 1.5, backgroundColor: color, bottom: 1 }} />
      <View style={{ position: 'absolute', width: 7, height: 7, borderRadius: 1.5, backgroundColor: color, left: 1 }} />
      <View style={{ position: 'absolute', width: 7, height: 7, borderRadius: 1.5, backgroundColor: color, right: 1 }} />
    </View>
  )
}

function IconAccount({ color }: { color: string }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center', gap: 3 }}>
      <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: color }} />
      <View style={{ width: 22, height: 10, borderTopLeftRadius: 11, borderTopRightRadius: 11, backgroundColor: color }} />
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#27272a',
          borderTopWidth: 1,
          height: 84,
          paddingTop: 10,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#52525b',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color }) => <IconMovies color={color} />,
        }}
      />
      <Tabs.Screen
        name="documentaries"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color }) => <IconDocumentaries color={color} />,
        }}
      />
      <Tabs.Screen
        name="kids"
        options={{
          title: 'Kids',
          tabBarIcon: ({ color }) => <IconKids color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <IconAccount color={color} />,
        }}
      />
      {/* Hidden from tab bar — navigable but take no space in the layout */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="paywall" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  )
}
