import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useVideoStore } from '../../shared/store/useVideoStore';
import { VideoThumbnailCard } from '../../shared/components/VideoThumbnailCard';
import { CustomSplashScreen } from '../../shared/components/CustomSplashScreen';

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

  return (
    <View className="flex-1">
      {/* Custom Splash Screen Overlay - Will cover everything initially, then fade out */}
      <CustomSplashScreen />

      {/* Main Content underneath */}
      {errorMsg ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text className="mt-4 text-slate-800 dark:text-slate-200 text-center">
            {errorMsg}
          </Text>
          {/* Allow pull to refresh even on error */}
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
            No videos found in Download, Movies, or Pictures.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading && isInitialScanCompleted} // Only show native spinner on manual refresh
              onRefresh={onRefresh} 
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
        >
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
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}