import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getCardV2 } from "@/constants/Styles";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import { formatAmount } from "../MemberBalances/balanceUtils";

interface HistoricalTotalsCardProps {
  currencySymbol?: string;
  /** All-time total shown as the card's value. */
  grandTotal: number;
  onPress: () => void;
}

/**
 * The single card on the Totals tab: a summary of the group's all-time
 * spend that opens the full historical breakdown when tapped. Chevron on
 * the right signals it drills in.
 */
const HistoricalTotalsCard = ({
  currencySymbol = "\u20B9",
  grandTotal,
  onPress,
}: HistoricalTotalsCardProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      android_ripple={{ color: colors.ripple }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Historical total spend, ${currencySymbol}${formatAmount(grandTotal)}`}
      accessibilityHint="Opens the full spending breakdown by period"
    >
      <View style={styles.iconChip}>
        <Feather name="bar-chart-2" size={scale(18)} color={colors.brandText} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.label} numberOfLines={1}>
          Historical total spend
        </Text>
        <Text style={styles.amount} numberOfLines={1}>
          {currencySymbol}
          {formatAmount(grandTotal)}
        </Text>
      </View>

      <Feather name="chevron-right" size={scale(20)} color={colors.text3} />
    </Pressable>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    card: {
      ...getCardV2(colors),
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.md,
    },
    cardPressed: {
      opacity: 0.85,
    },
    iconChip: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      backgroundColor: colors.brandSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    textBlock: {
      flex: 1,
      gap: scale(2),
    },
    label: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
      includeFontPadding: false,
    },
    amount: {
      fontFamily: FONTS.bold,
      fontSize: scale(20),
      letterSpacing: scale(-0.3),
      color: colors.text,
      includeFontPadding: false,
    },
  });

export default memo(HistoricalTotalsCard);
