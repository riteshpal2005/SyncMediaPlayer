import { create } from 'zustand';
import { AudioAsset, scanForAudio } from '../services/audioScanner';

interface AudioState {
  audioAssets: AudioAsset[];
  isLoading: boolean;
  isInitialScanCompleted: boolean;
  errorMsg: string | null;
  scanAudio: (forceRefresh?: boolean) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioAssets: [],
  isLoading: false,
  isInitialScanCompleted: false,
  errorMsg: null,
  scanAudio: async (forceRefresh = false) => {
    const { isInitialScanCompleted } = get();
    
    // Only scan if it's the first time OR if forced refresh
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
        isInitialScanCompleted: true // even on error, we mark it complete so we don't infinitely retry unless pulled to refresh
      });
    }
  }
}));
