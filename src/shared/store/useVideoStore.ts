import { create } from 'zustand';
import { VideoGroup, scanForVideos } from '../services/mediaScanner';

interface VideoState {
  videoGroups: VideoGroup[];
  isLoading: boolean;
  isInitialScanCompleted: boolean;
  errorMsg: string | null;
  scanVideos: (forceRefresh?: boolean) => Promise<void>;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videoGroups: [],
  isLoading: false,
  isInitialScanCompleted: false,
  errorMsg: null,
  scanVideos: async (forceRefresh = false) => {
    const { videoGroups, isInitialScanCompleted } = get();
    
    // Only scan if it's the first time OR if forced refresh
    if (!forceRefresh && isInitialScanCompleted) {
      return;
    }

    set({ isLoading: true, errorMsg: null });
    
    try {
      const groups = await scanForVideos();
      set({ 
        videoGroups: groups, 
        isInitialScanCompleted: true,
        isLoading: false 
      });
    } catch (error: any) {
      console.warn('Failed to scan videos', error);
      set({ 
        errorMsg: error?.message || 'Failed to scan videos',
        isLoading: false,
        isInitialScanCompleted: true // even on error, we mark it complete so we don't infinitely retry unless pulled to refresh
      });
    }
  }
}));
