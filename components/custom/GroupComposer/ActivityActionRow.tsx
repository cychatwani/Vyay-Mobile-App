import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import type { ActivityAction } from "./types";

interface ActivityActionRowProps {
  action: ActivityAction;
  onPress: (action: ActivityAction) => void;
}

/**
 * One entry in the Add Activity sheet: icon chip, title, one-line
 * description, chevron. Same visual grammar as the timeline cards' icon
 * chips so the sheet reads as part of the same system.
 */
const ActivityActionRow = ({ action, onPress }: ActivityActionRowProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      android_ripple={{ color: colors.ripple }}
      onPress={() => onPress(action)}
      accessibilityRole="button"
      accessibilityLabel={action.title}
      accessibilityHint={action.description}
    >
      <View style={styles.iconChip}>
        <Feather name={action.icon} size={scale(17)} color={colors.brandText} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {action.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {action.description}
        </Text>
      </View>

      <Feather name="chevron-right" size={scale(18)} color={colors.text3} />
    </Pressable>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.md,
      minHeight: scale(56),
      paddingVertical: Dimens.sm,
      paddingHorizontal: Dimens.sm,
      borderRadius: Dimens.radiusMd,
    },
    rowPressed: {
      backgroundColor: colors.brandSubtle,
    },
    iconChip: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: colors.brandSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    textBlock: {
      flex: 1,
      gap: scale(1),
    },
    title: {
      fontFamily: FONTS.medium,
      fontSize: scale(14.5),
      color: colors.text,
      includeFontPadding: false,
    },
    description: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text2,
      includeFontPadding: false,
    },
  });

export default memo(ActivityActionRow);
