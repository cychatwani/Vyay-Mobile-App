import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { useColorsV2 } from "@/store/themeStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { formatAmount } from "../MemberBalances/balanceUtils";

/** One historical period's total. The API returns this list per group. */
export interface PeriodTotal {
  id: string;
  /** Human label for the period, e.g. "This month", "March 2024". */
  label: string;
  amount: number;
}

interface HistoricalTotalsSheetProps {
  currencySymbol?: string;
  /** All-time total shown large at the top. */
  grandTotal: number;
  /** Per-period breakdown, newest first. */
  periods: readonly PeriodTotal[];
}

/** Snap point sized for the header plus a scrollable-ish period list. */
export const HISTORICAL_TOTALS_SNAP = verticalScale(440);

/**
 * The sheet behind the "Historical total spend" card. Leads with the
 * all-time figure, then breaks it down period by period. Read-only for
 * now — the real breakdown swaps the mock list for the API's response.
 */
const HistoricalTotalsSheet = ({
  currencySymbol = "\u20B9",
  grandTotal,
  periods,
}: HistoricalTotalsSheetProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historical total spend</Text>
      <Text style={styles.subtitle}>Everything this group has spent</Text>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>All time</Text>
        <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit>
          {currencySymbol}
          {formatAmount(grandTotal)}
        </Text>
      </View>

      <View style={styles.list}>
        {periods.map((p, i) => (
          <View
            key={p.id}
            style={[styles.row, i < periods.length - 1 && styles.rowDivider]}
          >
            <Text style={styles.rowLabel} numberOfLines={1}>
              {p.label}
            </Text>
            <Text style={styles.rowAmount} numberOfLines={1}>
              {currencySymbol}
              {formatAmount(p.amount)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      gap: Dimens.xs,
    },
    title: {
      ...getTitleV2(colors),
    },
    subtitle: {
      ...getSubtitleV2(colors),
    },
    hero: {
      alignItems: "center",
      backgroundColor: colors.brandSubtle,
      borderRadius: Dimens.radiusMd,
      paddingVertical: Dimens.lg,
      marginTop: Dimens.md,
      gap: scale(2),
    },
    heroLabel: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.brandText,
      includeFontPadding: false,
    },
    heroAmount: {
      fontFamily: FONTS.bold,
      fontSize: scale(30),
      letterSpacing: scale(-0.4),
      color: colors.text,
      includeFontPadding: false,
    },
    list: {
      marginTop: Dimens.md,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Dimens.md,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    rowLabel: {
      fontFamily: FONTS.regular,
      fontSize: scale(14),
      color: colors.text2,
      includeFontPadding: false,
      flexShrink: 1,
    },
    rowAmount: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      includeFontPadding: false,
      marginLeft: Dimens.md,
    },
  });

export default HistoricalTotalsSheet;
