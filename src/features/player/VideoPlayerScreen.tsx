import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Brightness from 'expo-brightness';
import * as ScreenOrientation from 'expo-screen-orientation';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Format time utility
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function VideoPlayerScreen() {
  const { uri, filename } = useLocalSearchParams<{ uri: string; filename: string }>();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showRemainingTime, setShowRemainingTime] = useState(false);
  const [brightness, setBrightness] = useState(0.5);
  
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    player.play();
  });

  // Track player progress
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (status) => {
      // Logic for status
    });
    // Interval for progress because expo-video currently doesn't fire frequent progress events perfectly yet
    const interval = setInterval(() => {
      setCurrentTime(player.currentTime || 0);
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  // Handle controls auto hide
  const resetControlsTimer = () => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimer();
    
    // Default to Landscape Fullscreen
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      // Revert orientation when leaving
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const toggleOrientation = async () => {
    const current = await ScreenOrientation.getOrientationAsync();
    if (
      current === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
      current === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
    ) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    resetControlsTimer();
  };

  // Gestures
  const handleGesture = (event: any) => {
    resetControlsTimer();
    const { translationY, absoluteX } = event.nativeEvent;
    
    if (event.nativeEvent.state === State.ACTIVE) {
      if (absoluteX < SCREEN_WIDTH / 2) {
        // Left side: Brightness
        const newBrightness = Math.max(0, Math.min(1, brightness - (translationY / SCREEN_HEIGHT)));
        Brightness.setBrightnessAsync(newBrightness);
        setBrightness(newBrightness);
      } else {
        // Right side: Volume
        if (player) {
          const currentVol = player.volume;
          const newVol = Math.max(0, Math.min(1, currentVol - (translationY / SCREEN_HEIGHT) * 0.1));
          player.volume = newVol;
        }
      }
    }
  };

  // Double tap
  const handleDoubleTap = (direction: 'left' | 'right') => {
    if (!player) return;
    if (direction === 'left') {
      player.currentTime = Math.max(0, player.currentTime - 5);
    } else {
      player.currentTime = player.currentTime + 5;
    }
    resetControlsTimer();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        allowsPictureInPicture
      />

      {/* Overlay for Gestures & Double Taps */}
      <PanGestureHandler onGestureEvent={handleGesture} onHandlerStateChange={handleGesture}>
        <View style={StyleSheet.absoluteFill}>
          <Pressable 
            style={styles.gestureOverlay}
            onPress={resetControlsTimer}
          >
            {/* Left Double Tap Zone */}
            <Pressable 
              style={styles.doubleTapZone} 
              onPress={() => {}} // Handle single tap
              // Double tap would need a custom implementation or TapGestureHandler with numberOfTaps=2
              onLongPress={() => handleDoubleTap('left')}
            />
            {/* Right Double Tap Zone */}
            <Pressable 
              style={styles.doubleTapZone}
              onLongPress={() => handleDoubleTap('right')}
            />
          </Pressable>
        </View>
      </PanGestureHandler>

      {/* UI Controls */}
      {controlsVisible && (
        <View style={styles.controlsContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </Pressable>
            <Text style={styles.filename} numberOfLines={1}>{filename}</Text>
            <Pressable onPress={toggleOrientation} style={styles.iconButton}>
              <Ionicons name="phone-landscape-outline" size={24} color="white" />
            </Pressable>
          </View>

          {/* Middle Controls */}
          <View style={styles.middleControls}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="play-skip-back" size={40} color="white" />
            </Pressable>
            <Pressable 
              style={styles.playPauseButton}
              onPress={() => {
                if (player.playing) {
                  player.pause();
                  setIsPlaying(false);
                } else {
                  player.play();
                  setIsPlaying(true);
                }
                resetControlsTimer();
              }}
            >
              <Ionicons name={player.playing ? "pause" : "play"} size={50} color="white" />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="play-skip-forward" size={40} color="white" />
            </Pressable>
          </View>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.timeRow}>
              <Pressable onPress={() => setShowRemainingTime(!showRemainingTime)}>
                <Text style={styles.timeText}>
                  {showRemainingTime ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(currentTime)}
                </Text>
              </Pressable>
              
              {/* Fake Progress Bar for UI demo purposes */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(currentTime / Math.max(1, duration)) * 100}%` }]} />
              </View>
              
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  gestureOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  doubleTapZone: {
    flex: 1,
    height: '100%',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  filename: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  playPauseButton: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  middleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  bottomBar: {
    padding: 30,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'white',
    fontVariant: ['tabular-nums'],
    minWidth: 50,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 15,
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6', // Tailwind blue-500
    borderRadius: 2,
  },
});
