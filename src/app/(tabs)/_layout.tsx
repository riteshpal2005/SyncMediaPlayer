import React from 'react';
import { MaterialTopTabs } from '../../shared/components/MaterialTopTabs';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const insets = useSafeAreaInsets();

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const activeColor = isDark ? '#3b82f6' : '#2563eb';
  const inactiveColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <MaterialTopTabs
      id="media-bottom-tabs"
      tabBarPosition="bottom"
      screenOptions={{
        sceneStyle: {
          paddingTop: insets.top,
          backgroundColor: isDark ? '#020617' : '#f8fafc',
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarShowLabel: false, // Hide labels as per user request
        tabBarIndicatorStyle: {
          backgroundColor: activeColor,
          height: 3,
          top: 0,
        },
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 8,
          shadowOpacity: 0.1,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="video"
        options={{
          title: 'Video',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'videocam' : 'videocam-outline'} size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="audio"
        options={{
          title: 'Audio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}