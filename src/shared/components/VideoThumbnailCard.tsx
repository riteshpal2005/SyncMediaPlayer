import React from 'react';
import { View, Text, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { VideoAsset } from '../services/mediaScanner';

interface Props {
  video: VideoAsset;
}

// Convert duration (seconds) to mm:ss format
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const VideoThumbnailCard = React.memo(({ video }: Props) => {
  return (
    <View className="mr-4 w-40">
      {/* Thumbnail Container */}
      <View className="w-40 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative justify-center items-center">
        {/* We use React Native's Image component which can natively extract a frame from a local video URI */}
        <Image 
          source={{ uri: video.uri }} 
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        
        {/* Play Icon Overlay */}
        <View className="absolute bg-black/40 rounded-full p-2">
          <Ionicons name="play" size={20} color="white" />
        </View>

        {/* Duration Badge */}
        <View className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded">
          <Text className="text-white text-xs font-medium">
            {formatDuration(video.duration)}
          </Text>
        </View>
      </View>
      
      {/* Video Title */}
      <Text 
        className="mt-2 text-sm text-slate-800 dark:text-slate-200 font-medium"
        numberOfLines={2}
      >
        {video.filename}
      </Text>
    </View>
  );
});
