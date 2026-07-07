import React, { useEffect, useCallback } from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useAudioStore } from '../../shared/store/useAudioStore';
import { AudioThumbnailCard } from '../../shared/components/AudioThumbnailCard';
import { AudioAsset } from '../../shared/services/audioScanner';

export default function AudioScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const { audioAssets, isLoading, errorMsg, scanAudio, isInitialScanCompleted } = useAudioStore();

  useEffect(() => {
    scanAudio();
  }, [scanAudio]);

  const onRefresh = useCallback(() => {
    scanAudio(true);
  }, [scanAudio]);

  const renderItem = ({ item }: { item: AudioAsset }) => {
    return <AudioThumbnailCard audio={item} />;
  };

  return (
    <View className="flex-1 bg-[var(--color-background)]">
      {errorMsg ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text className="mt-4 text-slate-800 dark:text-slate-200 text-center">
            {errorMsg}
          </Text>
        </View>
      ) : audioAssets.length === 0 && isInitialScanCompleted ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="musical-notes-outline" size={64} color={iconColor} />
          <Text className="mt-4 text-slate-800 dark:text-slate-200">
            No audio files found.
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4 mt-4">
          <FlashList
            data={audioAssets}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            // @ts-ignore
            estimatedItemSize={75}
            showsVerticalScrollIndicator={false}
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