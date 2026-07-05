import React from 'react';
import { View, Text } from 'react-native';
import { MaterialTopTabs } from '../../shared/components/MaterialTopTabs';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const insets = useSafeAreaInsets();

  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const brandPrimary = isDark ? '#3b82f6' : '#2563eb';
  const textTertiary = isDark ? '#71717a' : '#a1a1aa';

  // Helper to render the custom chip for each tab
  const renderTabIcon = (
    focused: boolean,
    activeIcon: keyof typeof Ionicons.glyphMap,
    inactiveIcon: keyof typeof Ionicons.glyphMap,
    label: string
  ) => {
    if (focused) {
      return (
        <View className="items-center justify-center w-16 h-12">
          <View className="absolute inset-0 rounded-xl bg-[var(--color-brand-primary)] opacity-15" />
          <Ionicons name={activeIcon} size={24} color={brandPrimary} />
          <Text className="mt-0.5 font-bold text-[10px] text-[var(--color-brand-primary)]">{label}</Text>
        </View>
      );
    }
    return (
      <View className="items-center justify-center w-16 h-12">
        <Ionicons name={inactiveIcon} size={24} color={textTertiary} />
        <Text className="mt-0.5 font-medium text-[10px] text-[var(--color-text-tertiary)]">{label}</Text>
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
          backgroundColor: 'var(--color-background)',
        },
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
          display: 'none',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom : 16,
          left: 16,
          right: 16,
          backgroundColor: 'var(--color-surface)',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'var(--color-border)',
          height: 64,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          padding: 0,
          margin: 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="video"
        options={{
          title: 'Video',
          tabBarIcon: ({ focused }) => 
            renderTabIcon(focused, 'film', 'film', 'Video'),
        }}
      />
      <MaterialTopTabs.Screen
        name="audio"
        options={{
          title: 'Audio',
          tabBarIcon: ({ focused }) => 
            renderTabIcon(focused, 'musical-notes', 'musical-notes', 'Audio'),
        }}
      />
      <MaterialTopTabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) => 
            renderTabIcon(focused, 'folder', 'folder', 'Browse'),
        }}
      />
      <MaterialTopTabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => 
            renderTabIcon(focused, 'settings', 'settings', 'Settings'),
        }}
      />
    </MaterialTopTabs>
  );
}