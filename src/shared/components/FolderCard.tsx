import React, { useMemo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { VideoGroup, VideoAsset } from '../services/mediaScanner';
import { useProgressStore } from '../store/useProgressStore';

interface Props {
  group: VideoGroup;
}

export const FolderCard = React.memo(({ group }: Props) => {
  const getProgress = useProgressStore((state) => state.getProgress);

  const thumbnailVideo = useMemo(() => {
    if (!group.videos || group.videos.length === 0) return null;

    let inProgressVideo: VideoAsset | null = null;
    let firstIncompleteVideo: VideoAsset | null = null;

    for (const video of group.videos) {
      const progress = getProgress(video.uri);
      if (progress && !progress.completed && progress.currentTime > 0) {
        // First in-progress video found
        inProgressVideo = video;
        break; // Priority 1 found, stop searching
      }
      
      // Keep track of the first incomplete video (not started, or 0% progress)
      if (!progress || (progress && !progress.completed)) {
        if (!firstIncompleteVideo) {
          firstIncompleteVideo = video;
        }
      }
    }

    // Priority 1: In Progress
    if (inProgressVideo) return inProgressVideo;
    // Priority 2: First incomplete (not started)
    if (firstIncompleteVideo) return firstIncompleteVideo;
    // Priority 3: All complete, default to the first one
    return group.videos[0];
  }, [group.videos, getProgress]);

  const handlePress = () => {
    // Navigate to the new folder screen, passing the albumId
    router.push(`/folder/${group.albumId}`);
  };

  if (!thumbnailVideo) return null;

  // Compute overall progress bar for the thumbnail video
  const currentProgress = getProgress(thumbnailVideo.uri);
  const progressPercent = currentProgress 
    ? Math.min(100, Math.max(0, (currentProgress.currentTime / currentProgress.duration) * 100))
    : 0;

  return (
    <Pressable onPress={handlePress} className="w-full">
      {/* Thumbnail Container */}
      <View className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative justify-center items-center">
        <Image 
          source={{ uri: thumbnailVideo.uri }} 
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        
        {/* Video Count Badge */}
        <View className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded">
          <Text className="text-white text-xs font-medium">
            {group.videos.length} items
          </Text>
        </View>

        {/* Progress Bar overlay at the very bottom of thumbnail if in progress */}
        {progressPercent > 0 && progressPercent < 100 && (
          <View className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50">
            <View 
              className="h-full bg-blue-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </View>
        )}
      </View>
      
      {/* Folder Title */}
      <Text 
        className="mt-2 text-sm text-slate-800 dark:text-slate-200 font-medium"
        numberOfLines={2}
      >
        {group.albumName}
      </Text>
    </Pressable>
  );
});
