import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Music, MoreVertical, Heart } from 'lucide-react-native';
import { AudioAsset } from '../services/audioScanner';
import { useAudioStore } from '../store/useAudioStore';
import { cleanAudioTitle } from '../utils/textUtils';

interface Props {
  audio: AudioAsset;
}


function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const MiniVisualizer = React.memo(({ isPlaying }: { isPlaying: boolean }) => {
  const bar1 = useSharedValue(12);
  const bar2 = useSharedValue(16);
  const bar3 = useSharedValue(8);

  useEffect(() => {
    if (isPlaying) {
      bar1.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(12, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      bar2.value = withRepeat(
        withSequence(
          withTiming(6, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(16, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      bar3.value = withRepeat(
        withSequence(
          withTiming(14, { duration: 450, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 450, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      bar1.value = withTiming(12);
      bar2.value = withTiming(16);
      bar3.value = withTiming(8);
    }
  }, [isPlaying]);

  const style1 = useAnimatedStyle(() => ({ height: bar1.value }));
  const style2 = useAnimatedStyle(() => ({ height: bar2.value }));
  const style3 = useAnimatedStyle(() => ({ height: bar3.value }));

  return (
    <View className="flex-row items-end h-4">
      <Animated.View className="w-1 bg-blue-500 mx-0.5 rounded-full" style={style1} />
      <Animated.View className="w-1 bg-blue-500 mx-0.5 rounded-full" style={style2} />
      <Animated.View className="w-1 bg-blue-500 mx-0.5 rounded-full" style={style3} />
    </View>
  );
});

export const AudioThumbnailCard = React.memo(({ audio }: Props) => {
  const playTrack = useAudioStore((state) => state.playTrack);
  const toggleFavorite = useAudioStore((state) => state.toggleFavorite);
  const isFavorite = useAudioStore((state) => state.favorites.includes(audio.id));
  const currentTrackId = useAudioStore((state) => state.currentTrackId);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const isCurrentTrack = currentTrackId === audio.id;

  const handlePress = () => {
    playTrack(audio.id);
  };

  const handleFavorite = (e: any) => {
    e.stopPropagation(); // prevent playing track
    toggleFavorite(audio.id);
  };

  return (
    <Pressable 
      onPress={handlePress} 
      className="w-full flex-row items-center p-3 mb-2 bg-slate-100 dark:bg-slate-800 rounded-xl active:bg-slate-200 dark:active:bg-slate-700"
    >
      
      <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg justify-center items-center mr-4">
        {isCurrentTrack ? (
          <MiniVisualizer isPlaying={isPlaying} />
        ) : (
          <Music size={24} color="#3b82f6" />
        )}
      </View>
      
      
      <View className="flex-1 justify-center">
        <Text 
          className={`text-base font-medium ${isCurrentTrack ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-900 dark:text-slate-100'}`}
          numberOfLines={1}
        >
          {cleanAudioTitle(audio.filename)}
        </Text>
        <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {formatDuration(audio.duration)}
        </Text>
      </View>

      
      <Pressable onPress={handleFavorite} className="px-2" hitSlop={10}>
        <Heart size={22} color={isFavorite ? "#ef4444" : "#94a3b8"} fill={isFavorite ? "#ef4444" : "transparent"} />
      </Pressable>

    </Pressable>
  );
});
