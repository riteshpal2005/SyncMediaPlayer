import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../store/useThemeStore';
import { useVideoStore } from '../store/useVideoStore';

const ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'videocam',
  'play-circle',
  'film',
  'musical-notes',
  'images',
  'tv'
];

export function CustomSplashScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isInitialScanCompleted = useVideoStore((state) => state.isInitialScanCompleted);
  
  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  
  const [randomIcon] = useState(() => ICONS[Math.floor(Math.random() * ICONS.length)]);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isInitialScanCompleted) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // 500ms fade out
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [isInitialScanCompleted, fadeAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity: fadeAnim }]}>
      <Ionicons name={randomIcon} size={100} color="#3b82f6" />
      <Text style={[styles.title, { color: textColor }]}>Sync Media Player</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Ensure it's above everything else
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  }
});
