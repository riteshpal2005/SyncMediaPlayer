import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useVideoStore } from '../../shared/store/useVideoStore';
import { VideoThumbnailCard } from '../../shared/components/VideoThumbnailCard';
import { FolderCard } from '../../shared/components/FolderCard';
import { CustomSplashScreen } from '../../shared/components/CustomSplashScreen';
import { VideoAsset, VideoGroup } from '../../shared/services/mediaScanner';

type GridItem = 
  | { type: 'folder'; group: VideoGroup; id: string }
  | { type: 'video'; video: VideoAsset; id: string };

type RowItem = {
  id: string;
  items: GridItem[];
};

export default function VideoScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const { videoGroups, isLoading, errorMsg, scanVideos, isInitialScanCompleted } = useVideoStore();

  useEffect(() => {
    scanVideos();
  }, [scanVideos]);

  const onRefresh = useCallback(() => {
    scanVideos(true);
  }, [scanVideos]);

  const gridData = useMemo(() => {
    const flatItems: GridItem[] = [];

    // Separate ungrouped from grouped
    const ungroupedGroup = videoGroups.find(g => g.albumId === 'ungrouped');
    const folderGroups = videoGroups.filter(g => g.albumId !== 'ungrouped');

    // Add folder cards
    folderGroups.forEach(group => {
      flatItems.push({ type: 'folder', group, id: `folder-${group.albumId}` });
    });

    // Add ungrouped videos
    if (ungroupedGroup) {
      ungroupedGroup.videos.forEach(video => {
        flatItems.push({ type: 'video', video, id: `video-${video.id}` });
      });
    }

    // Chunk into rows of 2
    const data: RowItem[] = [];
    const COLUMNS = 2;
    for (let i = 0; i < flatItems.length; i += COLUMNS) {
      data.push({
        id: `row-${i}`,
        items: flatItems.slice(i, i + COLUMNS),
      });
    }

    return data;
  }, [videoGroups]);

  const renderItem = ({ item }: { item: RowItem }) => {
    return (
      <View className="flex-row px-2 mb-4">
        {item.items.map((gridItem) => (
          <View key={gridItem.id} style={{ flex: 1, paddingHorizontal: 4 }}>
            {gridItem.type === 'folder' ? (
              <FolderCard group={gridItem.group} />
            ) : (
              <VideoThumbnailCard video={gridItem.video} />
            )}
          </View>
        ))}
        {Array.from({ length: 2 - item.items.length }).map((_, idx) => (
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
        <View className="flex-1 pt-4">
          <FlashList
            data={gridData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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