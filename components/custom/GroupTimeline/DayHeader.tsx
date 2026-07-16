import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

interface DayHeaderProps {
  label: string;
}

/**
 * "Today" / "Yesterday" / "12 July" — a small centered pill that quietly
 * slices the timeline into days, WhatsApp-style. It shares the eyebrow
 * typography of the financial cards so the whole screen speaks one voice.
 */
const DayHeader = ({ label }: DayHeaderProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={styles.pill}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      alignItems: "center",
      paddingTop: Dimens.lg,
      paddingBottom: Dimens.sm,
    },
    pill: {
      backgroundColor: colors.divider,
      borderRadius: Dimens.radiusPill,
      paddingHorizontal: Dimens.md,
      paddingVertical: scale(4),
    },
    label: {
      fontFamily: FONTS.medium,
      fontSize: scale(10.5),
      letterSpacing: scale(0.6),
      textTransform: "uppercase",
      color: colors.text2,
      includeFontPadding: false,
    },
  });

export default memo(DayHeader);
