import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getCardV2 } from "@/constants/Styles";
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
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";
import { formatAmount, formatAmountParts, splitBalances } from "./balanceUtils";
import MemberAvatar from "./MemberAvatar";
import MemberBalanceRow from "./MemberBalanceRow";
import type { MemberBalance } from "./types";

interface MemberBalancesProps {
  members: MemberBalance[];
  /** Card label. Rendered as an uppercase eyebrow. */
  title?: string;
  currencySymbol?: string;
  initiallyExpanded?: boolean;
  /** When provided, member rows become tappable (e.g. jump to settle-up). */
  onMemberPress?: (member: MemberBalance) => void;
}

/** Material "emphasized" curve — confident deceleration, no spring wobble. */
const EASE = Easing.bezier(0.2, 0, 0, 1);
const OPEN_MS = 340;
const CLOSE_MS = 260;
const RESIZE_MS = 240;

/**
 * Member Balances — the group ledger as a single calm card.
 *
 * Collapsed, it answers the only question that matters at a glance:
 * how much money is still in motion, and how the group splits into
 * owed / owing / settled. Expanded, it reveals a ranked ladder from the
 * largest creditor down to the largest debtor. Settled members fold into
 * a quiet facepile cluster so a 20-person group stays readable.
 */
const MemberBalances = ({
  members,
  title = "Member balances",
  currencySymbol = "\u20B9",
  initiallyExpanded = false,
  onMemberPress,
}: MemberBalancesProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);
  const reducedMotion = useReducedMotion();

  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [showSettled, setShowSettled] = useState(false);

  // Single driver for the accordion; everything else derives from it.
  const progress = useSharedValue(initiallyExpanded ? 1 : 0);
  const settledProgress = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const hasMeasured = useRef(false);

  const { ranked, settled, creditorCount, debtorCount, outstanding } = useMemo(
    () => splitBalances(members),
    [members],
  );

  const allSettled = ranked.length === 0 && settled.length > 0;
  const useSettledCluster = !allSettled && settled.length >= 2;
  const hero = formatAmountParts(outstanding);

  /* ------------------------------ motion ------------------------------ */

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withTiming(next ? 1 : 0, {
      duration: reducedMotion ? 0 : next ? OPEN_MS : CLOSE_MS,
      easing: EASE,
    });
    // Light tap on open, soft exhale on close.
    Haptics.impactAsync(
      next
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Soft,
    ).catch(() => {});
  };

  const toggleSettled = () => {
    const next = !showSettled;
    setShowSettled(next);
    settledProgress.value = withTiming(next ? 1 : 0, {
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
      // Content grew/shrank while open (settled cluster) — glide, don't jump.
      contentHeight.value = withTiming(h, {
        duration: reducedMotion ? 0 : RESIZE_MS,
        easing: EASE,
      });
    }
  };

  const collapseStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
  }));

  // The list doesn't just appear — it rises into place as the card opens.
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.35, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [10, 0]) },
    ],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const settledChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${settledProgress.value * 180}deg` }],
  }));

  /* ------------------------------ pieces ------------------------------ */

  const renderStat = (dotColor: string, label: string) => (
    <View style={styles.stat} key={label}>
      <View style={[styles.statDot, { backgroundColor: dotColor }]} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const keyOf = (m: MemberBalance, i: number) => m.id ?? `${m.name}-${i}`;

  if (members.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{title}</Text>
          <Text style={styles.emptyText}>
            No members yet. Balances will appear here once the group has
            expenses.
          </Text>
        </View>
      </View>
    );
  }

  const headerLabel = allSettled
    ? `${title}. All settled up.`
    : `${title}. ${currencySymbol}${formatAmount(outstanding)} left to settle.`;

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
        accessibilityHint="Shows each member's balance"
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

        {allSettled ? (
          <View style={styles.settledHero}>
            <View style={styles.settledBadge}>
              <Feather
                name="check"
                size={scale(18)}
                color={colors.income.icon}
              />
            </View>
            <View style={styles.settledHeroText}>
              <Text style={styles.settledTitle}>All settled up</Text>
              <Text style={styles.heroSub}>
                No pending balances in this group
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.heroRow}>
              <Text style={styles.heroSymbol}>{currencySymbol}</Text>
              <Text
                style={styles.heroInt}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
              >
                {hero.int}
              </Text>
              <Text style={styles.heroDec}>.{hero.dec}</Text>
            </View>
            <Text style={styles.heroSub}>left to settle</Text>

            <View style={styles.statsRow}>
              {creditorCount > 0 &&
                renderStat(
                  colors.income.icon,
                  `${creditorCount} ${creditorCount === 1 ? "is owed" : "are owed"}`,
                )}
              {debtorCount > 0 &&
                renderStat(
                  colors.expense.icon,
                  `${debtorCount} ${debtorCount === 1 ? "owes" : "owe"}`,
                )}
              {settled.length > 0 &&
                renderStat(colors.text3, `${settled.length} settled`)}
            </View>
          </>
        )}
      </Pressable>

      {/* ---------- collapsible ledger ---------- */}
      <Animated.View style={[styles.collapse, collapseStyle]}>
        <View
          style={styles.measurer}
          onLayout={onContentLayout}
          pointerEvents={expanded ? "auto" : "none"}
        >
          <Animated.View style={contentStyle}>
            <View style={styles.seam} />
            <View style={styles.list}>
              {(allSettled ? settled : ranked).map((m, i) => (
                <MemberBalanceRow
                  key={keyOf(m, i)}
                  member={m}
                  currencySymbol={currencySymbol}
                  onPress={onMemberPress}
                />
              ))}

              {/* A lone settled member just sits at the bottom of the list. */}
              {!allSettled && settled.length === 1 && (
                <MemberBalanceRow
                  member={settled[0]}
                  currencySymbol={currencySymbol}
                  onPress={onMemberPress}
                />
              )}

              {/* Two or more fold into a quiet cluster — the ledger stays
                  short no matter how large the group gets. */}
              {useSettledCluster && (
                <>
                  <View style={styles.clusterDivider} />
                  <Pressable
                    style={styles.clusterRow}
                    android_ripple={{ color: colors.ripple }}
                    onPress={toggleSettled}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showSettled }}
                    accessibilityLabel={`${settled.length} members settled up`}
                  >
                    <View style={styles.facepile}>
                      {settled.slice(0, 3).map((m, i) => (
                        <View
                          key={keyOf(m, i)}
                          style={i > 0 && styles.faceOverlap}
                        >
                          <MemberAvatar
                            name={m.name}
                            avatarUrl={m.avatarUrl}
                            size={scale(24)}
                            ringColor={colors.card}
                          />
                        </View>
                      ))}
                    </View>
                    <Text style={styles.clusterLabel}>
                      {showSettled
                        ? "Hide settled"
                        : `${settled.length} settled up`}
                    </Text>
                    <Animated.View style={settledChevronStyle}>
                      <Feather
                        name="chevron-down"
                        size={scale(15)}
                        color={colors.text3}
                      />
                    </Animated.View>
                  </Pressable>

                  {showSettled &&
                    settled.map((m, i) => (
                      <Animated.View
                        key={keyOf(m, i)}
                        entering={
                          reducedMotion
                            ? undefined
                            : FadeInDown.duration(220).delay(i * 24)
                        }
                      >
                        <MemberBalanceRow
                          member={m}
                          currencySymbol={currencySymbol}
                          onPress={onMemberPress}
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
    heroSymbol: {
      fontFamily: FONTS.medium,
      fontSize: scale(15),
      color: colors.text2,
      marginRight: scale(3),
      paddingBottom: scale(4),
      includeFontPadding: false,
    },
    heroInt: {
      fontFamily: FONTS.bold,
      fontSize: scale(27),
      lineHeight: scale(32),
      letterSpacing: scale(-0.3),
      color: colors.text,
      flexShrink: 1,
      includeFontPadding: false,
    },
    heroDec: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text3,
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

    /* all-settled hero */
    settledHero: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.md,
    },
    settledBadge: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.income.bg,
      alignItems: "center",
      justifyContent: "center",
    },
    settledHeroText: {
      flex: 1,
    },
    settledTitle: {
      fontFamily: FONTS.medium,
      fontSize: scale(16),
      color: colors.text,
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
      paddingTop: Dimens.xs,
      paddingBottom: Dimens.sm,
    },

    /* settled cluster */
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

    /* empty */
    emptyText: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text3,
      marginTop: Dimens.sm,
      lineHeight: scale(19),
    },
  });

export default MemberBalances;
