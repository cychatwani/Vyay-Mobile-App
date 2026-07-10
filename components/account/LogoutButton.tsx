import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";

type LogoutButtonProps = {
  onPress: () => void;
};

export default function LogoutButton({ onPress }: LogoutButtonProps) {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.danger.surface }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Feather name="log-out" size={scale(18)} color={colors.danger.text} />
      <Text style={styles.label}>Log out</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    button: {
      // explicit sizing so it can never stretch to fill the screen
      alignSelf: "stretch",
      height: verticalScale(50),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: colors.danger.border,
      backgroundColor: colors.danger.bg,
      overflow: "hidden",
    },
    pressed: {
      opacity: 0.85,
    },
    label: {
      fontFamily: FONTS.bold,
      fontSize: scale(15),
      color: colors.danger.text,
    },
  });
