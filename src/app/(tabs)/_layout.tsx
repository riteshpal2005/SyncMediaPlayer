import React from 'react';
import { View, Text } from 'react-native';
import { MaterialTopTabs } from '../../shared/components/MaterialTopTabs';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Music, Folder, Settings, LucideIcon, Video } from 'lucide-react-native';

export default function TabLayout() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const insets = useSafeAreaInsets();

  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const bgColor = isDark ? '#09090b' : '#f4f4f5';
  const surfaceColor = isDark ? '#18181b' : '#ffffff';
  const borderColor = isDark ? '#27272a' : '#e4e4e7';
  const brandPrimary = isDark ? '#3b82f6' : '#2563eb';
  const textTertiary = isDark ? '#71717a' : '#a1a1aa';

  const renderTabIcon = (
    focused: boolean,
    IconComponent: LucideIcon
  ) => {
    return (
      <View className="items-center justify-center w-16 h-12">
        <IconComponent size={24} color={focused ? brandPrimary : textTertiary} />
      </View>
    );
  };

  return (
    <MaterialTopTabs
      id="media-bottom-tabs"
      tabBarPosition="bottom"
      screenOptions={{
        sceneStyle: {
          backgroundColor: bgColor,
        },
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
          display: 'none',
        },
        tabBarStyle: {
          backgroundColor: surfaceColor,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
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
            renderTabIcon(focused, Video),
        }}
      />
      <MaterialTopTabs.Screen
        name="audio"
        options={{
          title: 'Audio',
          tabBarIcon: ({ focused }) => 
            renderTabIcon(focused, Music),
        }}
      />
      <MaterialTopTabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) => 
            renderTabIcon(focused, Folder),
        }}
      />
      <MaterialTopTabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => 
            renderTabIcon(focused, Settings),
        }}
      />
    </MaterialTopTabs>
  );
}