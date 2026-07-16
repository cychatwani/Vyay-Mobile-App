import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";
import { formatAmount } from "../MemberBalances/balanceUtils";
import PairAvatars from "./PairAvatars";
import type { SettlementSuggestion } from "./types";

interface SettlementRowProps {
  suggestion: SettlementSuggestion;
  currencySymbol: string;
  /** Accordion driver — rows cascade in as the card opens. */
  progress?: SharedValue<number>;
  /** Position in the cascade. Capped internally so long plans stay snappy. */
  staggerIndex?: number;
}

/** Rows beyond this share the last stagger window — no minute-long cascades. */
const STAGGER_CAP = 8;

/**
 * One informational leg of the plan: pair glyph · "A pays B" ·
 * amount. Deliberately quiet — the amount stays neutral because red/green is
 * reserved for the viewer's own money. Color meaning "this is about you" is
 * what lets the personal tiles above carry weight.
 */
const SettlementRow = ({
  suggestion,
  currencySymbol,
  progress,
  staggerIndex = 0,
}: SettlementRowProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);
  const { fromUser, toUser, amount } = suggestion;

  // Each row owns a slice of the accordion's progress: it fades and slides in
  // slightly after the row above it, and the whole thing reverses on close.
  const stagger = useAnimatedStyle(() => {
    if (progress === undefined) return {};
    const start = 0.3 + Math.min(staggerIndex, STAGGER_CAP) * 0.05;
    const end = Math.min(start + 0.3, 1);
    return {
      opacity: interpolate(
        progress.value,
        [start, end],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [start, end],
            [6, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.row, stagger]}
      accessible
      accessibilityLabel={`${fromUser.name} pays ${toUser.name} ${currencySymbol}${formatAmount(amount)}`}
    >
      <PairAvatars fromUser={fromUser} toUser={toUser} />

      <View style={styles.names}>
        <Text style={styles.payerName} numberOfLines={1}>
          {fromUser.name}
        </Text>
        <Text style={styles.receiverLine} numberOfLines={1}>
          pays {toUser.name}
        </Text>
      </View>

      <Text style={styles.amount} numberOfLines={1}>
        {currencySymbol}
        {formatAmount(amount)}
      </Text>
    </Animated.View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: scale(52),
      paddingHorizontal: Dimens.lg,
      paddingVertical: Dimens.xs,
      gap: Dimens.md,
    },
    names: {
      flex: 1,
    },
    payerName: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      includeFontPadding: false,
    },
    receiverLine: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text3,
      marginTop: scale(1),
      includeFontPadding: false,
    },
    amount: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      includeFontPadding: false,
    },
  });

export default SettlementRow;
