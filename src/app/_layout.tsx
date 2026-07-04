import '../global.css';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}