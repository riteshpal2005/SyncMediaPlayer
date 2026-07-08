import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';

import { router } from 'expo-router';
import { VideoAsset } from '../services/mediaScanner';

interface Props {
  video: VideoAsset;
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

export const VideoThumbnailCard = React.memo(({ video }: Props) => {
  const handlePress = () => {
    router.push({
      pathname: '/player',
      params: { uri: video.uri, filename: video.filename }
    });
  };

  return (
    <Pressable onPress={handlePress} className="w-full">
      
      <View className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative justify-center items-center">
        
        <Image 
          source={{ uri: video.uri }} 
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        

        
        <View className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded">
          <Text className="text-slate-200 text-xs font-medium">
            {formatDuration(video.duration)}
          </Text>
        </View>
      </View>
      
      
      <Text 
        className="mt-2 text-sm text-slate-900 dark:text-slate-100 font-medium"
        numberOfLines={2}
      >
        {video.filename}
      </Text>
    </Pressable>
  );
});

