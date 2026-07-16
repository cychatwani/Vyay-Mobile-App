import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { closeSheet } from "@/store/sheetStore";
import { useColorsV2 } from "@/store/themeStore";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import { formatAmount } from "../MemberBalances/balanceUtils";
import PairAvatars from "./PairAvatars";
import { currencySymbolFor, viewerPays } from "./settlementUtils";
import type { SettlementSuggestion } from "./types";

interface SettleUpSheetProps {
  suggestion: SettlementSuggestion;
  viewerId?: string | number;
  currencySymbol?: string;
}

/**
 * Placeholder content for the settle-up Bottom Sheet.
 *
 * It already does the one thing the real flow will always have to do first:
 * restate exactly which transfer was tapped — pair, direction, amount — so the
 * hand-off from the plan feels continuous. The workflow itself (record a cash
 * payment, pay over UPI) lands here next.
 */
const SettleUpSheet = ({
  suggestion,
  viewerId,
  currencySymbol = currencySymbolFor(suggestion.currency),
}: SettleUpSheetProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const iPay = viewerId != null && viewerPays(suggestion, viewerId);
  const iReceive =
    viewerId != null && String(suggestion.toUser.id) === String(viewerId);

  const headline = iPay
    ? `You pay ${suggestion.toUser.name}`
    : iReceive
      ? `${suggestion.fromUser.name} pays you`
      : `${suggestion.fromUser.name} pays ${suggestion.toUser.name}`;

  const amountColor = iPay
    ? colors.expense.text
    : iReceive
      ? colors.income.text
      : colors.text;

  return (
    <View style={styles.container}>
      <PairAvatars
        fromUser={suggestion.fromUser}
        toUser={suggestion.toUser}
        size={scale(44)}
        emphasized
      />

      <Text style={styles.title}>{headline}</Text>
      <Text style={[styles.amount, { color: amountColor }]}>
        {currencySymbol}
        {formatAmount(suggestion.amount)}
      </Text>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          The settle-up flow lands here next — record a cash payment or pay
          directly over UPI.
        </Text>
      </View>

      <Pressable
        onPress={closeSheet}
        android_ripple={{ color: colors.ripple }}
        style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Text style={styles.closeLabel}>Close</Text>
      </Pressable>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingTop: Dimens.sm,
    },
    title: {
      ...getTitleV2(colors),
      marginTop: Dimens.md,
      textAlign: "center",
    },
    amount: {
      fontFamily: FONTS.bold,
      fontSize: scale(26),
      letterSpacing: scale(-0.3),
      marginTop: Dimens.xs,
      includeFontPadding: false,
    },
    note: {
      alignSelf: "stretch",
      backgroundColor: colors.brandSubtle,
      borderRadius: Dimens.radiusSm,
      paddingVertical: Dimens.md,
      paddingHorizontal: Dimens.lg,
      marginTop: Dimens.lg,
    },
    noteText: {
      ...getSubtitleV2(colors),
      textAlign: "center",
      lineHeight: scale(19),
    },
    close: {
      alignSelf: "stretch",
      alignItems: "center",
      borderRadius: Dimens.radiusPill,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: Dimens.md,
      marginTop: Dimens.lg,
      overflow: "hidden",
    },
    closePressed: {
      backgroundColor: colors.brandSubtle,
    },
    closeLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      includeFontPadding: false,
    },
  });

export default SettleUpSheet;
