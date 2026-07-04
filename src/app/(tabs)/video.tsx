import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { VideoGroup, VideoAsset, scanForVideos } from '../../shared/services/mediaScanner';
import { VideoThumbnailCard } from '../../shared/components/VideoThumbnailCard';

export default function VideoScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const [videoGroups, setVideoGroups] = React.useState<VideoGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadVideos() {
      try {
        const groups = await scanForVideos();
        setVideoGroups(groups);
      } catch (error: any) {
        console.warn('Failed to scan videos', error);
        setErrorMsg(error?.message || 'Failed to scan videos');
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={iconColor} />
        <Text className="mt-4 text-slate-500">Scanning device for videos...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Ionicons name="warning-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-slate-800 dark:text-slate-200 text-center">
          {errorMsg}
        </Text>
      </View>
    );
  }

  if (videoGroups.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Ionicons name="videocam-outline" size={64} color={iconColor} />
        <Text className="mt-4 text-slate-800 dark:text-slate-200">
          No videos found in Download, Movies, or Pictures.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 16 }}>
      {videoGroups.map((group) => (
        <View key={group.albumId} className="mb-8">
          <View className="px-4 mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {group.albumName}
            </Text>
            <Text className="text-sm font-medium text-slate-500">
              {group.videos.length} items
            </Text>
          </View>
          
          <View style={{ minHeight: 140 }}>
            <FlashList
              data={group.videos}
              renderItem={({ item }) => <VideoThumbnailCard video={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              estimatedItemSize={160}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}