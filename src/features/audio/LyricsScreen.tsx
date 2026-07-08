import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, FlatList, Dimensions } from 'react-native';
import { fetchLyrics, ParsedLyricsResult } from '../../shared/services/lyricsService';
import { VideoPlayer } from 'expo-video';

interface Props {
  title: string;
  artist?: string;
  currentTime?: number;
  player?: VideoPlayer | null;
}

interface LyricLine {
  timeMs: number;
  text: string;
}

// Parses LRC format: [mm:ss.xx] Lyrics
const parseLrc = (lrcString: string): LyricLine[] => {
  const lines = lrcString.split('\n');
  const parsed: LyricLine[] = [];
  
  const timeRegex = /\[(\d{2,}):(\d{2})\.(\d{1,3})\]/;
  
  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10); // pad [00:12.3] -> 300
      
      const timeMs = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
      const text = line.replace(timeRegex, '').trim();
      
      if (text) {
        parsed.push({ timeMs, text });
      }
    }
  }
  
  return parsed;
};

const ITEM_HEIGHT = 100; // Larger height to comfortably fit 2 lines of massive text

export const LyricsScreen = ({ title, artist, currentTime = 0, player }: Props) => {
  const [lyricsData, setLyricsData] = useState<ParsedLyricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLyrics(title, artist).then((result) => {
      if (isMounted) {
        setLyricsData(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [title, artist]);

  const syncedLines = useMemo(() => {
    if (lyricsData?.syncedLyrics) {
      return parseLrc(lyricsData.syncedLyrics);
    }
    return [];
  }, [lyricsData?.syncedLyrics]);

  // Find current active line index
  const activeIndex = useMemo(() => {
    if (syncedLines.length === 0) return -1;
    const currentMs = currentTime * 1000;
    
    // Find the last line whose time is less than or equal to current time
    for (let i = syncedLines.length - 1; i >= 0; i--) {
      if (syncedLines[i].timeMs <= currentMs) {
        return i;
      }
    }
    return 0; // default to first line if before start
  }, [currentTime, syncedLines]);

  // Auto-scroll logic
  useEffect(() => {
    if (activeIndex >= 0 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: activeIndex,
          animated: true,
          viewPosition: 0.5 // center it
        });
      } catch (e) {
        // Flatlist might not have rendered index yet
      }
    }
  }, [activeIndex]);

  const handleSeek = (timeMs: number) => {
    if (player) {
      player.currentTime = timeMs / 1000;
      if (!player.playing) {
        player.play();
      }
    }
  };

  return (
    <View className="flex-1 px-[20px] pt-[20px]">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : lyricsData ? (
        syncedLines.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={syncedLines}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: Dimensions.get('window').height / 4 }}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            renderItem={({ item, index }) => {
              const isActive = index === activeIndex;
              return (
                <Pressable 
                  onPress={() => handleSeek(item.timeMs)}
                  className="py-2 justify-center"
                  style={{ height: ITEM_HEIGHT }}
                >
                  <Text 
                    className={`text-left font-extrabold text-3xl tracking-tight ${isActive ? 'text-white' : 'text-white/40'}`}
                    style={{ lineHeight: 42 }}
                    numberOfLines={2}
                  >
                    {item.text}
                  </Text>
                </Pressable>
              );
            }}
          />
        ) : (
          // Fallback Plain Lyrics if no sync available
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text className="text-white text-2xl leading-10 text-center font-bold">
              {lyricsData.plainLyrics}
            </Text>
          </ScrollView>
        )
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-400 text-lg text-center font-medium">
            Lyrics not found
          </Text>
          <Text className="text-slate-500 text-sm text-center mt-2">
            Try updating the track metadata.
          </Text>
        </View>
      )}
    </View>
  );
};
