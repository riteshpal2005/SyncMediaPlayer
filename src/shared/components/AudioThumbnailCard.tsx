import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Music, MoreVertical } from 'lucide-react-native';
import { AudioAsset } from '../services/audioScanner';
import { useAudioStore } from '../store/useAudioStore';

interface Props {
  audio: AudioAsset;
}

// Convert duration (seconds) to h:mm:ss format (hours omitted if 0)
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

  const handlePress = () => {
    playTrack(audio.id);
  };

  return (
    <Pressable 
      onPress={handlePress} 
      className="w-full flex-row items-center p-3 mb-2 bg-slate-100 dark:bg-slate-800 rounded-xl active:bg-slate-200 dark:active:bg-slate-700"
    >
      {/* Icon Container */}
      <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg justify-center items-center mr-4">
        <Music size={24} color="#3b82f6" />
      </View>
      
      {/* Audio Info */}
      <View className="flex-1 justify-center">
        <Text 
          className="text-base text-slate-900 dark:text-slate-100 font-medium"
          numberOfLines={1}
        >
          {audio.filename}
        </Text>
        <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {formatDuration(audio.duration)}
        </Text>
      </View>

      {/* Action/Menu Icon (Placeholder) */}
      <View className="px-2">
        <MoreVertical size={20} color="#94a3b8" />
      </View>
    </Pressable>
  );
});
