import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeStore } from '../../shared/store/useThemeStore';

export default function ThemeSettingsScreen() {
  const { themeMode, setThemeMode } = useThemeStore();

  const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-slate-900 p-6">
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Theme Workspace
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Active Configuration: {themeMode.toUpperCase()}
      </Text>

      <View className="flex-row gap-3">
        {modes.map((mode) => {
          const isActive = themeMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => setThemeMode(mode)}
              className={`px-5 py-2.5 rounded-xl border ${
                isActive
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {mode}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}