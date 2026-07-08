import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { fetchLyrics } from '../../shared/services/lyricsService';

interface Props {
  title: string;
  artist?: string;
}

export const LyricsScreen = ({ title, artist }: Props) => {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLyrics(title, artist).then((result) => {
      if (isMounted) {
        setLyrics(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [title, artist]);

  return (
    <View className="flex-1 px-[30px] pt-[20px] pb-[80px]">
      <Text className="text-white text-xl font-bold mb-4 tracking-widest uppercase text-center">Lyrics</Text>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : lyrics ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-slate-300 text-lg leading-8 text-center font-medium">
            {lyrics}
          </Text>
        </ScrollView>
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
