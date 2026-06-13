import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { C, F } from '../../constants/theme';

function TabIcon({ label, active }: { label: string; active: boolean }) {
  const ICONS: Record<string, string> = {
    '🎙': '🎙', '🕐': '🕐', '⚙': '⚙',
  };
  return (
    <Text style={{ fontSize: 20, opacity: active ? 1 : 0.4 }}>{label}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  C.tab,
          borderTopColor:   C.border,
          borderTopWidth:   1,
          height:           62,
          paddingBottom:    8,
        },
        tabBarActiveTintColor:   C.accent,
        tabBarInactiveTintColor: C.textDim,
        tabBarLabelStyle: {
          fontFamily: F.mono,
          fontSize:   10,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:    'LIVE',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>🎙</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title:    'HISTORY',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>🕐</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title:    'SETTINGS',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
