import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { VideoAsset, scanForVideos } from '../../shared/services/mediaScanner';

export default function VideoScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const [videos, setVideos] = React.useState<VideoAsset[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadVideos() {
      try {
        const foundVideos = await scanForVideos();
        setVideos(foundVideos);
      } catch (error) {
        console.warn('Failed to scan videos', error);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="videocam-outline" size={64} color={iconColor} />
      <Text className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
        Video
      </Text>
      {loading ? (
        <Text className="mt-2 text-slate-500">Scanning for videos...</Text>
      ) : (
        <Text className="mt-2 text-slate-500">Found {videos.length} videos</Text>
      )}
    </View>
  );
}