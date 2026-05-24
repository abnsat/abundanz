import { Tabs } from 'expo-router'
import { View } from 'react-native'

function IconHome({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      {/* Play triangle */}
      <View style={{
        width: 0, height: 0,
        borderTopWidth: 9, borderBottomWidth: 9, borderLeftWidth: 16,
        borderTopColor: 'transparent', borderBottomColor: 'transparent',
        borderLeftColor: color,
      }} />
    </View>
  )
}

function IconAccount({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', gap: 3 }}>
      {/* Head */}
      <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: color }} />
      {/* Shoulders */}
      <View style={{ width: 18, height: 9, borderTopLeftRadius: 9, borderTopRightRadius: 9, backgroundColor: color }} />
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
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#52525b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Videos',
          tabBarIcon: ({ color }) => <IconHome color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <IconAccount color={color} />,
        }}
      />
      {/* Not tabs — accessible via navigation, hidden from tab bar */}
      <Tabs.Screen name="paywall" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="settings" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="videos/[id]" options={{ tabBarButton: () => null }} />
    </Tabs>
  )
}
