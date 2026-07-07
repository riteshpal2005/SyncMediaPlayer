import React, { useEffect, useCallback } from 'react';
import { View, Text, RefreshControl, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useAudioStore } from '../../shared/store/useAudioStore';
import { AudioThumbnailCard } from '../../shared/components/AudioThumbnailCard';
import { AudioAsset } from '../../shared/services/audioScanner';
import AudioPlayerOverlay from '../../features/audio/AudioPlayerOverlay';
import { useVideoPlayer } from 'expo-video';

export default function AudioScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const { audioAssets, isLoading, errorMsg, scanAudio, isInitialScanCompleted, currentTrackId, loopMode } = useAudioStore();

  const currentAudio = audioAssets.find(a => a.id === currentTrackId);

  // Initialize the video player globally for this screen
  const player = useVideoPlayer(
    currentAudio 
      ? { 
          uri: currentAudio.uri, 
          metadata: { 
            title: currentAudio.filename, 
            artist: 'Unknown Artist'
          } 
        } 
      : null, 
    (player) => {
      player.staysActiveInBackground = true;
      player.showNowPlayingNotification = true;
      player.loop = loopMode === 'one';
      player.play();
    }
  );

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
    <View style={styles.container}>
      {errorMsg ? (
        <View style={styles.centerContainer}>
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>
            {errorMsg}
          </Text>
        </View>
      ) : audioAssets.length === 0 && isInitialScanCompleted ? (
        <View style={styles.centerContainer}>
          <Ionicons name="musical-notes-outline" size={64} color={iconColor} />
          <Text style={styles.emptyText}>
            No audio files found.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={audioAssets}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            estimatedItemSize={75}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: currentTrackId ? 80 : 20 }}
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

      {/* Audio Player Overlay / Dock */}
      {currentTrackId && (
        <AudioPlayerOverlay player={player} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'var(--color-background)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    marginTop: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#94a3b8', // Use standard slate color if theme variable not directly accessible
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  }
});