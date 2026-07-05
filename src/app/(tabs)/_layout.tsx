import React from 'react';
import { View, Text } from 'react-native';
import { MaterialTopTabs } from '../../shared/components/MaterialTopTabs';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const insets = useSafeAreaInsets();

  const isDark = themeMode === 'dark';
  const inactiveColor = isDark ? '#94a3b8' : '#64748b';

  // Helper to render the custom chip for each tab
  const renderTabIcon = (
    focused: boolean,
    color: string,
    activeIcon: keyof typeof Ionicons.glyphMap,
    inactiveIcon: keyof typeof Ionicons.glyphMap,
    label: string
  ) => {
    if (focused) {
      return (
        <View className="flex-row items-center justify-center px-4 py-2 rounded-full bg-[var(--color-brand-primary)] min-w-[90px]">
          <Ionicons name={activeIcon} size={20} color="#ffffff" />
          <Text className="ml-2 font-medium text-white text-sm">{label}</Text>
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-2">
        <Ionicons name={inactiveIcon} size={24} color={inactiveColor} />
      </View>
    );
  };

  return (
    <MaterialTopTabs
      id="media-bottom-tabs"
      tabBarPosition="bottom"
      screenOptions={{
        sceneStyle: {
          paddingTop: insets.top,
          backgroundColor: isDark ? '#020617' : '#f8fafc', // Using native props for root bg as safe fallback
        },
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
          display: 'none', // Remove bar above focused icon
        },
        tabBarStyle: {
          backgroundColor: isDark ? 'var(--color-background, #0f172a)' : 'var(--color-surface, #ffffff)',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1e293b' : 'var(--color-border, #e4e4e7)',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 8,
          shadowOpacity: 0.1,
          justifyContent: 'center',
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="video"
        options={{
          title: 'Video',
          tabBarIcon: ({ color, focused }) => 
            renderTabIcon(focused, color, 'film', 'film-outline', 'Video'),
        }}
      />
      <MaterialTopTabs.Screen
        name="audio"
        options={{
          title: 'Audio',
          tabBarIcon: ({ color, focused }) => 
            renderTabIcon(focused, color, 'musical-notes', 'musical-notes-outline', 'Audio'),
        }}
      />
      <MaterialTopTabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => 
            renderTabIcon(focused, color, 'folder', 'folder-outline', 'Browse'),
        }}
      />
      <MaterialTopTabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => 
            renderTabIcon(focused, color, 'settings', 'settings-outline', 'Settings'),
        }}
      />
    </MaterialTopTabs>
  );
}