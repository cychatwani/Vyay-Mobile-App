import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";
import { formatAmount } from "../MemberBalances/balanceUtils";
import PairAvatars from "./PairAvatars";
import { viewerPays } from "./settlementUtils";
import type { SettlementSuggestion } from "./types";

interface UserSettlementTileProps {
  suggestion: SettlementSuggestion;
  currencySymbol: string;
  viewerId: string | number;
  onPress: (suggestion: SettlementSuggestion) => void;
  /** Accordion driver — tiles cascade in as the card opens. */
  progress?: SharedValue<number>;
  staggerIndex?: number;
}

const STAGGER_CAP = 8;
const PRESS_EASE = Easing.bezier(0.2, 0, 0, 1);

/**
 * The viewer's own leg of the plan, and the only element in the card that is
 * tappable. Everything about it says so: it sits raised on its own surface,
 * the amount is signed and colored, a "Settle" chip names the action, and it
 * gives under the finger. Informational rows around it stay flat on purpose —
 * the contrast is the affordance.
 *
 * Tapping opens the settle-up Bottom Sheet (a placeholder today, the full
 * settlement workflow later).
 */
const UserSettlementTile = ({
  suggestion,
  currencySymbol,
  viewerId,
  onPress,
  progress,
  staggerIndex = 0,
}: UserSettlementTileProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const iPay = viewerPays(suggestion, viewerId);
  const other = iPay ? suggestion.toUser : suggestion.fromUser;

  const headline = iPay ? `You pay ${other.name}` : `${other.name} pays you`;
  const role = iPay ? colors.expense : colors.income;
  // U+2212 minus — same optical width as "+", matching MemberBalanceRow.
  const signedAmount = `${iPay ? "\u2212" : "+"} ${currencySymbol}${formatAmount(suggestion.amount)}`;
  const chipLabel = iPay ? "Settle" : "Record";

  /* ------------------------------ motion ------------------------------ */

  // Press feedback: the tile eases down 2% under the finger and springs back
  // on release — a physical "give" the flat rows never show.
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
  }));

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

  const handlePress = () => {
    // Medium impact: opening the settle flow is the card's weightiest action,
    // one notch above the Light tap the accordion header gives.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress(suggestion);
  };

  return (
    <Animated.View style={[stagger, pressStyle]}>
      <Pressable
        style={({ pressed: isPressed }) => [
          styles.tile,
          isPressed && styles.tilePressed,
        ]}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 90, easing: PRESS_EASE });
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, { duration: 180, easing: PRESS_EASE });
        }}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${headline}, ${currencySymbol}${formatAmount(suggestion.amount)}`}
        accessibilityHint="Opens settle up"
      >
        <PairAvatars
          fromUser={suggestion.fromUser}
          toUser={suggestion.toUser}
          size={scale(30)}
          emphasized
        />

        <View style={styles.body}>
          <Text style={styles.headline} numberOfLines={1}>
            {headline}
          </Text>
          <Text style={[styles.amount, { color: role.text }]} numberOfLines={1}>
            {signedAmount}
          </Text>
        </View>

        <View style={styles.chip}>
          <Text style={styles.chipLabel}>{chipLabel}</Text>
          <Feather
            name="chevron-right"
            size={scale(13)}
            color={colors.brandText}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    tile: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.md,
      backgroundColor: colors.card,
      borderRadius: Dimens.radiusMd,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: Dimens.md,
      paddingHorizontal: Dimens.md,
      // Raised just above the card — the quiet cue that this one is a button.
      shadowColor: "#0D0E13",
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.05,
      shadowRadius: scale(8),
      elevation: 1,
    },
    tilePressed: {
      backgroundColor: colors.brandSubtle,
      borderColor: colors.brand,
    },
    body: {
      flex: 1,
    },
    headline: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      includeFontPadding: false,
    },
    amount: {
      fontFamily: FONTS.bold,
      fontSize: scale(16),
      marginTop: scale(2),
      includeFontPadding: false,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(2),
      backgroundColor: colors.brandSubtle,
      borderRadius: Dimens.radiusPill,
      paddingLeft: Dimens.md,
      paddingRight: Dimens.sm,
      paddingVertical: scale(6),
    },
    chipLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(12),
      color: colors.brandText,
      includeFontPadding: false,
    },
  });

export default UserSettlementTile;
