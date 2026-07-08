import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AudioAsset, scanForAudio } from '../services/audioScanner';
import { mmkvAudioStorage } from './mmkv-storage';

export type LoopMode = 'off' | 'all' | 'one';

interface AudioState {
  audioAssets: AudioAsset[];
  isLoading: boolean;
  isInitialScanCompleted: boolean;
  errorMsg: string | null;
  

  currentTrackId: string | null;
  isPlayerExpanded: boolean;
  loopMode: LoopMode;
  isShuffle: boolean;
  

  favorites: string[];


  scanAudio: (forceRefresh?: boolean) => Promise<void>;
  playTrack: (id: string) => void;
  setPlayerExpanded: (expanded: boolean) => void;
  setLoopMode: (mode: LoopMode) => void;
  toggleShuffle: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleFavorite: (id: string) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      audioAssets: [],
      isLoading: false,
      isInitialScanCompleted: false,
      errorMsg: null,
      
      currentTrackId: null,
      isPlayerExpanded: false,
      loopMode: 'off',
      isShuffle: false,
      
      favorites: [],

      scanAudio: async (forceRefresh = false) => {
        const { isInitialScanCompleted } = get();
        
        if (!forceRefresh && isInitialScanCompleted) {
          return;
        }

        set({ isLoading: true, errorMsg: null });
        
        try {
          const audios = await scanForAudio();
          set({ 
            audioAssets: audios, 
            isInitialScanCompleted: true,
            isLoading: false 
          });
        } catch (error: any) {
          console.warn('Failed to scan audio', error);
          set({ 
            errorMsg: error?.message || 'Failed to scan audio',
            isLoading: false,
            isInitialScanCompleted: true
          });
        }
      },

      playTrack: (id: string) => {
        set({ currentTrackId: id, isPlayerExpanded: true });
      },

      setPlayerExpanded: (expanded: boolean) => {
        set({ isPlayerExpanded: expanded });
      },

      setLoopMode: (mode: LoopMode) => {
        set({ loopMode: mode });
      },

      toggleShuffle: () => {
        set((state) => ({ isShuffle: !state.isShuffle }));
      },

      nextTrack: () => {
        const { currentTrackId, audioAssets, loopMode, isShuffle } = get();
        if (!currentTrackId || audioAssets.length === 0) return;
        
        if (isShuffle) {
          const randomIndex = Math.floor(Math.random() * audioAssets.length);
          set({ currentTrackId: audioAssets[randomIndex].id });
          return;
        }

        const currentIndex = audioAssets.findIndex(a => a.id === currentTrackId);
        if (currentIndex < audioAssets.length - 1) {
          set({ currentTrackId: audioAssets[currentIndex + 1].id });
        } else if (loopMode === 'all') {
          set({ currentTrackId: audioAssets[0].id });
        }
      },

      prevTrack: () => {
        const { currentTrackId, audioAssets, loopMode } = get();
        if (!currentTrackId || audioAssets.length === 0) return;
        
        const currentIndex = audioAssets.findIndex(a => a.id === currentTrackId);
        if (currentIndex > 0) {
          set({ currentTrackId: audioAssets[currentIndex - 1].id });
        } else if (loopMode === 'all') {
          set({ currentTrackId: audioAssets[audioAssets.length - 1].id });
        }
      },

      toggleFavorite: (id: string) => {
        const { favorites } = get();
        if (favorites.includes(id)) {
          set({ favorites: favorites.filter(favId => favId !== id) });
        } else {
          set({ favorites: [...favorites, id] });
        }
      }
    }),
    {
      name: 'audio-store',
      storage: createJSONStorage(() => mmkvAudioStorage),

      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
