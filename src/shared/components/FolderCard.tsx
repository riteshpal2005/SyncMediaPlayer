import React, { useMemo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';

import { router } from 'expo-router';
import { VideoGroup, VideoAsset } from '../services/mediaScanner';
import { useProgressStore } from '../store/useProgressStore';

interface Props {
  group: VideoGroup;
}

export const FolderCard = React.memo(({ group }: Props) => {
  const progressRecord = useProgressStore((state) => state.progressRecord);

  const thumbnailVideo = useMemo(() => {
    if (!group.videos || group.videos.length === 0) return null;

    let inProgressVideo: VideoAsset | null = null;
    let firstIncompleteVideo: VideoAsset | null = null;

    for (const video of group.videos) {
      const progress = progressRecord[video.uri];
      if (progress && !progress.completed && progress.currentTime > 0) {

        inProgressVideo = video;
        break; // Priority 1 found, stop searching
      }
      

      if (!progress || (progress && !progress.completed)) {
        if (!firstIncompleteVideo) {
          firstIncompleteVideo = video;
        }
      }
    }


    if (inProgressVideo) return inProgressVideo;

    if (firstIncompleteVideo) return firstIncompleteVideo;

    return group.videos[0];
  }, [group.videos, progressRecord]);

  const handlePress = () => {

    router.push(`/folder/${group.albumId}`);
  };

  if (!thumbnailVideo) return null;


  const currentProgress = progressRecord[thumbnailVideo.uri];
  const progressPercent = currentProgress 
    ? Math.min(100, Math.max(0, (currentProgress.currentTime / currentProgress.duration) * 100))
    : 0;

  return (
    <Pressable onPress={handlePress} className="w-full">
      
      <View className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative justify-center items-center">
        <Image 
          source={{ uri: thumbnailVideo.uri }} 
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        
        
        <View className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded">
          <Text className="text-slate-200 text-xs font-medium">
            {group.videos.length} items
          </Text>
        </View>

        
        {progressPercent > 0 && progressPercent < 100 && (
          <View className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50">
            <View 
              className="h-full bg-blue-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </View>
        )}
      </View>
      
      
      <Text 
        className="mt-2 text-sm text-slate-900 dark:text-slate-100 font-medium"
        numberOfLines={2}
      >
        {group.albumName}
      </Text>
    </Pressable>
  );
});
