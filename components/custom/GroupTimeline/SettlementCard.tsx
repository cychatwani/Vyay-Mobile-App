import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getCardV2 } from "@/constants/Styles";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { memo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { scale } from "react-native-size-matters";
import { formatAmount } from "../MemberBalances/balanceUtils";
import PairAvatars from "../SettlementSuggestions/PairAvatars";
import { currencySymbolFor } from "../SettlementSuggestions/settlementUtils";
import { displayName, formatClockTime, isViewer } from "./timelineUtils";
import type { EnsureCardVisibleFn, SettlementEvent } from "./types";
import { useTimelineAccordion } from "./useTimelineAccordion";

interface SettlementCardProps {
  event: SettlementEvent;
  currentUserId: string | number;
  expanded: boolean;
  onToggle: (id: string) => void;
  /** Navigates to the full settlement screen. Wired later. */
  onOpenDetails?: (event: SettlementEvent) => void;
  /** Lets the list pre-scroll so the expanding card stays fully visible. */
  onEnsureVisible?: EnsureCardVisibleFn;
}

/**
 * A settlement IS a transfer — the only timeline card where direction is
 * part of the meaning. The same PairAvatars glyph as the Settlement Plan
 * carries it: debtor on the left, creditor on the right, the arrow badge
 * riding the seam. Reading order matches the money.
 *
 * Color follows the app-wide rule: amounts stay neutral unless the money
 * is the viewer's own, in which case they're signed and colored exactly
 * like the settle-up tiles.
 */
const SettlementCard = ({
  event,
  currentUserId,
  expanded,
  onToggle,
  onOpenDetails,
  onEnsureVisible,
}: SettlementCardProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);
  const rootRef = useRef<View>(null);

  const {
    collapseStyle,
    contentStyle,
    chevronStyle,
    onContentLayout,
    toggleHaptic,
    getExpandedContentHeight,
  } = useTimelineAccordion(event.id, expanded);

  const symbol = currencySymbolFor(event.currency);
  const completed = event.status === "completed";
  const time = formatClockTime(event.createdAt);

  const iPay = isViewer(event.fromUser, currentUserId);
  const iReceive = isViewer(event.toUser, currentUserId);
  const involvesMe = iPay || iReceive;

  const from = displayName(event.fromUser, currentUserId);
  const to = displayName(event.toUser, currentUserId);
  const headline = `${from} ${completed ? "paid" : iPay ? "pay" : "pays"} ${to}`;

  // Viewer's own money is signed and colored; everyone else's stays neutral.
  const amountText = involvesMe
    ? `${iPay ? "\u2212" : "+"} ${symbol}${formatAmount(event.amount)}`
    : `${symbol}${formatAmount(event.amount)}`;
  const amountColor = involvesMe
    ? (iPay ? colors.expense : colors.income).text
    : colors.text;

  const statusRole = completed ? colors.success : colors.pending;
  const statusLabel = completed ? "Completed" : "Proposed";

  const handleToggle = () => {
    const opening = !expanded;
    toggleHaptic(opening);
    if (opening) {
      // Ask the list to keep us on screen — in the inverted timeline this
      // card is about to grow upward by the detail's measured height.
      onEnsureVisible?.(rootRef.current, getExpandedContentHeight());
    }
    onToggle(event.id);
  };

  const a11yLabel = `Settlement ${statusLabel.toLowerCase()}. ${headline}, ${symbol}${formatAmount(event.amount)}, at ${time}.`;

  return (
    <View ref={rootRef} collapsable={false} style={styles.card}>
      {/* ---------- collapsed summary: also the accordion handle ---------- */}
      <Pressable
        style={[styles.summary, !expanded && styles.summaryCollapsed]}
        android_ripple={{ color: colors.ripple }}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={a11yLabel}
        accessibilityHint="Shows notes, proof and details"
      >
        <View style={styles.headRow}>
          <PairAvatars
            fromUser={event.fromUser}
            toUser={event.toUser}
            size={scale(30)}
            emphasized={involvesMe}
          />

          <View style={styles.titleBlock}>
            <Text style={styles.headline} numberOfLines={1}>
              {headline}
            </Text>
            <View style={styles.subRow}>
              <View
                style={[styles.statusChip, { backgroundColor: statusRole.bg }]}
              >
                <Feather
                  name={completed ? "check" : "clock"}
                  size={scale(9)}
                  color={statusRole.icon}
                />
                <Text style={[styles.statusText, { color: statusRole.text }]}>
                  {statusLabel}
                </Text>
              </View>
              <Text style={styles.time}>{time}</Text>
            </View>
          </View>

          <View style={styles.amountBlock}>
            <Text
              style={[styles.amount, { color: amountColor }]}
              numberOfLines={1}
            >
              {amountText}
            </Text>
            <Animated.View style={[styles.chevron, chevronStyle]}>
              <Feather
                name="chevron-down"
                size={scale(15)}
                color={colors.text3}
              />
            </Animated.View>
          </View>
        </View>
      </Pressable>

      {/* -------------------- expandable detail -------------------- */}
      <Animated.View style={[styles.collapse, collapseStyle]}>
        <View
          style={styles.measurer}
          onLayout={onContentLayout}
          pointerEvents={expanded ? "auto" : "none"}
        >
          <Animated.View style={contentStyle}>
            <View style={styles.seam} />
            <View style={styles.detail}>
              {!!event.notes && (
                <View>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.notes}>{event.notes}</Text>
                </View>
              )}

              {!!event.proofUrl && (
                <View>
                  <Text style={styles.detailLabel}>Payment proof</Text>
                  <Image
                    source={{ uri: event.proofUrl }}
                    style={styles.proof}
                    contentFit="cover"
                    transition={150}
                    accessibilityIgnoresInvertColors
                    accessible
                    accessibilityLabel="Payment proof preview"
                  />
                </View>
              )}

              <Text style={styles.metaText}>
                {completed
                  ? `Settled between ${event.fromUser.name} and ${event.toUser.name}`
                  : `Proposed by ${event.fromUser.name}`}
                {"\u00A0\u00B7\u00A0"}
                {time}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.detailsButton,
                  pressed && styles.detailsButtonPressed,
                ]}
                android_ripple={{ color: colors.ripple }}
                onPress={() => onOpenDetails?.(event)}
                accessibilityRole="button"
                accessibilityLabel="Open full settlement details"
              >
                <Text style={styles.detailsButtonText}>
                  View settlement details
                </Text>
                <Feather
                  name="chevron-right"
                  size={scale(14)}
                  color={colors.brandText}
                />
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    card: {
      ...getCardV2(colors),
      paddingVertical: 0,
      paddingHorizontal: 0,
      marginTop: Dimens.md,
    },

    summary: {
      paddingHorizontal: Dimens.lg,
      paddingVertical: Dimens.md,
      borderTopLeftRadius: Dimens.radiusLg,
      borderTopRightRadius: Dimens.radiusLg,
      overflow: "hidden", // contains the Android ripple
    },
    summaryCollapsed: {
      borderBottomLeftRadius: Dimens.radiusLg,
      borderBottomRightRadius: Dimens.radiusLg,
    },

    headRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.md,
    },
    titleBlock: {
      flex: 1,
    },
    headline: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      includeFontPadding: false,
    },
    subRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.sm,
      marginTop: scale(3),
    },
    statusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(3),
      borderRadius: Dimens.radiusPill,
      paddingHorizontal: scale(7),
      paddingVertical: scale(2),
    },
    statusText: {
      fontFamily: FONTS.medium,
      fontSize: scale(10),
      includeFontPadding: false,
    },
    time: {
      fontFamily: FONTS.regular,
      fontSize: scale(11),
      color: colors.text3,
      includeFontPadding: false,
    },
    amountBlock: {
      alignItems: "flex-end",
      gap: scale(2),
    },
    amount: {
      fontFamily: FONTS.bold,
      fontSize: scale(14.5),
      includeFontPadding: false,
    },
    chevron: {
      marginTop: scale(1),
    },

    /* expandable */
    collapse: {
      overflow: "hidden",
    },
    measurer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    seam: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
    },
    detail: {
      paddingHorizontal: Dimens.lg,
      paddingVertical: Dimens.md,
      gap: Dimens.md,
    },
    detailLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(10.5),
      letterSpacing: scale(0.8),
      textTransform: "uppercase",
      color: colors.text2,
      marginBottom: scale(4),
      includeFontPadding: false,
    },
    notes: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      lineHeight: scale(19),
      color: colors.text,
      includeFontPadding: false,
    },
    proof: {
      height: scale(120),
      borderRadius: Dimens.radiusMd,
      backgroundColor: colors.divider,
    },
    metaText: {
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      color: colors.text3,
      includeFontPadding: false,
    },
    detailsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(2),
      minHeight: scale(40),
      borderRadius: Dimens.radiusPill,
      backgroundColor: colors.brandSubtle,
    },
    detailsButtonPressed: {
      backgroundColor: colors.divider,
    },
    detailsButtonText: {
      fontFamily: FONTS.medium,
      fontSize: scale(12.5),
      color: colors.brandText,
      includeFontPadding: false,
    },
  });

export default memo(SettlementCard);
