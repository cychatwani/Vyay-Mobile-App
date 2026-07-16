import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import DayHeader from "./DayHeader";
import ExpenseCard from "./ExpenseCard";
import GroupEventRow from "./GroupEventRow";
import MessageBubble from "./MessageBubble";
import SettlementCard from "./SettlementCard";
import { buildTimelineRows, isViewer } from "./timelineUtils";
import type {
  ExpenseEvent,
  SettlementEvent,
  TimelineItem,
  TimelineRow,
} from "./types";

interface GroupTimelineProps {
  items: TimelineItem[];
  currentUserId: string | number;
  /** Navigation hooks — wired to the expense/settlement screens later. */
  onOpenExpense?: (event: ExpenseEvent) => void;
  onOpenSettlement?: (event: SettlementEvent) => void;
}

/**
 * The Group Activity Timeline: money, conversation and group life in one
 * chronological stream. There are no tabs to switch — three interaction
 * models simply coexist, each at its own volume:
 *
 *   financial cards → full-width, elevated, expandable (loud)
 *   chat bubbles    → half-width, left/right, familiar   (conversational)
 *   group events    → centered muted one-liners          (whisper)
 *
 * Rendering: one inverted FlashList (newest at the bottom, chat-style —
 * ready for the composer that will be pinned beneath it). Each row kind
 * gets its own recycling pool via getItemType, rows are memoized, and
 * card expansion is owned HERE — recycled components can never leak an
 * open accordion onto the wrong event.
 */
const GroupTimeline = ({
  items,
  currentUserId,
  onOpenExpense,
  onOpenSettlement,
}: GroupTimelineProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const rows = useMemo(() => buildTimelineRows(items), [items]);

  // Which financial cards are open. Lives on the list, not in the cards,
  // because FlashList recycles component instances.
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const renderRow = useCallback(
    ({ item: row }: ListRenderItemInfo<TimelineRow>) => {
      switch (row.type) {
        case "day":
          return <DayHeader label={row.label} />;
        case "expense":
          return (
            <ExpenseCard
              event={row.event}
              currentUserId={currentUserId}
              expanded={expandedIds.has(row.event.id)}
              onToggle={toggleExpanded}
              onOpenDetails={onOpenExpense}
            />
          );
        case "settlement":
          return (
            <SettlementCard
              event={row.event}
              currentUserId={currentUserId}
              expanded={expandedIds.has(row.event.id)}
              onToggle={toggleExpanded}
              onOpenDetails={onOpenSettlement}
            />
          );
        case "message":
          return (
            <MessageBubble
              event={row.event}
              run={row.run}
              isMine={isViewer(row.event.sender, currentUserId)}
            />
          );
        case "groupEvent":
          return (
            <GroupEventRow event={row.event} currentUserId={currentUserId} />
          );
      }
    },
    [
      currentUserId,
      expandedIds,
      toggleExpanded,
      onOpenExpense,
      onOpenSettlement,
    ],
  );

  if (rows.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyBadge}>
          <Feather name="message-circle" size={scale(20)} color={colors.brandText} />
        </View>
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptyText}>
          Expenses, settlements and messages will all show up here, in order.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={rows}
      renderItem={renderRow}
      keyExtractor={(row) => row.key}
      getItemType={(row) => row.type}
      estimatedItemSize={scale(72)}
      inverted
      // Toggling expansion must reach already-mounted (recycled) rows.
      extraData={expandedIds}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    />
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: Dimens.lg,
      paddingVertical: Dimens.md,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Dimens.xxl,
      gap: Dimens.sm,
    },
    emptyBadge: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      backgroundColor: colors.brandSubtle,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Dimens.xs,
    },
    emptyTitle: {
      fontFamily: FONTS.medium,
      fontSize: scale(15),
      color: colors.text,
      includeFontPadding: false,
    },
    emptyText: {
      fontFamily: FONTS.regular,
      fontSize: scale(12.5),
      lineHeight: scale(18),
      color: colors.text3,
      textAlign: "center",
      includeFontPadding: false,
    },
  });

export default GroupTimeline;
