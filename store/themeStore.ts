// stores/themeStore.ts

import { Colors } from "@/constants/Colors";
import { ColorsV2 } from "@/constants/ColorsV2";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  currentTheme: "light" | "dark";
  colors: typeof Colors.light;
  setMode: (mode: ThemeMode) => void;
  getColor: (key: keyof typeof Colors.light) => string;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  currentTheme: "light",
  colors: Colors.light,

  setMode: (mode) => {
    const systemTheme = useColorScheme() || "light";
    const actualTheme = mode === "system" ? systemTheme : mode;

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
    if (mode === "system") {
      setMode("system");
    }
  }, [systemTheme, mode, setMode]);
};
/**
 * @deprecated Use `useColorsV2()` instead. This returns the legacy 13-token
 * palette. Migrating screens off this so the old Colors.ts can be removed.
 */
export const useColors = () => useThemeStore((state) => state.colors);

/**
 * @deprecated Use `useColorV2(key)` instead.
 */
export const useColor = (key: keyof typeof Colors.light) =>
  useThemeStore((state) => state.colors[key]);

// --- V2 palette (brand-accurate). Migrate screens onto these, then remove the old Colors/useColors. ---

// Returns the full V2 palette for the current theme.
export const useColorsV2 = () =>
  useThemeStore((state) =>
    state.currentTheme === "dark" ? ColorsV2.dark : ColorsV2.light,
  );

// Returns a single V2 token for the current theme.
export const useColorV2 = <K extends keyof typeof ColorsV2.light>(key: K) =>
  useThemeStore(
    (state) =>
      (state.currentTheme === "dark" ? ColorsV2.dark : ColorsV2.light)[key],
  );
