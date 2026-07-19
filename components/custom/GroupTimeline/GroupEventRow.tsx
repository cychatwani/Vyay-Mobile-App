import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import { groupEventText } from "./timelineUtils";
import type { GroupEvent } from "./types";

interface GroupEventRowProps {
  event: GroupEvent;
  currentUserId: string | number;
}

/**
 * The timeline's lowest register: "Rahul joined the group". No card, no
 * elevation, no interaction — just a centered muted line that marks a
 * moment in time without competing with money or conversation.
 */
const GroupEventRow = ({ event, currentUserId }: GroupEventRowProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <View style={styles.row} accessible accessibilityRole="text">
      <Text style={styles.text}>{groupEventText(event, currentUserId)}</Text>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      alignItems: "center",
      paddingVertical: Dimens.xs,
      paddingHorizontal: Dimens.xl,
    },
    text: {
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      color: colors.text3,
      textAlign: "center",
      includeFontPadding: false,
    },
  });

export default memo(GroupEventRow);
