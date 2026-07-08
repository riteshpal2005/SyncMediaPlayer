import { createMMKV } from 'react-native-mmkv/';
import { StateStorage } from 'zustand/middleware';

export const themeStorage = createMMKV({
  id: 'app-theme-storage',
});

export const progressStorage = createMMKV({
  id: 'video-progress-storage',
});

export const audioStorage = createMMKV({
  id: 'audio-app-storage',
});

export const mmkvThemeStorage: StateStorage = {
  setItem: (name, value) => {
    themeStorage.set(name, value);
  },
  getItem: (name) => {
    const value = themeStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    themeStorage.remove(name);
  },
};

export const mmkvProgressStorage: StateStorage = {
  setItem: (name, value) => {
    progressStorage.set(name, value);
  },
  getItem: (name) => {
    const value = progressStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    progressStorage.remove(name);
  },
};

export const mmkvAudioStorage: StateStorage = {
  setItem: (name, value) => {
    audioStorage.set(name, value);
  },
  getItem: (name) => {
    const value = audioStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    audioStorage.remove(name);
  },
};