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
  qrCode: string;
  rippleColor: string;
};

export const Colors = {
  light: {
    main: "#595AE4", // vy-brand (indigo-600)
    primaryGradient: ["#595AE4", "#8E99FF"] as const, // indigo-600 -> indigo-400
    background: "#FAFBFE", // vy-page
    card: "#FFFFFF", // vy-card
    white: "#FFFFFF", // literal white
    primaryShadow: "#000",
    textPrimary: "#1A1B20", // vy-text
    textSecondary: "#686A71", // vy-text2
    pictureBorderColor: "#D9DBE2", // vy-border
    badgeBackgorund: "#F3F6FF", // vy-brandsubtle
    qrCode: "#686A71", // vy-text2
    rippleColor: "rgba(255,255,255,0.4)",
  },
  dark: {
    main: "#8E99FF", // vy-brand dark (indigo-400)
    primaryGradient: ["#8E99FF", "#4747BD"] as const, // indigo-400 -> indigo-700
    background: "#0D0E13", // vy-page dark
    card: "#1A1B20", // vy-card dark
    white: "#FFFFFF", // literal white
    primaryShadow: "#000",
    textPrimary: "#F6F6FB", // vy-text dark
    textSecondary: "#A1A3AA", // vy-text2 dark
    pictureBorderColor: "#3F4046", // vy-border dark
    badgeBackgorund: "#1C1D4D", // vy-brandsubtle dark (fixed: was duplicated from light)
    qrCode: "#F6F6FB", // vy-text dark
    rippleColor: "rgba(0,0,0,0.5)",
  },
} satisfies { light: ThemePalette; dark: ThemePalette };

// Dynamic color resolver using current theme
export function getColor(key: keyof typeof Colors.light) {
  const { dark } = useTheme();
  const theme = dark ? "dark" : "light";
  return Colors[theme][key];
}
