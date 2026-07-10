import { useTheme } from "@react-navigation/native"; // or 'expo-router'
import type { ColorValue } from "react-native";

export type ThemePalette = {
  main: string;
  primaryGradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
  background: string;
  card: string;
  primaryShadow: string;
  textPrimary: string;
  textSecondary: string;
  white: string;
  pictureBorderColor: string;
  badgeBackgorund: string;
  qrCode:string;
  rippleColor:string;
};

export const Colors = {
  light: {
    main: "#6366F1",
    primaryGradient: ["#6366F1", "#A8AFFA"] as const,
    background: "#F4F6FA", // soft gray-white background
    card: "#FFFFFF", // pure white card
    white: "#FFFFFF", // pure white card
    primaryShadow: "#000",
    textPrimary: "#111827", // dark gray, not pure black
    textSecondary: "#4B5563", // softer gray for subtitles
    pictureBorderColor: "#f0f0f0",
    badgeBackgorund: "#EEF2FF",
    qrCode:"#4B5563",
    rippleColor:"rgba(255,255,255,0.4)"
    
  },
  dark: {
    main: "#6366F1",
    primaryGradient: ["#6366F1", "#A8AFFA"] as const,
    background: "#111827", // near-black but not pure black
    card: "#1F2937",
    white: "#FFFFFF", // dark gray card for contrast
    primaryShadow: "#000",
    textPrimary: "#F9FAFB", // near-white for strong contrast
    textSecondary: "#9CA3AF", // muted gray
    pictureBorderColor: "#f0f0f0",
    badgeBackgorund: "#EEF2FF",
    qrCode:"#FFFFFF",
    rippleColor:"rgba(0,0,0,0.5)"
  },
} satisfies { light: ThemePalette; dark: ThemePalette };
// Dynamic color resolver using current theme
export function getColor(key: keyof typeof Colors.light) {
  const { dark } = useTheme();
  const theme = dark ? "dark" : "light";
  return Colors[theme][key];
}
