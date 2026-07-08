import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Dimensions, Modal } from 'react-native';
import PagerView from 'react-native-pager-view';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { VideoPlayer } from 'expo-video';
import Slider from '@react-native-community/slider';
import { Music, SkipBack, SkipForward, Play, Pause, ChevronDown, Shuffle, Repeat, Repeat1 } from 'lucide-react-native';
import { useAudioStore, LoopMode } from '../../shared/store/useAudioStore';
import { LyricsScreen } from './LyricsScreen';
import { VisualizerScreen } from './VisualizerScreen';
import { fetchAlbumArt } from '../../shared/services/albumArtService';
import { cleanAudioTitle } from '../../shared/utils/textUtils';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const isShuffle = useAudioStore((state) => state.isShuffle);
  const audioAssets = useAudioStore((state) => state.audioAssets);
  
  const { setPlayerExpanded, setLoopMode, toggleShuffle, nextTrack, prevTrack } = useAudioStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const isScrubbing = useRef(false);
  const hasAutoAdvancedRef = useRef(false);
  const [optimisticPlaying, setOptimisticPlaying] = useState<boolean | null>(null);
  const [isMountingHeavy, setIsMountingHeavy] = useState(true);
  
  const isCurrentlyPlaying = optimisticPlaying !== null ? optimisticPlaying : !!player?.playing;

  const currentAudio = audioAssets.find(a => a.id === currentTrackId);

  // Reset auto-advance flag when track changes
  useEffect(() => {
    hasAutoAdvancedRef.current = false;
  }, [currentTrackId]);


  useEffect(() => {
    let isMounted = true;
    if (currentAudio) {
      setAlbumArt(null); // Reset when track changes
      
      const loadArt = async () => {

        const itunesArt = await fetchAlbumArt(currentAudio.filename, 'Unknown Artist');
        if (isMounted && itunesArt) {
          setAlbumArt(itunesArt);
        }
      };
      
      loadArt();
    }
    return () => { isMounted = false; };
  }, [currentAudio?.id]);


  useEffect(() => {
    if (player) {
      player.loop = loopMode === 'one';
    }
  }, [loopMode, player]);


  useEffect(() => {
    if (!player) return;
    
    const interval = setInterval(() => {
      const current = player.currentTime || 0;
      

      if (!isScrubbing.current) {
        setCurrentTime(current);
      }
      if (player.playing !== useAudioStore.getState().isPlaying) {
        useAudioStore.getState().setIsPlaying(player.playing);
      }
      if (optimisticPlaying !== null && player.playing === optimisticPlaying) {
        setOptimisticPlaying(null);
      }

      const dur = player.duration || 0;
      if (dur > 0) {
        setDuration(dur);
      }
      
      // Auto-next logic when track finishes
      if (dur > 0 && !player.playing && Math.abs(current - dur) < 0.5) {
        if (!hasAutoAdvancedRef.current) {
          hasAutoAdvancedRef.current = true;
          if (loopMode === 'one') {
            player.currentTime = 0;
            player.play();
            setTimeout(() => { hasAutoAdvancedRef.current = false; }, 1000);
          } else {
            nextTrack();
          }
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

  const renderLoopIcon = () => {
    if (loopMode === 'one') return <Repeat1 size={28} color={getLoopColor()} />;
    return <Repeat size={28} color={getLoopColor()} />;
  };

  const getLoopColor = () => {
    return loopMode === 'off' ? '#94a3b8' : '#3b82f6';
  };

  const handlePrev = () => {
    if (currentTime > 3) {
      if (player) player.currentTime = 0;
      return;
    }
    prevTrack();
  };

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const activeAxis = useSharedValue<'x' | 'y' | null>(null);


  useEffect(() => {
    if (isExpanded) {
      setIsMountingHeavy(true);
      translateY.value = SCREEN_HEIGHT;
      translateX.value = 0;
    }
  }, [isExpanded, translateY, translateX]);

  const finishMountingHeavy = () => {
    setIsMountingHeavy(false);
  };

  const handleModalShow = () => {
    translateY.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        scheduleOnRN(finishMountingHeavy);
      }
    });
  };

  const finishMinimize = () => {
    setPlayerExpanded(false);
  };

  const handleMinimize = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
      if (finished) {
        scheduleOnRN(finishMinimize);
      }
    });
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-10, 10])
    .onStart(() => {
      activeAxis.value = 'y'; // Force vertical only for closing modal
    })
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (translateY.value > 150 || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
          if (finished) {
            scheduleOnRN(finishMinimize);
          }
        });
      } else {
        translateY.value = withTiming(0, { duration: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ] as any,
      opacity: translateY.value > 0 ? 1 - (translateY.value / (SCREEN_HEIGHT * 1.5)) : 1
    };
  });

  const handlePlayPause = () => {
    if (!player) return;
    const newPlaying = !(optimisticPlaying !== null ? optimisticPlaying : player.playing);
    setOptimisticPlaying(newPlaying);
    if (newPlaying) {
      if (player.currentTime >= (player.duration || 0) - 0.5) {
        player.currentTime = 0;
      }
      player.play();
    } else {
      player.pause();
    }
  };


  return (
    <>
      {!isExpanded && (
        <View className="absolute bottom-0 left-0 right-0 h-16 bg-slate-800 flex-row items-center rounded-t-2xl border-t border-x border-slate-700 overflow-hidden z-50">
          <Pressable 
            className="flex-1 flex-row items-center px-4 h-full"
            onPress={() => setPlayerExpanded(true)}
          >
            <View className="w-9 h-9 bg-blue-500 rounded-lg justify-center items-center mr-3 overflow-hidden">
              {albumArt ? (
                <Animated.Image source={{ uri: albumArt }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Music size={20} color="white" />
              )}
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-white text-sm font-semibold" numberOfLines={1}>{cleanAudioTitle(currentAudio.filename)}</Text>
            </View>
          </Pressable>
          
          <View className="flex-row items-center pr-2.5">
            <Pressable className="p-2.5" onPress={handlePrev}>
              <SkipBack size={24} color="white" />
            </Pressable>
            <Pressable 
              className="p-2.5"
              onPress={handlePlayPause}
            >
              {isCurrentlyPlaying ? <Pause size={28} color="white" /> : <Play size={28} color="white" />}
            </Pressable>
            <Pressable className="p-2.5" onPress={nextTrack}>
              <SkipForward size={24} color="white" />
            </Pressable>
          </View>

          
          {duration > 0 && (
            <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-700/50">
              <View 
                className="h-full bg-blue-500"
                style={{ width: `${(currentTime / duration) * 100}%` }} 
              />
            </View>
          )}
        </View>
      )}

      <Modal
        visible={isExpanded}
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={handleMinimize}
        onShow={handleModalShow}
      >
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Animated.View 
            style={[
              { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#0f172a', paddingTop: 24, zIndex: 100, elevation: 100 }, 
              animatedStyle
            ]}
          >
            <GestureDetector gesture={panGesture}>
              <View style={{ flex: 1 }}>
                <View className="flex-row items-center justify-between px-5 mb-5 mt-4">
                  <Pressable onPress={handleMinimize} className="p-2.5">
                  <ChevronDown size={32} color="white" />
                </Pressable>
                <Text className="text-white text-sm font-semibold tracking-widest uppercase">Now Playing</Text>
                <View style={{ width: 32 }} />
              </View>

              <PagerView
                initialPage={1}
                style={{ flex: 1 }}
                overdrag={false}
              >
                
                <View key="0">
                  {!isMountingHeavy && (
                    <LyricsScreen 
                      title={cleanAudioTitle(currentAudio.filename)} 
                      artist="Unknown Artist" 
                      currentTime={currentTime}
                      player={player}
                    />
                  )}
                </View>

                
                <View key="1">
                  <View className="flex-1 justify-center items-center px-10">
                    <View className="w-full aspect-square bg-slate-800 rounded-[20px] justify-center items-center shadow-lg shadow-black/50 elevation-10 overflow-hidden">
                      {albumArt ? (
                        <Animated.Image 
                          source={{ uri: albumArt }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Music size={100} color="#3b82f6" />
                      )}
                    </View>
                  </View>

                  <View className="px-[30px] mb-[30px] items-center">
                    <Text className="text-white text-2xl font-bold text-center mb-2" numberOfLines={2}>
                      {cleanAudioTitle(currentAudio.filename)}
                    </Text>
                    <Text className="text-slate-400 text-base font-medium">Unknown Artist</Text>
                  </View>
                </View>

                
                <View key="2">
                  {!isMountingHeavy && <VisualizerScreen isPlaying={isCurrentlyPlaying} title={cleanAudioTitle(currentAudio.filename)} />}
                </View>
              </PagerView>
            </View>
          </GestureDetector>

          <View className="px-[30px] pb-[50px]">
        <View className="mb-[30px] flex-row items-center">
          <Text className="text-slate-400 text-xs tabular-nums w-[45px] text-center">{formatTime(currentTime)}</Text>
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={0}
            maximumValue={Math.max(1, duration)}
            value={currentTime}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#334155"
            thumbTintColor="#3b82f6"
            tapToSeek={true}
            onSlidingStart={() => {
              isScrubbing.current = true;
            }}
            onValueChange={(val) => {
              setCurrentTime(val);
            }}
            onSlidingComplete={(val) => {
              if (player) player.currentTime = val;
              isScrubbing.current = false;
            }}
          />
          <Text className="text-slate-400 text-xs tabular-nums w-[45px] text-center">{formatTime(duration)}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Pressable onPress={toggleLoopMode} className="p-2.5">
            {renderLoopIcon()}
          </Pressable>

          <Pressable onPress={handlePrev} className="p-2.5">
            <SkipBack size={40} color="white" />
          </Pressable>

          <Pressable 
            className="w-[72px] h-[72px] bg-white rounded-full justify-center items-center shadow-lg shadow-blue-500/50 elevation-10"
            onPress={handlePlayPause}
          >
            {isCurrentlyPlaying ? (
              <Pause size={44} color="black" />
            ) : (
              <Play size={44} color="black" style={{ marginLeft: 4 }} />
            )}
          </Pressable>

          <Pressable onPress={nextTrack} className="p-2.5">
            <SkipForward size={40} color="white" />
          </Pressable>

          <Pressable onPress={toggleShuffle} className="p-2.5">
            <Shuffle size={28} color={isShuffle ? "#3b82f6" : "#94a3b8"} />
          </Pressable>
        </View>
      </View>
        </Animated.View>
      </GestureHandlerRootView>
      </Modal>
    </>
  );
}
