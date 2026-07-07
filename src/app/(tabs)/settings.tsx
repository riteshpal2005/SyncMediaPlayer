import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';

export default function SettingsScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="settings-outline" size={64} color={iconColor} />
      <Text className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
        Settings
      </Text>
    </View>
  );
}