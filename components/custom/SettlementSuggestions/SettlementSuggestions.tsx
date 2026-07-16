import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getCardV2 } from "@/constants/Styles";
import { openSheet } from "@/store/sheetStore";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";
import { formatAmount } from "../MemberBalances/balanceUtils";
import MemberAvatar from "../MemberBalances/MemberAvatar";
import SettlementRow from "./SettlementRow";
import {
  buildPlanView,
  currencySymbolFor,
  keyOfSuggestion,
} from "./settlementUtils";
import SettleUpSheet from "./SettleUpSheet";
import type { SettlementSuggestion } from "./types";
import UserSettlementTile from "./UserSettlementTile";

interface SettlementSuggestionsProps {
  /** The optimized plan, exactly as returned by the backend. */
  suggestions: SettlementSuggestion[];
  /** Their transfers surface first and become tappable. */
  currentUserId?: string | number;
  /** Card label. Rendered as an uppercase eyebrow. */
  title?: string;
  /** Display override. Defaults to the symbol for the plan's own currency. */
  currencySymbol?: string;
  initiallyExpanded?: boolean;
  /**
   * Raw pairwise-debt count before simplification (from the API). When it
   * beats the plan, the header gets to say how much work the algorithm saved.
   */
  originalDebtCount?: number;
  /** Override what tapping one of the viewer's transfers does. Defaults to
   *  opening the settle-up Bottom Sheet. */
  onSettle?: (suggestion: SettlementSuggestion) => void;
}

/** Same motion vocabulary as Member Balances — the cards must feel related. */
const EASE = Easing.bezier(0.2, 0, 0, 1);
const OPEN_MS = 340;
const CLOSE_MS = 260;
const RESIZE_MS = 240;

/** Others' rows shown before the rest fold away. */
const OTHERS_VISIBLE = 5;

/**
 * Settlement Suggestions — the answer to the question Member Balances leaves
 * hanging: "so what do I actually do?"
 *
 * Collapsed, it leads with the plan's headline number — how few payments it
 * takes to settle the whole group — plus the viewer's own part so the card is
 * personally useful without a tap. Expanded, the viewer's transfers surface
 * first as raised, tappable tiles; everyone else's stay flat and quiet. Long
 * plans fold behind a "more payments" cluster so 20+ transfers never turn
 * into a wall.
 *
 * If nothing needs settling the accordion doesn't render at all — just a slim
 * celebratory strip.
 */
