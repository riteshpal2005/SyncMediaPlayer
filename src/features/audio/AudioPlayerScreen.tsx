import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudioStore } from '../../shared/store/useAudioStore';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

type LoopMode = 'off' | 'all' | 'one';

export default function AudioPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const audioAssets = useAudioStore((state) => state.audioAssets);
  
  const initialIndex = audioAssets.findIndex(a => a.id === id);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const currentAudio = audioAssets[currentIndex];
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState<LoopMode>('off');
  
  const player = useVideoPlayer(currentAudio?.uri || '', player => {
    player.loop = loopMode === 'one';
    player.play();
  });

  // Update loop on player instance when loopMode changes
  useEffect(() => {
    if (player) {
      player.loop = loopMode === 'one';
    }
  }, [loopMode, player]);

  // Monitor progress and handle auto-next
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
          // Handled natively by player.loop = true, but just in case
          player.currentTime = 0;
          player.play();
        } else {
          handleNext();
        }
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [player, loopMode, currentIndex, audioAssets.length]);

  const handleNext = () => {
    if (currentIndex < audioAssets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (loopMode === 'all') {
      setCurrentIndex(0); // loop back to start
    }
  };

  const handlePrev = () => {
    // If playing for more than 3 seconds, previous button restarts current track
    if (currentTime > 3) {
      if (player) {
        player.currentTime = 0;
      }
      return;
    }
    
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (loopMode === 'all') {
      setCurrentIndex(audioAssets.length - 1);
    }
  };

  const toggleLoopMode = () => {
    setLoopMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const getLoopIcon = () => {
    if (loopMode === 'one') return 'repeat-one';
    if (loopMode === 'all') return 'repeat-on';
    return 'repeat'; // off
  };

  const getLoopColor = () => {
    return loopMode === 'off' ? '#94a3b8' : '#3b82f6';
  };

  if (!currentAudio) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white' }}>Audio not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hidden VideoView to mount the player engine */}
      <VideoView style={styles.hiddenVideo} player={player} nativeControls={false} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-down" size={32} color="white" />
        </Pressable>
        <Text style={styles.topBarTitle}>Now Playing</Text>
        <View style={{ width: 32 }} /> {/* Spacer */}
      </View>

      {/* Cover Art Area */}
      <View style={styles.coverArtContainer}>
        <View style={styles.coverArtPlaceholder}>
          <Ionicons name="musical-notes" size={100} color="#3b82f6" />
        </View>
      </View>

      {/* Title & Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {currentAudio.filename}
        </Text>
        <Text style={styles.subtitle}>Unknown Artist</Text>
      </View>

      {/* Progress & Controls */}
      <View style={styles.controlsContainer}>
        {/* Progress Slider */}
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

        {/* Main Controls */}
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
                if (player.playing) {
                  player.pause();
                } else {
                  player.play();
                }
              }
            }}
          >
            <Ionicons name={player?.playing ? "pause" : "play"} size={44} color="black" style={{ marginLeft: player?.playing ? 0 : 4 }} />
          </Pressable>

          <Pressable onPress={handleNext} style={styles.iconButton}>
            <Ionicons name="play-skip-forward" size={40} color="white" />
          </Pressable>

          <Pressable style={styles.iconButton}>
            <Ionicons name="shuffle" size={28} color="#94a3b8" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-950
  },
  hiddenVideo: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 40,
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
});
