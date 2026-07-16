import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import { formatAmount, isSettled } from "./balanceUtils";
import MemberAvatar from "./MemberAvatar";
import type { MemberBalance } from "./types";

interface MemberBalanceRowProps {
  member: MemberBalance;
  currencySymbol: string;
  onPress?: (member: MemberBalance) => void;
}

/**
 * One line of the ledger: avatar · name · signed amount.
 *
 * Direction is triple-encoded (sign, color, role word) so meaning never
 * rests on color alone. Settled members render deliberately quiet.
 */
const MemberBalanceRow = ({
  member,
  currencySymbol,
  onPress,
}: MemberBalanceRowProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const settled = isSettled(member.amount);
  const positive = member.amount > 0;

  const amountColor = settled
    ? colors.text3
    : positive
      ? colors.income.text
      : colors.expense.text;

  // U+2212 minus sign — same width as "+", so amounts align optically.
  const signedAmount = `${positive ? "+" : "\u2212"} ${currencySymbol}${formatAmount(member.amount)}`;
  const roleWord = positive ? "gets back" : "owes";

  const a11yLabel = settled
    ? `${member.name}, settled up`
    : `${member.name} ${roleWord} ${currencySymbol}${formatAmount(member.amount)}`;

  const body = (
    <>
      <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size={scale(36)} />

      <Text
        style={[styles.name, settled && styles.nameSettled]}
        numberOfLines={1}
      >
        {member.name}
      </Text>

      <View style={styles.amountBlock}>
        {settled ? (
          <Text style={styles.settledText}>Settled</Text>
        ) : (
          <>
            <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
              {signedAmount}
            </Text>
            <Text style={styles.roleWord}>{roleWord}</Text>
          </>
        )}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.row} accessible accessibilityLabel={a11yLabel}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      android_ripple={{ color: colors.ripple }}
      onPress={() => onPress(member)}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      {body}
    </Pressable>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: scale(52),
      paddingHorizontal: Dimens.lg,
      gap: Dimens.md,
    },
    rowPressed: {
      backgroundColor: colors.brandSubtle,
    },
    name: {
      flex: 1,
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      includeFontPadding: false,
    },
    nameSettled: {
      color: colors.text2,
    },
    amountBlock: {
      alignItems: "flex-end",
    },
    amount: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      includeFontPadding: false,
    },
    roleWord: {
      fontFamily: FONTS.regular,
      fontSize: scale(11),
      color: colors.text3,
      marginTop: scale(1),
      includeFontPadding: false,
    },
    settledText: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text3,
      includeFontPadding: false,
    },
  });

export default MemberBalanceRow;
