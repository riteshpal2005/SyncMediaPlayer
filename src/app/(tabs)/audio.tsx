import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { View, Text, RefreshControl, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { TriangleAlert, Music, Search } from 'lucide-react-native';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useAudioStore } from '../../shared/store/useAudioStore';
import { AudioThumbnailCard } from '../../shared/components/AudioThumbnailCard';
import { AudioAsset } from '../../shared/services/audioScanner';
import AudioPlayerOverlay from '../../features/audio/AudioPlayerOverlay';
import { useVideoPlayer } from 'expo-video';

type SortOrder = 'latest' | 'oldest' | 'az' | 'za';

export default function AudioScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark' || themeMode === 'pitch-black';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');

  const { audioAssets, isLoading, errorMsg, scanAudio, isInitialScanCompleted, currentTrackId, loopMode, favorites } = useAudioStore();

  const listRef = useRef<any>(null);

  const currentAudio = audioAssets.find(a => a.id === currentTrackId);

  const videoSource = useMemo(() => {
    return currentAudio 
      ? { 
          uri: currentAudio.uri, 
          metadata: { 
            title: currentAudio.filename, 
            artist: 'Unknown Artist'
          } 
        } 
      : null;
  }, [currentAudio]);

  const player = useVideoPlayer(
    videoSource, 
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

  const processedAssets = useMemo(() => {
    let result = [...audioAssets];


    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.filename.toLowerCase().includes(q));
    }


    result.sort((a, b) => {
      if (sortOrder === 'latest') {
        return b.creationTime - a.creationTime;
      } else if (sortOrder === 'oldest') {
        return a.creationTime - b.creationTime;
      } else if (sortOrder === 'az') {
        return a.filename.localeCompare(b.filename);
      } else if (sortOrder === 'za') {
        return b.filename.localeCompare(a.filename);
      }
      return 0;
    });


    result.sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });

    return result;
  }, [audioAssets, searchQuery, sortOrder, favorites]);

  const renderItem = ({ item }: { item: AudioAsset }) => {
    return <AudioThumbnailCard audio={item} />;
  };

  const sortOptions: { label: string; value: SortOrder }[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'A-Z', value: 'az' },
    { label: 'Z-A', value: 'za' },
  ];

  const handleSortChange = (newSort: SortOrder) => {
    setSortOrder(newSort);

    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 50);
  };

  return (
    <View style={styles.container}>
      
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-slate-200 dark:bg-slate-800 rounded-xl px-4 py-2">
          <Search size={20} color={iconColor} />
          <TextInput
            placeholder="Search audio..."
            placeholderTextColor={iconColor}
            className="flex-1 ml-3 text-slate-800 dark:text-slate-200 text-base py-1"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      
      <View className="px-4 pb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSortChange(opt.value)}
              className={`px-4 py-1.5 mr-2 rounded-full border ${
                sortOrder === opt.value
                  ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/40 dark:border-blue-400'
                  : 'bg-transparent border-slate-300 dark:border-slate-700'
              }`}
            >
              <Text
                className={`font-medium ${
                  sortOrder === opt.value
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {errorMsg ? (
        <View style={styles.centerContainer}>
          <TriangleAlert size={48} color="#ef4444" />
          <Text style={styles.errorText}>
            {errorMsg}
          </Text>
        </View>
      ) : processedAssets.length === 0 && isInitialScanCompleted ? (
        <View style={styles.centerContainer}>
          <Music size={64} color={iconColor} />
          <Text style={styles.emptyText}>
            No audio files found.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            ref={listRef}
            data={processedAssets}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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
    color: '#94a3b8',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  }
});