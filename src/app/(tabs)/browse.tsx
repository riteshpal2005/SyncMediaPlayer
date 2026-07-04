import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useThemeStore } from '../../shared/store/useThemeStore';
import * as DocumentPicker from 'expo-document-picker';

export default function BrowseScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const iconColor = isDark ? '#94a3b8' : '#64748b';

  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePickFile = async () => {
    try {
      setErrorMsg(null);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'audio/*'],
        copyToCacheDirectory: false, // Prevent duplicating large files
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error: any) {
      console.warn('Failed to pick document:', error);
      setErrorMsg(error?.message || 'Failed to open file picker.');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <ScrollView className="flex-1 px-4 py-8" contentContainerStyle={{ alignItems: 'center' }}>
      
      <Ionicons name="folder-open-outline" size={80} color={iconColor} />
      <Text className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200 text-center">
        Browse Files
      </Text>
      <Text className="mt-2 text-center text-slate-500 max-w-xs">
        Pick any audio or video file from your device folders (Downloads, SD Card, Drive, etc).
      </Text>

      <TouchableOpacity
        onPress={handlePickFile}
        className="mt-8 bg-blue-600 px-6 py-3 rounded-xl flex-row items-center active:bg-blue-700"
      >
        <Ionicons name="search" size={20} color="white" />
        <Text className="ml-2 text-white font-bold text-lg">Pick Media File</Text>
      </TouchableOpacity>

      {errorMsg && (
        <Text className="mt-4 text-red-500 text-center font-medium">
          {errorMsg}
        </Text>
      )}

      {selectedFile && (
        <View className="mt-12 w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <View className="flex-row items-center mb-4">
            <Ionicons 
              name={selectedFile.mimeType?.startsWith('video') ? 'videocam' : 'musical-note'} 
              size={24} 
              color={isDark ? '#3b82f6' : '#2563eb'} 
            />
            <Text className="ml-3 text-lg font-bold text-slate-800 dark:text-slate-200">
              Loaded Media
            </Text>
          </View>
          
          <Text className="text-slate-700 dark:text-slate-300 font-medium" numberOfLines={2}>
            {selectedFile.name}
          </Text>
          <Text className="mt-2 text-slate-500 text-sm">
            Size: {formatSize(selectedFile.size)}
          </Text>
          <Text className="mt-1 text-slate-500 text-sm">
            Type: {selectedFile.mimeType || 'Unknown'}
          </Text>

          <View className="mt-6 flex-row justify-end">
            <TouchableOpacity 
              onPress={() => {
                router.push({
                  pathname: '/player',
                  params: { uri: selectedFile.uri, filename: selectedFile.name }
                });
              }}
              className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="play" size={18} color={isDark ? 'white' : 'black'} />
              <Text className="ml-2 font-bold text-slate-800 dark:text-slate-200">
                Play
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
}