const SettlementSuggestions = ({
  suggestions,
  currentUserId,
  title = "Settlement plan",
  currencySymbol: currencySymbolProp,
  initiallyExpanded = false,
  originalDebtCount,
  onSettle,
}: SettlementSuggestionsProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);
  const reducedMotion = useReducedMotion();

  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [showAll, setShowAll] = useState(false);

  // Single driver for the accordion; chevron, rise, and row cascade all
  // derive from it.
  const progress = useSharedValue(initiallyExpanded ? 1 : 0);
  const foldProgress = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const hasMeasured = useRef(false);

  const {
    mine,
    others,
    totalMoving,
    peopleCount,
    myPayTotal,
    myReceiveTotal,
    currency,
  } = useMemo(
    () => buildPlanView(suggestions, currentUserId),
    [suggestions, currentUserId],
  );

  const currencySymbol = currencySymbolProp ?? currencySymbolFor(currency);

  const count = suggestions.length;
  const paymentWord = count === 1 ? "payment" : "payments";

  const foldable = others.length > OTHERS_VISIBLE + 1;
  const visibleOthers = foldable ? others.slice(0, OTHERS_VISIBLE) : others;
  const hiddenOthers = foldable ? others.slice(OTHERS_VISIBLE) : [];

  const savedShare =
    originalDebtCount && originalDebtCount > count
      ? Math.round((1 - count / originalDebtCount) * 100)
      : null;

  /* ---------------------------- viewer's part ---------------------------- */

  const paysOnly = myPayTotal > 0 && myReceiveTotal === 0;
  const receivesOnly = myReceiveTotal > 0 && myPayTotal === 0;

  const youPart = paysOnly
    ? `Pay ${currencySymbol}${formatAmount(myPayTotal)}`
    : receivesOnly
      ? `Collect ${currencySymbol}${formatAmount(myReceiveTotal)}`
      : `${mine.length} payments`;

  const youRole = paysOnly
    ? colors.expense
    : receivesOnly
      ? colors.income
      : null;

  const youIcon = paysOnly
    ? "arrow-up-right"
    : receivesOnly
      ? "arrow-down-left"
      : "repeat";

  /* ------------------------------- motion -------------------------------- */

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withTiming(next ? 1 : 0, {
      duration: reducedMotion ? 0 : next ? OPEN_MS : CLOSE_MS,
      easing: EASE,
    });
    // Same accent as the card above: light tap on open, soft exhale on close.
    Haptics.impactAsync(
      next
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Soft,
    ).catch(() => {});
  };

  const toggleShowAll = () => {
    const next = !showAll;
    setShowAll(next);
    foldProgress.value = withTiming(next ? 1 : 0, {
      duration: reducedMotion ? 0 : 200,
      easing: EASE,
    });
    Haptics.selectionAsync().catch(() => {});
  };

  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (!hasMeasured.current) {
      hasMeasured.current = true;
      contentHeight.value = h; // first measurement snaps — no mount animation
    } else if (Math.abs(contentHeight.value - h) > 0.5) {
      // Content grew/shrank while open (the fold) — glide, don't jump.
      contentHeight.value = withTiming(h, {
        duration: reducedMotion ? 0 : RESIZE_MS,
        easing: EASE,
      });
    }
  };

  const collapseStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
  }));

  // The block rises as a unit while individual rows cascade in on top of it
  // (each row owns its own opacity slice of `progress`).
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [8, 0]) }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const foldChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${foldProgress.value * 180}deg` }],
  }));

  /* ------------------------------- pieces -------------------------------- */

  const handleSettle = (s: SettlementSuggestion) => {
    if (onSettle) {
      onSettle(s);
      return;
    }
    openSheet(
      <SettleUpSheet
        suggestion={s}
        viewerId={currentUserId}
        currencySymbol={currencySymbol}
      />,
      { snapPoints: ["46%"] },
    );
  };

  const renderStat = (dotColor: string, label: string) => (
    <View style={styles.stat} key={label}>
      <View style={[styles.statDot, { backgroundColor: dotColor }]} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  /* ----------------------------- empty state ----------------------------- */

  // Nothing to settle: no accordion, no chevron — just the good news. This is
  // the group's finish line, so it gets the one marigold moment in the card.
  if (count === 0) {
    return (
      <View
        style={[styles.card, styles.emptyCard]}
        accessible
        accessibilityLabel="Everyone is settled. No payments needed in this group."
      >
        <View style={styles.emptyBadge}>
          <Feather name="award" size={scale(18)} color={colors.rewards.icon} />
        </View>
        <View style={styles.emptyText}>
          <Text style={styles.emptyTitle}>Everyone&apos;s settled</Text>
          <Text style={styles.emptySub}>
            No payments needed — every balance is clear.
          </Text>
        </View>
      </View>
    );
  }

  /* -------------------------------- card --------------------------------- */

  const headerLabel =
    `${title}. ${count} ${paymentWord} settle the whole group.` +
    (mine.length > 0 ? ` Your part: ${youPart}.` : "");

  const sectioned = mine.length > 0 && others.length > 0;

  return (
    <View style={styles.card}>
      {/* ---------- header: the summary IS the accordion handle ---------- */}
      <Pressable
        style={[styles.header, !expanded && styles.headerCollapsed]}
        android_ripple={{ color: colors.ripple }}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={headerLabel}
        accessibilityHint="Shows who pays whom"
      >
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>{title}</Text>
          <Animated.View style={[styles.chevronChip, chevronStyle]}>
            <Feather
              name="chevron-down"
              size={scale(16)}
              color={colors.brandText}
            />
          </Animated.View>
        </View>

        {/* The plan's headline number: how FEW payments it takes. */}
        <View style={styles.heroRow}>
          <Text style={styles.heroCount}>{count}</Text>
          <Text style={styles.heroWord}>{paymentWord}</Text>
        </View>
        <Text style={styles.heroSub}>the fewest needed to settle everyone</Text>

        <View style={styles.statsRow}>
          {renderStat(
            colors.brand,
            `${currencySymbol}${formatAmount(totalMoving)} changing hands`,
          )}
          {renderStat(colors.text3, `${peopleCount} people`)}
          {savedShare !== null &&
            renderStat(colors.income.icon, `${savedShare}% fewer payments`)}
        </View>

        {/* The viewer's slice of the plan, visible without expanding. */}
        {mine.length > 0 && (
          <View style={styles.youStrip}>
            <View
              style={[
                styles.youChip,
                { backgroundColor: youRole?.bg ?? colors.brandSubtle },
              ]}
            >
              <Feather
                name={youIcon}
                size={scale(12)}
                color={youRole?.icon ?? colors.brandText}
              />
            </View>
            <Text style={styles.youLabel}>Your part</Text>
            <Text
              style={[
                styles.youValue,
                { color: youRole?.text ?? colors.brandText },
              ]}
              numberOfLines={1}
            >
              {youPart}
            </Text>
          </View>
        )}
      </Pressable>

      {/* ---------- collapsible plan ---------- */}
      <Animated.View style={[styles.collapse, collapseStyle]}>
        <View
          style={styles.measurer}
          onLayout={onContentLayout}
          pointerEvents={expanded ? "auto" : "none"}
        >
          <Animated.View style={contentStyle}>
            <View style={styles.seam} />
            <View style={styles.list}>
              {/* The viewer's transfers lead, raised and tappable. */}
              {mine.length > 0 && (
                <View style={styles.tileGroup}>
                  {sectioned && (
                    <Text style={styles.sectionLabel}>For you</Text>
                  )}
                  {mine.map((s, i) => (
                    <UserSettlementTile
                      key={keyOfSuggestion(s, i)}
                      suggestion={s}
                      currencySymbol={currencySymbol}
                      viewerId={currentUserId as string | number}
                      onPress={handleSettle}
                      progress={progress}
                      staggerIndex={i}
                    />
                  ))}
                </View>
              )}

              {sectioned && (
                <Text style={[styles.sectionLabel, styles.sectionLabelInset]}>
                  Everyone else
                </Text>
              )}

              {visibleOthers.map((s, i) => (
                <SettlementRow
                  key={keyOfSuggestion(s, i)}
                  suggestion={s}
                  currencySymbol={currencySymbol}
                  progress={progress}
                  staggerIndex={mine.length + i}
                />
              ))}

              {/* Long plans fold: first rows stay, the tail tucks behind a
                  cluster so 20+ transfers never become a wall. */}
              {foldable && (
                <>
                  <View style={styles.clusterDivider} />
                  <Pressable
                    style={styles.clusterRow}
                    android_ripple={{ color: colors.ripple }}
                    onPress={toggleShowAll}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showAll }}
                    accessibilityLabel={`${hiddenOthers.length} more payments`}
                  >
                    <View style={styles.facepile}>
                      {hiddenOthers.slice(0, 3).map((s, i) => (
                        <View
                          key={keyOfSuggestion(s, i)}
                          style={i > 0 && styles.faceOverlap}
                        >
                          <MemberAvatar
                            name={s.fromUser.name}
                            avatarUrl={s.fromUser.avatarUrl}
                            size={scale(24)}
                            ringColor={colors.card}
                          />
                        </View>
                      ))}
                    </View>
                    <Text style={styles.clusterLabel}>
                      {showAll
                        ? "Show less"
                        : `${hiddenOthers.length} more payments`}
                    </Text>
                    <Animated.View style={foldChevronStyle}>
                      <Feather
                        name="chevron-down"
                        size={scale(15)}
                        color={colors.text3}
                      />
                    </Animated.View>
                  </Pressable>

                  {showAll &&
                    hiddenOthers.map((s, i) => (
                      <Animated.View
                        key={keyOfSuggestion(s, i)}
                        entering={
                          reducedMotion
                            ? undefined
                            : FadeInDown.duration(220).delay(
                                Math.min(i, 10) * 22,
                              )
                        }
                      >
                        <SettlementRow
                          suggestion={s}
                          currencySymbol={currencySymbol}
                        />
                      </Animated.View>
                    ))}
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

/* -------------------------------- styles -------------------------------- */

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    card: {
      ...getCardV2(colors),
      paddingVertical: 0,
      paddingHorizontal: 0,
    },

    /* header */
    header: {
      paddingHorizontal: Dimens.lg,
      paddingTop: Dimens.lg,
      paddingBottom: Dimens.lg,
      borderTopLeftRadius: Dimens.radiusLg,
      borderTopRightRadius: Dimens.radiusLg,
      overflow: "hidden", // contains the Android ripple
    },
    headerCollapsed: {
      borderBottomLeftRadius: Dimens.radiusLg,
      borderBottomRightRadius: Dimens.radiusLg,
    },
    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Dimens.md,
    },
    eyebrow: {
      fontFamily: FONTS.medium,
      fontSize: scale(11),
      letterSpacing: scale(1),
      textTransform: "uppercase",
      color: colors.text2,
      includeFontPadding: false,
    },
    chevronChip: {
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      backgroundColor: colors.brandSubtle,
      alignItems: "center",
      justifyContent: "center",
    },

    /* hero */
    heroRow: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    heroCount: {
      fontFamily: FONTS.bold,
      fontSize: scale(27),
      lineHeight: scale(32),
      letterSpacing: scale(-0.3),
      color: colors.text,
      includeFontPadding: false,
    },
    heroWord: {
      fontFamily: FONTS.medium,
      fontSize: scale(15),
      color: colors.text2,
      marginLeft: scale(6),
      paddingBottom: scale(4),
      includeFontPadding: false,
    },
    heroSub: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text3,
      marginTop: scale(2),
      includeFontPadding: false,
    },

    /* composition stats */
    statsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: Dimens.lg,
      rowGap: Dimens.xs,
      marginTop: Dimens.md,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    statDot: {
      width: scale(6),
      height: scale(6),
      borderRadius: scale(3),
    },
    statLabel: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text2,
      includeFontPadding: false,
    },

    /* viewer's part strip */
    youStrip: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.sm,
      marginTop: Dimens.md,
      paddingTop: Dimens.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    youChip: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
    },
    youLabel: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text2,
      includeFontPadding: false,
    },
    youValue: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      includeFontPadding: false,
    },

    /* collapsible */
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
    list: {
      paddingTop: Dimens.sm,
      paddingBottom: Dimens.sm,
    },

    /* viewer tiles */
    tileGroup: {
      paddingHorizontal: Dimens.lg,
      paddingTop: Dimens.xs,
      gap: Dimens.sm,
    },
    sectionLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(11),
      letterSpacing: scale(0.8),
      textTransform: "uppercase",
      color: colors.text3,
      includeFontPadding: false,
    },
    sectionLabelInset: {
      paddingHorizontal: Dimens.lg,
      marginTop: Dimens.lg,
      marginBottom: Dimens.xs,
    },

    /* fold cluster */
    clusterDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginHorizontal: Dimens.lg,
      marginVertical: Dimens.xs,
    },
    clusterRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: scale(44),
      paddingHorizontal: Dimens.lg,
      gap: Dimens.md,
    },
    facepile: {
      flexDirection: "row",
      alignItems: "center",
    },
    faceOverlap: {
      marginLeft: -scale(9),
    },
    clusterLabel: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text2,
      includeFontPadding: false,
    },

    /* empty state */
    emptyCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.md,
      paddingVertical: Dimens.lg,
      paddingHorizontal: Dimens.lg,
    },
    emptyBadge: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.rewards.bg,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      flex: 1,
    },
    emptyTitle: {
      fontFamily: FONTS.medium,
      fontSize: scale(16),
      color: colors.text,
      includeFontPadding: false,
    },
    emptySub: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text3,
      marginTop: scale(2),
      includeFontPadding: false,
    },
  });

export default SettlementSuggestions;
