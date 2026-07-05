import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkv-storage';

export interface VideoProgress {
  currentTime: number;
  duration: number;
  completed: boolean;
}

interface ProgressState {
  progressRecord: Record<string, VideoProgress>;
  updateProgress: (uri: string, currentTime: number, duration: number) => void;
  getProgress: (uri: string) => VideoProgress | undefined;
}

const COMPLETION_THRESHOLD = 0.95; // 95%

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progressRecord: {},
      updateProgress: (uri, currentTime, duration) => {
        if (!uri || duration <= 0) return;
        set((state) => {
          const completed = (currentTime / duration) >= COMPLETION_THRESHOLD;
          
          return {
            progressRecord: {
              ...state.progressRecord,
              [uri]: {
                currentTime,
                duration,
                completed,
              },
            },
          };
        });
      },
      getProgress: (uri) => {
        return get().progressRecord[uri];
      },
    }),
    {
      name: 'video-progress-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
