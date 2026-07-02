import { createMMKV } from 'react-native-mmkv/';
import { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({
  id: 'app-theme-storage',
  // If you ever need it down the line, you can throw in your:
  // encryptionKey: 'your-key',
  // mode: 'multi-process'
});



export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};