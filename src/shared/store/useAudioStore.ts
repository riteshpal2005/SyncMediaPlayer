import { create } from 'zustand';
import { AudioAsset, scanForAudio } from '../services/audioScanner';

export type LoopMode = 'off' | 'all' | 'one';

interface AudioState {
  audioAssets: AudioAsset[];
  isLoading: boolean;
  isInitialScanCompleted: boolean;
  errorMsg: string | null;
  
  // Playback state
  currentTrackId: string | null;
  isPlayerExpanded: boolean;
  loopMode: LoopMode;

  // Actions
  scanAudio: (forceRefresh?: boolean) => Promise<void>;
  playTrack: (id: string) => void;
  setPlayerExpanded: (expanded: boolean) => void;
  setLoopMode: (mode: LoopMode) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioAssets: [],
  isLoading: false,
  isInitialScanCompleted: false,
  errorMsg: null,
  
  currentTrackId: null,
  isPlayerExpanded: false,
  loopMode: 'off',

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

  nextTrack: () => {
    const { currentTrackId, audioAssets, loopMode } = get();
    if (!currentTrackId || audioAssets.length === 0) return;
    
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
  }
}));
