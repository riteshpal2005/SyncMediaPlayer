import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, Modal } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { VideoPlayer } from 'expo-video';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudioStore } from '../../shared/store/useAudioStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  player: VideoPlayer | null;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function AudioPlayerOverlay({ player }: Props) {
  const currentTrackId = useAudioStore((state) => state.currentTrackId);
  const isExpanded = useAudioStore((state) => state.isPlayerExpanded);
  const loopMode = useAudioStore((state) => state.loopMode);
  const audioAssets = useAudioStore((state) => state.audioAssets);
  
  const { setPlayerExpanded, setLoopMode, nextTrack, prevTrack } = useAudioStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentAudio = audioAssets.find(a => a.id === currentTrackId);

  // Update loop mode in player engine
  useEffect(() => {
    if (player) {
      player.loop = loopMode === 'one';
    }
  }, [loopMode, player]);

  // Sync state manually from player to React state (for slider and display)
  useEffect(() => {
    if (!player) return;
    
    const interval = setInterval(() => {
      const current = player.currentTime || 0;
      setCurrentTime(current);
      
      const dur = player.duration || 0;
      if (dur > 0) setDuration(dur);

      // Auto-next logic when track finishes
      if (dur > 0 && !player.playing && Math.abs(current - dur) < 0.5) {
        if (loopMode === 'one') {
          player.currentTime = 0;
          player.play();
        } else {
          nextTrack();
        }
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [player, loopMode, nextTrack]);

  if (!currentTrackId || !currentAudio) return null;

  const toggleLoopMode = () => {
    if (loopMode === 'off') setLoopMode('all');
    else if (loopMode === 'all') setLoopMode('one');
    else setLoopMode('off');
  };

  const getLoopIcon = () => {
    if (loopMode === 'one') return 'repeat-one';
    if (loopMode === 'all') return 'repeat-on';
    return 'repeat';
  };

  const getLoopColor = () => {
    return loopMode === 'off' ? '#94a3b8' : '#3b82f6';
  };

  const handlePrev = () => {
    if (currentTime > 3 && player) {
      player.currentTime = 0;
      return;
    }
    prevTrack();
  };

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const activeAxis = useSharedValue<'x' | 'y' | null>(null);

  // Smooth entrance animation when expanded
  useEffect(() => {
    if (isExpanded) {
      translateY.value = SCREEN_HEIGHT;
      translateY.value = withSpring(0, { damping: 25, stiffness: 200 });
      translateX.value = 0;
    }
  }, [isExpanded, translateY, translateX]);

  const minimizePlayer = () => {
    setPlayerExpanded(false);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      activeAxis.value = null;
    })
    .onUpdate((event) => {
      if (!activeAxis.value) {
        if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
          activeAxis.value = 'x';
        } else {
          activeAxis.value = 'y';
        }
      }

      if (activeAxis.value === 'x') {
        translateX.value = event.translationX;
      } else {
        // Only drag down
        if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      }
    })
    .onEnd((event) => {
      if (activeAxis.value === 'y') {
        if (translateY.value > 150 || event.velocityY > 500) {
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
            runOnJS(minimizePlayer)();
          });
        } else {
          translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      } else if (activeAxis.value === 'x') {
        if (translateX.value > 100 || event.velocityX > 500) {
          runOnJS(handlePrev)();
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        } else if (translateX.value < -100 || event.velocityX < -500) {
          runOnJS(nextTrack)();
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        } else {
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ],
      opacity: translateY.value > 0 ? 1 - (translateY.value / (SCREEN_HEIGHT * 1.5)) : 1
    };
  });

  // ----- MINIMIZED DOCK UI -----
  if (!isExpanded) {
    return (
      <View style={styles.dockContainer}>
        <Pressable 
          style={styles.dockContent} 
          onPress={() => setPlayerExpanded(true)}
        >
          <View style={styles.dockIcon}>
            <Ionicons name="musical-note" size={20} color="white" />
          </View>
          <View style={styles.dockInfo}>
            <Text style={styles.dockTitle} numberOfLines={1}>{currentAudio.filename}</Text>
          </View>
        </Pressable>
        
        <View style={styles.dockControls}>
          <Pressable style={styles.dockButton} onPress={handlePrev}>
            <Ionicons name="play-skip-back" size={24} color="white" />
          </Pressable>
          <Pressable 
            style={styles.dockButton}
            onPress={() => {
              if (player) {
                if (player.playing) player.pause();
                else player.play();
              }
            }}
          >
            <Ionicons name={player?.playing ? "pause" : "play"} size={28} color="white" />
          </Pressable>
          <Pressable style={styles.dockButton} onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={24} color="white" />
          </Pressable>
        </View>

        {/* Progress Bar overlay on dock */}
        {duration > 0 && (
          <View style={styles.dockProgressBg}>
            <View 
              style={[styles.dockProgressFill, { width: `${(currentTime / duration) * 100}%` }]} 
            />
          </View>
        )}
      </View>
    );
  }

  // ----- FULLSCREEN MODAL UI -----
  return (
    <Modal
      visible={true}
      animationType="none"
      transparent={true}
      onRequestClose={minimizePlayer}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.fullContainer, animatedStyle]}>
      
      <View style={styles.topBar}>
        <Pressable onPress={() => setPlayerExpanded(false)} style={styles.iconButton}>
          <Ionicons name="chevron-down" size={32} color="white" />
        </Pressable>
        <Text style={styles.topBarTitle}>Now Playing</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.coverArtContainer}>
        <View style={styles.coverArtPlaceholder}>
          <Ionicons name="musical-notes" size={100} color="#3b82f6" />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {currentAudio.filename}
        </Text>
        <Text style={styles.subtitle}>Unknown Artist</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(1, duration)}
            value={currentTime}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#334155"
            thumbTintColor="#3b82f6"
            onSlidingComplete={(val) => {
              if (player) player.currentTime = val;
            }}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.mainControls}>
          <Pressable onPress={toggleLoopMode} style={styles.iconButton}>
            <MaterialIcons name={getLoopIcon()} size={28} color={getLoopColor()} />
          </Pressable>

          <Pressable onPress={handlePrev} style={styles.iconButton}>
            <Ionicons name="play-skip-back" size={40} color="white" />
          </Pressable>

          <Pressable 
            style={styles.playPauseButton}
            onPress={() => {
              if (player) {
                if (player.playing) player.pause();
                else player.play();
              }
            }}
          >
            <Ionicons name={player?.playing ? "pause" : "play"} size={44} color="black" style={{ marginLeft: player?.playing ? 0 : 4 }} />
          </Pressable>

          <Pressable onPress={nextTrack} style={styles.iconButton}>
            <Ionicons name="play-skip-forward" size={40} color="white" />
          </Pressable>

          <Pressable style={styles.iconButton}>
            <Ionicons name="shuffle" size={28} color="#94a3b8" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
    </GestureDetector>
    </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    backgroundColor: '#0f172a', // slate-950
    zIndex: 100,
    elevation: 100,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    marginBottom: 20,
  },
  topBarTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iconButton: {
    padding: 10,
  },
  coverArtContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  coverArtPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  infoContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  sliderContainer: {
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: -10,
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 72,
    height: 72,
    backgroundColor: 'white',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  
  // DOCK STYLES
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    borderBottomWidth: 0,
    overflow: 'hidden',
    zIndex: 50,
  },
  dockContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  dockIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dockInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dockTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  dockButton: {
    padding: 10,
  },
  dockProgressBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'transparent',
  },
  dockProgressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  }
});
