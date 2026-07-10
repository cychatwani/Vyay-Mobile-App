    // stores/themeStore.ts

import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  currentTheme: 'light' | 'dark';
  colors: typeof Colors.light;
  setMode: (mode: ThemeMode) => void;
  getColor: (key: keyof typeof Colors.light) => string;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  currentTheme: 'light',
  colors: Colors.light,
  
  setMode: (mode) => {
    const systemTheme = useColorScheme() || 'light';
    const actualTheme = mode === 'system' ? systemTheme : mode;
    
    set({
      mode,
      currentTheme: actualTheme,
      colors: Colors[actualTheme],
    });
  },
  
  getColor: (key) => get().colors[key],
}));

// Hook to sync with system theme changes
export const useSystemThemeSync = () => {
  const systemTheme = useColorScheme();
  const { mode, setMode } = useThemeStore();
  
  useEffect(() => {
    if (mode === 'system') {
      setMode('system');
    }
  }, [systemTheme, mode, setMode]);
};

// Convenient hook to get colors
export const useColors = () => useThemeStore((state) => state.colors);

// Convenient hook to get a specific color
export const useColor = (key: keyof typeof Colors.light) => 
  useThemeStore((state) => state.colors[key]);