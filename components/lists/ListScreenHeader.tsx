import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

interface ListScreenHeaderProps {
  title: string;
  /** One quiet line under the title, e.g. "26 friends · 5 online". */
  subtitle?: string;
  /** Skip the horizontal gutter when the parent list already provides it. */
  flush?: boolean;
}

/**
 * Large in-body header for full-screen lists: a confident title with one
 * quiet summary line under it. The nav bar above stays minimal (back
 * chevron only) — the screen introduces itself here instead.
 */
const ListScreenHeader = ({ title, subtitle, flush }: ListScreenHeaderProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <View
      style={[styles.container, flush && styles.flush]}
      accessibilityRole="header"
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Dimens.screenH,
      paddingTop: Dimens.vSm,
      paddingBottom: Dimens.vMd,
    },
    flush: {
      paddingHorizontal: 0,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: scale(24),
      lineHeight: scale(31),
      letterSpacing: scale(-0.3),
      color: colors.text,
      includeFontPadding: false,
    },
    subtitle: {
      fontFamily: FONTS.regular,
      fontSize: scale(12.5),
      color: colors.text3,
      marginTop: scale(3),
      includeFontPadding: false,
    },
  });

export default ListScreenHeader;
