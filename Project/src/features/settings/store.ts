import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../events/types';

interface SettingsState {
  theme: Theme;
  timeFormat: '12h' | '24h';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  slotSize: number; // minutes
  
  // Actions
  setTheme: (theme: Partial<Theme>) => void;
  setTimeFormat: (format: '12h' | '24h') => void;
  setWeekStartsOn: (day: 0 | 1) => void;
  setSlotSize: (size: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: {
        mode: 'system',
        primaryColor: 'blue',
        reducedMotion: false,
      },
      timeFormat: '12h',
      weekStartsOn: 1,
      slotSize: 15,

      setTheme: (themeUpdates) => {
        set((state) => ({
          theme: { ...state.theme, ...themeUpdates },
        }));
      },

      setTimeFormat: (format) => set({ timeFormat: format }),
      
      setWeekStartsOn: (day) => set({ weekStartsOn: day }),
      
      setSlotSize: (size) => set({ slotSize: size }),
    }),
    {
      name: 'settings-storage',
    }
  )
);