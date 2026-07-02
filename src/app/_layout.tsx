import React, { useEffect } from 'react';
import { Appearance } from 'react-native';
import { useThemeStore } from '../shared/store/useThemeStore';
import '../global.css';

export default function RootLayout() {
  const themeMode = useThemeStore((state) => state.themeMode);

  useEffect(() => {

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        try {
          const { colorScheme: nwColorScheme } = require('nativewind');
          if (nwColorScheme && typeof nwColorScheme.set === 'function') {
            nwColorScheme.set(colorScheme || 'light');
          }
        } catch (_) { }
      }
    });

    return () => subscription.remove();
  }, [themeMode]);

  return null;
}