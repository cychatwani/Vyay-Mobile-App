import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

interface InfoBannerProps {
  text: string;
}

/**
 * A quiet informational note — brand-subtle wash, small info glyph, one
 * short paragraph. Deliberately not a warning: no border, no loud color,
 * it reads as a helpful aside that scrolls away with the list.
 */
const InfoBanner = ({ text }: InfoBannerProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <View style={styles.banner} accessibilityRole="text">
      <Feather
        name="info"
        size={scale(14)}
        color={colors.brandText}
        style={styles.icon}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Dimens.sm,
      backgroundColor: colors.brandSubtle,
      borderRadius: Dimens.radiusMd,
      paddingVertical: Dimens.md,
      paddingHorizontal: Dimens.md,
    },
    icon: {
      marginTop: scale(1.5),
    },
    text: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      lineHeight: scale(17),
      color: colors.brandText,
      includeFontPadding: false,
    },
  });

export default InfoBanner;
