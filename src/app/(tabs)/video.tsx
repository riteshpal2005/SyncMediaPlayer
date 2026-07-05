import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useVideoStore } from '../../shared/store/useVideoStore';
import { VideoThumbnailCard } from '../../shared/components/VideoThumbnailCard';
import { CustomSplashScreen } from '../../shared/components/CustomSplashScreen';
import { VideoAsset, VideoGroup } from '../../shared/services/mediaScanner';

type ListItem =
  | { type: 'header'; id: string; title: string; count: number }
  | { type: 'row'; id: string; videos: VideoAsset[] };

export default function VideoScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const { videoGroups, isLoading, errorMsg, scanVideos, isInitialScanCompleted } = useVideoStore();

  useEffect(() => {
    // Only triggers scan if not completed, preventing re-scan on tab switch
    scanVideos();
  }, [scanVideos]);

  const onRefresh = useCallback(() => {
    scanVideos(true); // Force refresh
  }, [scanVideos]);

  const gridData = useMemo(() => {
    const data: ListItem[] = [];
    const COLUMNS = 3;

    videoGroups.forEach((group) => {
      // Don't render a header for ungrouped items
      if (group.albumId !== 'ungrouped') {
        data.push({
          type: 'header',
          id: `header-${group.albumId}`,
          title: group.albumName,
          count: group.videos.length,
        });
      }

      // Chunk videos into rows of length COLUMNS
      for (let i = 0; i < group.videos.length; i += COLUMNS) {
        data.push({
          type: 'row',
          id: `row-${group.albumId}-${i}`,
          videos: group.videos.slice(i, i + COLUMNS),
        });
      }
    });

    return data;
  }, [videoGroups]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View className="px-4 mt-6 mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {item.title}
          </Text>
          <Text className="text-sm font-medium text-slate-500">
            {item.count} items
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-row px-2 mb-4">
        {item.videos.map((video) => (
          <View key={video.id} style={{ flex: 1, paddingHorizontal: 4 }}>
            <VideoThumbnailCard video={video} />
          </View>
        ))}
        {/* Render empty views to fill remaining flex space if row is not full */}
        {Array.from({ length: 3 - item.videos.length }).map((_, idx) => (
          <View key={`empty-${idx}`} style={{ flex: 1, paddingHorizontal: 4 }} />
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <CustomSplashScreen />

      {errorMsg ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text className="mt-4 text-slate-800 dark:text-slate-200 text-center">
            {errorMsg}
          </Text>
          <ScrollView 
            className="absolute w-full h-full"
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />} 
          />
        </View>
      ) : videoGroups.length === 0 && isInitialScanCompleted ? (
        <ScrollView 
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        >
          <Ionicons name="videocam-outline" size={64} color={iconColor} />
          <Text className="mt-4 text-slate-800 dark:text-slate-200">
            No videos found on this device.
          </Text>
        </ScrollView>
      ) : (
        <View className="flex-1 pt-2">
          <FlashList
            data={gridData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            getItemType={(item) => item.type}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading && isInitialScanCompleted}
                onRefresh={onRefresh} 
                colors={['#3b82f6']}
                tintColor="#3b82f6"
              />
            }
          />
        </View>
      )}
    </View>
  );
}