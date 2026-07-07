import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useVideoStore } from '../../shared/store/useVideoStore';
import { VideoThumbnailCard } from '../../shared/components/VideoThumbnailCard';
import { VideoAsset } from '../../shared/services/mediaScanner';

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { videoGroups } = useVideoStore();

  const group = useMemo(() => {
    return videoGroups.find((g) => g.albumId === id);
  }, [videoGroups, id]);

  const gridData = useMemo(() => {
    if (!group) return [];
    const data = [];
    const COLUMNS = 2; // Flat 2 column grid for videos inside the folder

    for (let i = 0; i < group.videos.length; i += COLUMNS) {
      data.push({
        id: `row-${i}`,
        videos: group.videos.slice(i, i + COLUMNS),
      });
    }
    return data;
  }, [group]);

  if (!group) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-slate-900">
        <Text className="text-slate-800 dark:text-slate-200">Folder not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 p-2 bg-blue-500 rounded">
          <Text className="text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const renderItem = ({ item }: { item: { id: string; videos: VideoAsset[] } }) => (
    <View className="flex-row px-2 mb-4">
      {item.videos.map((video) => (
        <View key={video.id} style={{ flex: 1, paddingHorizontal: 4 }}>
          <VideoThumbnailCard video={video} />
        </View>
      ))}
      {/* Fill empty spaces if row is not full */}
      {Array.from({ length: 2 - item.videos.length }).map((_, idx) => (
        <View key={`empty-${idx}`} style={{ flex: 1, paddingHorizontal: 4 }} />
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4 bg-slate-100 dark:bg-slate-800">
        <Pressable onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </Pressable>
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 flex-1">
          {group.albumName}
        </Text>
        <Text className="text-sm text-slate-500">
          {group.videos.length} items
        </Text>
      </View>

      <View className="flex-1 pt-4">
        <FlashList
          data={gridData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          // @ts-ignore: estimatedItemSize exists in FlashList but typing fails
          estimatedItemSize={150}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
