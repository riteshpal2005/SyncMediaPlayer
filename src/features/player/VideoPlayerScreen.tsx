import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Brightness from 'expo-brightness';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { useProgressStore } from '../../shared/store/useProgressStore';



const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function VideoPlayerScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { uri, filename } = useLocalSearchParams<{ uri: string; filename: string }>();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showRemainingTime, setShowRemainingTime] = useState(false);
  const [brightness, setBrightness] = useState(0.5);
  const brightnessRef = useRef(0.5);
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  
  const updateProgress = useProgressStore((state) => state.updateProgress);
  const getProgress = useProgressStore((state) => state.getProgress);
  
  const savedProgressRef = useRef(getProgress(uri));

  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    // Auto-restore progress on start
    if (savedProgressRef.current && !savedProgressRef.current.completed && savedProgressRef.current.currentTime > 0) {
      player.currentTime = savedProgressRef.current.currentTime;
    }
    player.play();
  });

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      const current = player.currentTime || 0;
      setCurrentTime(current);
      
      const dur = player.duration || 0;
      
      if (savedProgressRef.current && current === 0 && dur > 0) {
        // Still seeking to the initial restore point, don't overwrite with 0
        return;
      } else if (current > 0) {
        savedProgressRef.current = undefined; // Restored successfully
      }

      if (dur > 0) {
        setDuration(dur);
        // Persist progress periodically
        updateProgress(uri, current, dur);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player, uri, updateProgress]);

  const toggleControls = () => {
    setControlsVisible(prev => {
      const next = !prev;
      if (next) {
        if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        hideControlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
      } else {
        if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      }
      return next;
    });
  };

  const resetControlsTimer = () => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const toggleFullscreen = async () => {
    if (isLocked) return;
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsFullscreen(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
    }
    resetControlsTimer();
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    resetControlsTimer();
  };

  const cyclePlaybackRate = () => {
    if (!player || isLocked) return;
    const nextRate = playbackRate === 1.0 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 2.0 : playbackRate === 2.0 ? 0.5 : 1.0;
    player.playbackRate = nextRate;
    setPlaybackRate(nextRate);
    resetControlsTimer();
  };

  // Gestures Update Handlers
  const handleGestureUpdate = (translationY: number, absoluteX: number) => {
    if (isLocked) return;
    resetControlsTimer();
    if (absoluteX < SCREEN_WIDTH / 2) {
      const newBrightness = Math.max(0, Math.min(1, brightnessRef.current - (translationY / SCREEN_HEIGHT)));
      Brightness.setBrightnessAsync(newBrightness);
      setBrightness(newBrightness);
      brightnessRef.current = newBrightness;
    } else {
      if (player) {
        const currentVol = player.volume;
        const newVol = Math.max(0, Math.min(1, currentVol - (translationY / SCREEN_HEIGHT)));
        player.volume = newVol;
      }
    }
  };

  const handleDoubleTap = (direction: 'left' | 'right') => {
    if (!player || isLocked) return;
    if (direction === 'left') {
      player.currentTime = Math.max(0, player.currentTime - 5);
    } else {
      player.currentTime = Math.min(player.duration, player.currentTime + 5);
    }
    resetControlsTimer();
  };

  // Define Gestures
  const panGesture = Gesture.Pan().onUpdate((event) => {
    scheduleOnRN(handleGestureUpdate, event.translationY, event.absoluteX);
  });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (event.absoluteX < SCREEN_WIDTH / 2) {
        scheduleOnRN(handleDoubleTap, 'left');
      } else {
        scheduleOnRN(handleDoubleTap, 'right');
      }
    });

  const singleTap = Gesture.Tap()
    .onEnd(() => {
      scheduleOnRN(toggleControls);
    });

  // Prioritize double tap over single tap
  singleTap.requireExternalGestureToFail(doubleTap);

  // Combine them all
  const composedGestures = Gesture.Simultaneous(
    panGesture,
    Gesture.Exclusive(doubleTap, singleTap)
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        allowsPictureInPicture
      />

      {/* Unified Gesture Overlay */}
      <GestureDetector gesture={composedGestures}>
        <View style={StyleSheet.absoluteFill}>
          
          {/* UI Controls - Rendered on top of video, but under gesture detector (or visually above, interactions pass through) */}
          {/* We must place UI elements *outside* the Gesture Detector if they need their own press events, OR set absolute position on top */}
        </View>
      </GestureDetector>

      {/* UI Controls overlay (Absolute positioned on top of Gesture Detector to receive button presses) */}
      {controlsVisible && (
        <View style={styles.controlsContainer} pointerEvents="box-none">
          
          <View style={styles.darkGradientOverlay} pointerEvents="none" />

          <View style={styles.topBar}>
            <View style={styles.topLeft}>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={28} color="white" />
              </Pressable>
              <Text style={styles.filename} numberOfLines={1}>{filename}</Text>
            </View>

            {!isLocked && (
              <View style={styles.topRight}>
                <Pressable onPress={cyclePlaybackRate} style={[styles.iconButton, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                  <MaterialIcons name="speed" size={24} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{playbackRate}x</Text>
                </Pressable>
                <Pressable onPress={() => { setSubtitlesEnabled(!subtitlesEnabled); resetControlsTimer(); }} style={styles.iconButton}>
                  <MaterialIcons name="closed-caption" size={26} color={subtitlesEnabled ? "#3b82f6" : "white"} />
                </Pressable>
                <Pressable onPress={() => { resetControlsTimer(); }} style={styles.iconButton}>
                  <MaterialIcons name="audiotrack" size={24} color="white" />
                </Pressable>
              </View>
            )}
          </View>

          {/* Middle Controls */}
          {!isLocked && (
            <View style={styles.middleControls}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="play-skip-back" size={40} color="white" />
              </Pressable>
              <Pressable 
                style={styles.playPauseButton}
                onPress={() => {
                  if (player.playing) {
                    player.pause();
                  } else {
                    player.play();
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
          )}

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.timeRow}>
              <Pressable onPress={toggleLock} style={[styles.iconButton, { marginRight: 10 }]}>
                <Ionicons name={isLocked ? "lock-closed" : "lock-open"} size={24} color={isLocked ? "#ef4444" : "white"} />
              </Pressable>

              {!isLocked && (
                <>
                  <Pressable onPress={() => setShowRemainingTime(!showRemainingTime)}>
                    <Text style={styles.timeText}>
                      {showRemainingTime ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(currentTime)}
                    </Text>
                  </Pressable>
                  
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={Math.max(1, duration)}
                    value={currentTime}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#3b82f6"
                    onSlidingStart={() => {
                      // Pause controls auto-hide while scrubbing
                      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
                    }}
                    onSlidingComplete={(val) => {
                      player.currentTime = val;
                      resetControlsTimer();
                    }}
                  />
                  
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>

                  <Pressable onPress={toggleFullscreen} style={[styles.iconButton, { marginLeft: 10 }]}>
                    <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="white" />
                  </Pressable>
                </>
              )}
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
  darkGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  filename: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flexShrink: 1,
  },
  iconButton: {
    padding: 10,
  },
  playPauseButton: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
  },
  middleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  bottomBar: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'white',
    fontVariant: ['tabular-nums'],
    minWidth: 45,
    textAlign: 'center',
    fontWeight: '500',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
});
