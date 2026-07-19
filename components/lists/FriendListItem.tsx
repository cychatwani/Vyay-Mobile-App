import MemberAvatar from "@/components/custom/MemberBalances/MemberAvatar";
import {
  formatAmount,
  isSettled,
} from "@/components/custom/MemberBalances/balanceUtils";
import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import type { FriendListItemData } from "./types";

export const FRIEND_ROW_HEIGHT = scale(64);

interface FriendListItemProps {
  friend: FriendListItemData;
  currencySymbol?: string;
  onPress?: (friend: FriendListItemData) => void;
}

/**
 * One contact: avatar · name + last 1:1 activity · 1:1 group balance.
 *
 * A ledger row, not a social row — and strictly scoped: the amount is the
 * balance of the private two-member INDIVIDUAL group with this friend
 * (the row is a shortcut into that group), never a summary of shared
 * groups. Direction is triple-encoded (sign, color, role word) exactly
 * like the group ledger, and settled contacts go deliberately quiet so
 * unfinished business pulls the eye first.
 */
const FriendListItem = ({
  friend,
  currencySymbol = "₹",
  onPress,
}: FriendListItemProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const settled = isSettled(friend.balance);
  const positive = friend.balance > 0;

  // U+2212 minus sign — same width as "+", so amounts align optically.
  const signedAmount = `${positive ? "+" : "−"} ${currencySymbol}${formatAmount(friend.balance)}`;
  const roleWord = positive ? "owes you" : "you owe";

  const a11yLabel = settled
    ? `${friend.name}, settled up`
    : `${friend.name} ${positive ? "owes you" : ", you owe them"} ${currencySymbol}${formatAmount(friend.balance)}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      android_ripple={{ color: colors.ripple }}
      onPress={onPress ? () => onPress(friend) : undefined}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <MemberAvatar
        name={friend.name}
        avatarUrl={friend.avatarUrl}
        size={scale(44)}
      />

      <View style={styles.body}>
        <Text
          style={[styles.name, settled && styles.nameSettled]}
          numberOfLines={1}
        >
          {friend.name}
        </Text>
        <Text style={styles.activity} numberOfLines={1}>
          {friend.lastActivity}
        </Text>
      </View>

      <View style={styles.amountBlock}>
        {settled ? (
          <Text style={styles.settledText}>Settled</Text>
        ) : (
          <>
            <Text
              style={[
                styles.amount,
                { color: positive ? colors.income.text : colors.expense.text },
              ]}
              numberOfLines={1}
            >
              {signedAmount}
            </Text>
            <Text style={styles.roleWord}>{roleWord}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: FRIEND_ROW_HEIGHT,
      paddingHorizontal: Dimens.screenH,
      gap: Dimens.md,
    },
    rowPressed: {
      backgroundColor: colors.brandSubtle,
    },
    body: {
      flex: 1,
    },
    name: {
      fontFamily: FONTS.medium,
      fontSize: scale(14.5),
      color: colors.text,
      includeFontPadding: false,
    },
    nameSettled: {
      color: colors.text2,
    },
    activity: {
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      color: colors.text3,
      marginTop: scale(2),
      includeFontPadding: false,
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

export default memo(FriendListItem);
