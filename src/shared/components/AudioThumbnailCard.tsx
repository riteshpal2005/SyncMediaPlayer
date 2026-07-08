import React from 'react';
import { View, Text, Pressable } from 'react-native';
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

export const AudioThumbnailCard = React.memo(({ audio }: Props) => {
  const playTrack = useAudioStore((state) => state.playTrack);
  const toggleFavorite = useAudioStore((state) => state.toggleFavorite);
  const isFavorite = useAudioStore((state) => state.favorites.includes(audio.id));
  const currentTrackId = useAudioStore((state) => state.currentTrackId);
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
          <View className="flex-row items-end h-4">
            <View className="w-1 h-3 bg-blue-500 mx-0.5 rounded-full" />
            <View className="w-1 h-4 bg-blue-500 mx-0.5 rounded-full" />
            <View className="w-1 h-2 bg-blue-500 mx-0.5 rounded-full" />
          </View>
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
