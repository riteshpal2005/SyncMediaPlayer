import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Appearance } from 'react-native';
import { mmkvStorage } from './mmkv-storage';

type ThemeMode = 'light' | 'dark' | 'system' ;

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}


const syncNativeWindEngine = (mode: ThemeMode) => {
  try {
    
    if (mode === 'system') {
      Appearance.setColorScheme(null); 
    } else {
      Appearance.setColorScheme(mode);
    }

    
    const { colorScheme } = require('nativewind');
    if (colorScheme && typeof colorScheme.set === 'function') {
      colorScheme.set(mode);
    }
  } catch (error) {
   
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'dark', 
      setThemeMode: (mode) => {
        set({ themeMode: mode });
        syncNativeWindEngine(mode);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => mmkvStorage),
      
      onRehydrateStorage: () => (state) => {
        if (state) {
          syncNativeWindEngine(state.themeMode);
        }
      },
    }
  )
);