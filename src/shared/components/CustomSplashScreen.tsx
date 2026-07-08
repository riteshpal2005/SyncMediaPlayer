import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withRepeat, 
  withTiming, 
  Easing,
  useAnimatedStyle,
  runOnJS
} from 'react-native-reanimated';
import { useThemeStore } from '../store/useThemeStore';
import { useVideoStore } from '../store/useVideoStore';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function CustomSplashScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isInitialScanCompleted = useVideoStore((state) => state.isInitialScanCompleted);
  
  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const bgColor = isDark ? '#020617' : '#2563eb';
  const textColor = '#ffffff';
  
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(-200, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (isInitialScanCompleted) {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
    }
  }, [isInitialScanCompleted]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: progress.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }, containerStyle]}>
      <Svg width={150} height={150} viewBox="0 0 100 100">
        <AnimatedPath
          d="M 35 25 L 35 75 L 75 50 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="12"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="130 70"
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={[styles.title, { color: textColor }]}>Sync Media Player</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  }
});
