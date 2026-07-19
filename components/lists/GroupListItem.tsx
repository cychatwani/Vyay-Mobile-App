import {
  avatarTint,
  formatAmount,
  isSettled,
} from "@/components/custom/MemberBalances/balanceUtils";
import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getCardV2 } from "@/constants/Styles";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import type { GroupListItemData } from "./types";

export const GROUP_CARD_HEIGHT = scale(104);

interface GroupListItemProps {
  group: GroupListItemData;
  currencySymbol?: string;
  onPress?: (group: GroupListItemData) => void;
}

/**
 * One group as a compact card: identity tile · name + members · your
 * position, with the latest activity on a quiet second line.
 *
 * Settled vs. unsettled is the primary visual split:
 *  - money in motion → the signed amount leads in income/expense color with
 *    a role word ("you get" / "you owe"), same triple-encoding as the
 *    group ledger, and the identity tile stays vivid;
 *  - settled → a calm emerald "Settled ✓" pill and a deliberately muted
 *    name, so active groups pull the eye first when scanning.
 */
const GroupListItem = ({
  group,
  currencySymbol = "₹",
  onPress,
}: GroupListItemProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const settled = isSettled(group.balance);
  const positive = group.balance > 0;
  const tint = avatarTint(group.name, colors);

  // U+2212 minus sign — same width as "+", so amounts align optically.
  const signedAmount = `${positive ? "+" : "−"} ${currencySymbol}${formatAmount(group.balance)}`;
  const roleWord = positive ? "you get" : "you owe";

  const a11yLabel = settled
    ? `${group.name}, ${group.memberCount} members, settled up`
    : `${group.name}, ${group.memberCount} members, ${roleWord} ${currencySymbol}${formatAmount(group.balance)}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      android_ripple={{ color: colors.ripple, foreground: true }}
      onPress={onPress ? () => onPress(group) : undefined}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <View style={styles.topRow}>
        {group.photoUrl ? (
          <Image
            source={{ uri: group.photoUrl }}
            // Tinted wash doubles as the loading placeholder so the tile
            // never flashes blank white while the photo arrives.
            style={[styles.tile, { backgroundColor: tint.bg }]}
            contentFit="cover"
            transition={150}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.tile, { backgroundColor: tint.bg }]}>
            <Feather
              name={group.icon ?? "users"}
              size={scale(20)}
              color={tint.fg}
            />
          </View>
        )}

        <View style={styles.identity}>
          <Text
            style={[styles.name, settled && styles.nameSettled]}
            numberOfLines={1}
          >
            {group.name}
          </Text>
          <View style={styles.membersRow}>
            <Feather name="users" size={scale(11)} color={colors.text3} />
            <Text style={styles.members}>{group.memberCount} members</Text>
          </View>
        </View>

        {settled ? (
          <View style={styles.settledPill}>
            <Feather
              name="check"
              size={scale(12)}
              color={colors.income.text}
            />
            <Text style={styles.settledText}>Settled</Text>
          </View>
        ) : (
          <View style={styles.amountBlock}>
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
          </View>
        )}
      </View>

      <View style={styles.seam} />

      <View style={styles.activityRow}>
        <Feather name="clock" size={scale(11)} color={colors.text3} />
        <Text style={styles.activity} numberOfLines={1}>
          {group.lastActivity}
        </Text>
      </View>
    </Pressable>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    card: {
      ...getCardV2(colors),
      paddingVertical: Dimens.md,
      overflow: "hidden", // contains the Android ripple at the radius
    },
    cardPressed: {
      backgroundColor: colors.brandSubtle,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.md,
    },
    tile: {
      width: scale(46),
      height: scale(46),
      borderRadius: Dimens.radiusMd,
      alignItems: "center",
      justifyContent: "center",
    },
    identity: {
      flex: 1,
    },
    name: {
      fontFamily: FONTS.medium,
      fontSize: scale(15),
      color: colors.text,
      includeFontPadding: false,
    },
    nameSettled: {
      color: colors.text2,
    },
    membersRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      marginTop: scale(3),
    },
    members: {
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      color: colors.text3,
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
    settledPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: colors.income.bg,
      borderRadius: Dimens.radiusPill,
      paddingHorizontal: Dimens.sm + scale(2),
      paddingVertical: scale(5),
    },
    settledText: {
      fontFamily: FONTS.medium,
      fontSize: scale(11.5),
      color: colors.income.text,
      includeFontPadding: false,
    },
    seam: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: Dimens.sm + scale(2),
    },
    activityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
    },
    activity: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      color: colors.text3,
      includeFontPadding: false,
    },
  });

export default memo(GroupListItem);
