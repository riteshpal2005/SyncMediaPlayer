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
    const { isInitialScanCompleted } = get();
    

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
        isInitialScanCompleted: true
      });
    }
  }
}));
