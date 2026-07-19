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
import MemberAvatar from "../MemberBalances/MemberAvatar";
import { currencySymbolFor } from "../SettlementSuggestions/settlementUtils";
import ParticipantFacepile from "./ParticipantFacepile";
import { displayName, formatClockTime } from "./timelineUtils";
import type { EnsureCardVisibleFn, ExpenseEvent } from "./types";
import { useTimelineAccordion } from "./useTimelineAccordion";

interface ExpenseCardProps {
  event: ExpenseEvent;
  currentUserId: string | number;
  expanded: boolean;
  onToggle: (id: string) => void;
  /** Navigates to the full expense screen. Wired later. */
  onOpenDetails?: (event: ExpenseEvent) => void;
  /** Lets the list pre-scroll so the expanding card stays fully visible. */
  onEnsureVisible?: EnsureCardVisibleFn;
}

/**
 * The timeline's loudest element: a full-width premium card for an expense.
 *
 * An expense is money spent, not money moved — so there are no arrows and
 * no direction. The card leads with what was bought and how much, then
 * answers the two questions that matter: who paid, and who was part of it.
 *
 * Collapsed it is a one-glance summary; tapping anywhere expands it in
 * place (same measured-height accordion as Member Balances) to reveal
 * notes, the receipt, and the door to the full expense screen.
 */
const ExpenseCard = ({
  event,
  currentUserId,
  expanded,
  onToggle,
  onOpenDetails,
  onEnsureVisible,
}: ExpenseCardProps) => {
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
  const payer = displayName(event.paidBy, currentUserId);
  const isUpdate = event.action === "updated";
  const time = formatClockTime(event.createdAt);

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

  const a11yLabel =
    `Expense, ${event.title}, ${symbol}${formatAmount(event.amount)}. ` +
    `Paid by ${payer}, split between ${event.participants.length} people, at ${time}.` +
    (isUpdate ? " Edited." : "");

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
        accessibilityHint="Shows notes, receipt and details"
      >
        <View style={styles.headRow}>
          <View style={styles.iconChip}>
            <Feather
              name={isUpdate ? "edit-2" : "shopping-bag"}
              size={scale(15)}
              color={colors.brandText}
            />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {event.title}
            </Text>
            <Text style={styles.subLine} numberOfLines={1}>
              {isUpdate ? "Expense edited" : "Expense"}
              {"\u00A0\u00B7\u00A0"}
              {time}
            </Text>
          </View>

          <View style={styles.amountBlock}>
            <Text style={styles.amount} numberOfLines={1}>
              {symbol}
              {formatAmount(event.amount)}
            </Text>
          </View>
        </View>

        {/* who paid · who participated */}
        <View style={styles.peopleRow}>
          <View style={styles.paidBy}>
            <MemberAvatar
              name={event.paidBy.name}
              avatarUrl={event.paidBy.avatarUrl}
              size={scale(22)}
            />
            <Text style={styles.paidByText} numberOfLines={1}>
              {payer} paid
            </Text>
          </View>

          <View style={styles.split}>
            <ParticipantFacepile people={event.participants} />
            <Text style={styles.splitText}>
              {event.participants.length} split
            </Text>
          </View>

          <Animated.View style={chevronStyle}>
            <Feather
              name="chevron-down"
              size={scale(16)}
              color={colors.text3}
            />
          </Animated.View>
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

              {!!event.receiptUrl && (
                <View>
                  <Text style={styles.detailLabel}>Receipt</Text>
                  <Image
                    source={{ uri: event.receiptUrl }}
                    style={styles.receipt}
                    contentFit="cover"
                    transition={150}
                    accessibilityIgnoresInvertColors
                    accessible
                    accessibilityLabel="Receipt preview"
                  />
                </View>
              )}

              {(event.attachmentCount ?? 0) > 0 && (
                <View style={styles.metaRow}>
                  <Feather
                    name="paperclip"
                    size={scale(12)}
                    color={colors.text3}
                  />
                  <Text style={styles.metaText}>
                    {event.attachmentCount}{" "}
                    {event.attachmentCount === 1 ? "attachment" : "attachments"}
                  </Text>
                </View>
              )}

              <Text style={styles.metaText}>
                {isUpdate ? "Edited" : "Added"} by{" "}
                {displayName(event.actor ?? event.paidBy, currentUserId)}
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
                accessibilityLabel={`Open full details for ${event.title}`}
              >
                <Text style={styles.detailsButtonText}>
                  View expense details
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
    iconChip: {
      width: scale(34),
      height: scale(34),
      borderRadius: Dimens.radiusSm,
      backgroundColor: colors.brandSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    titleBlock: {
      flex: 1,
    },
    title: {
      fontFamily: FONTS.medium,
      fontSize: scale(14.5),
      color: colors.text,
      includeFontPadding: false,
    },
    subLine: {
      fontFamily: FONTS.regular,
      fontSize: scale(11),
      color: colors.text3,
      marginTop: scale(1),
      includeFontPadding: false,
    },
    amountBlock: {
      alignItems: "flex-end",
    },
    amount: {
      fontFamily: FONTS.bold,
      fontSize: scale(15.5),
      color: colors.text,
      includeFontPadding: false,
    },

    peopleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: Dimens.md,
      gap: Dimens.md,
      minHeight: scale(26),
    },
    paidBy: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      flexShrink: 1,
    },
    paidByText: {
      fontFamily: FONTS.medium,
      fontSize: scale(12),
      color: colors.text2,
      includeFontPadding: false,
      flexShrink: 1,
    },
    split: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: scale(6),
    },
    splitText: {
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      color: colors.text3,
      includeFontPadding: false,
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
    receipt: {
      height: scale(120),
      borderRadius: Dimens.radiusMd,
      backgroundColor: colors.divider,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
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

export default memo(ExpenseCard);
