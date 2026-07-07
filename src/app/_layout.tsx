import '../global.css';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useThemeStore } from '../shared/store/useThemeStore';
import { CustomSplashScreen } from '../shared/components/CustomSplashScreen';

export default function RootLayout() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const bgColor = isDark ? '#09090b' : '#f4f4f5';
  const surfaceColor = isDark ? '#18181b' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaProvider>
        <CustomSplashScreen />
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: bgColor },
            headerTintColor: textColor,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: bgColor },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ title: 'SyncMedia' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}