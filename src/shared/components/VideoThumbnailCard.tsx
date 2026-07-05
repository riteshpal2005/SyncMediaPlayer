import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { VideoAsset } from '../services/mediaScanner';

interface Props {
  video: VideoAsset;
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

export const VideoThumbnailCard = React.memo(({ video }: Props) => {
  const handlePress = () => {
    router.push({
      pathname: '/player',
      params: { uri: video.uri, filename: video.filename }
    });
  };

  return (
    <Pressable onPress={handlePress} className="w-full">
      {/* Thumbnail Container */}
      <View className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative justify-center items-center">
        {/* We use React Native's Image component which can natively extract a frame from a local video URI */}
        <Image 
          source={{ uri: video.uri }} 
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        

        {/* Duration Badge */}
        <View className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded">
          <Text className="text-[var(--color-text-primary)] text-xs font-medium">
            {formatDuration(video.duration)}
          </Text>
        </View>
      </View>
      
      {/* Video Title */}
      <Text 
        className="mt-2 text-sm text-[var(--color-text-primary)] font-medium"
        numberOfLines={2}
      >
        {video.filename}
      </Text>
    </Pressable>
  );
});

