import CustomHeader from "@/components/custom/CustomHeader";
import GenericTabSwitcher, {
  TabConfig,
} from "@/components/custom/GenericTabSwitcher/GenericTabSwitcher";
import GroupBottomComposer from "@/components/custom/GroupComposer/GroupBottomComposer";
import GroupHeaderIdentity from "@/components/custom/GroupHeader/GroupHeaderIdentity";
import GroupTimeline from "@/components/custom/GroupTimeline/GroupTimeline";
import type {
  MessageEvent,
  TimelineActor,
  TimelineItem,
} from "@/components/custom/GroupTimeline/types";
import HistoricalTotalsCard from "@/components/custom/GroupTotals/HistoricalTotalsCard";
import HistoricalTotalsSheet, {
  HISTORICAL_TOTALS_SNAP,
  type PeriodTotal,
} from "@/components/custom/GroupTotals/HistoricalTotalsSheet";
import MemberBalances from "@/components/custom/MemberBalances/MemberBalances";
import type { MemberBalance } from "@/components/custom/MemberBalances/types";
import SafeView from "@/components/custom/SafeView/SafeView";
import SettlementSuggestions from "@/components/custom/SettlementSuggestions/SettlementSuggestions";
import type { SettlementSuggestion } from "@/components/custom/SettlementSuggestions/types";
import { Dimens } from "@/constants/Dimes";
import { openSheet } from "@/store/sheetStore";
import { useColors } from "@/store/themeStore";
import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { MOCK_TIMELINE } from "./mockTimeline";

/* ------------------------------------------------------------------ *
 * Placeholder data until the group API is wired in.
 * ------------------------------------------------------------------ */

const MOCK_MEMBER_BALANCES: MemberBalance[] = [
  {
    id: "u1",
    name: "Andrew Ainsley",
    amount: 6420.5,
    avatarUrl: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "u2",
    name: "Charlotte Hanlin",
    amount: -728.5,
    avatarUrl: "https://i.pravatar.cc/150?img=47",
  },
  { id: "u3", name: "Darron Kulikowski", amount: -586.5 },
  {
    id: "u4",
    name: "Kristin Watson",
    amount: 586.5,
    avatarUrl: "https://i.pravatar.cc/150?img=32",
  },
  { id: "u5", name: "Joseph Thomas", amount: 728.5 },
  {
    id: "u6",
    name: "Maryland Winkles",
    amount: -6420.5,
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "u7",
    name: "Priya Sharma",
    amount: 0,
    avatarUrl: "https://i.pravatar.cc/150?img=45",
  },
  { id: "u8", name: "Rahul Mehta", amount: 0 },
  {
    id: "u9",
    name: "Neha Kapoor",
    amount: 1250.75,
    avatarUrl: "https://i.pravatar.cc/150?img=25",
  },
  { id: "u10", name: "Vikram Singh", amount: -1250.75 },

  {
    id: "u11",
    name: "Aarav Patel",
    amount: 3450.25,
    avatarUrl: "https://i.pravatar.cc/150?img=11",
  },
  { id: "u12", name: "Ananya Gupta", amount: -1890.0 },
  {
    id: "u13",
    name: "Rohan Desai",
    amount: 875.5,
    avatarUrl: "https://i.pravatar.cc/150?img=13",
  },
  { id: "u14", name: "Sneha Iyer", amount: -245.75 },
  {
    id: "u15",
    name: "Kabir Malhotra",
    amount: 0,
    avatarUrl: "https://i.pravatar.cc/150?img=15",
  },
  { id: "u16", name: "Ishita Verma", amount: 5420.0 },
  {
    id: "u17",
    name: "Aditya Rao",
    amount: -3780.5,
    avatarUrl: "https://i.pravatar.cc/150?img=17",
  },
  { id: "u18", name: "Meera Nair", amount: 920.25 },
  {
    id: "u19",
    name: "Arjun Joshi",
    amount: -620.0,
    avatarUrl: "https://i.pravatar.cc/150?img=19",
  },
  { id: "u20", name: "Simran Kaur", amount: 1380.75 },

  { id: "u21", name: "Yash Shah", amount: -4520.0 },
  {
    id: "u22",
    name: "Pooja Bhatia",
    amount: 0,
    avatarUrl: "https://i.pravatar.cc/150?img=22",
  },
  { id: "u23", name: "Harsh Mehta", amount: 2685.5 },
  {
    id: "u24",
    name: "Nisha Reddy",
    amount: -1585.75,
    avatarUrl: "https://i.pravatar.cc/150?img=24",
  },
  { id: "u25", name: "Karan Khanna", amount: 312.5 },
  { id: "u26", name: "Divya Menon", amount: -980.25 },
  {
    id: "u27",
    name: "Aman Choudhary",
    amount: 7560.0,
    avatarUrl: "https://i.pravatar.cc/150?img=27",
  },
  { id: "u28", name: "Ritika Sinha", amount: -4425.5 },
  {
    id: "u29",
    name: "Siddharth Jain",
    amount: 0,
    avatarUrl: "https://i.pravatar.cc/150?img=29",
  },
  { id: "u30", name: "Tanvi Kulkarni", amount: 1540.25 },

  { id: "u31", name: "Nikhil Arora", amount: -765.0 },
  {
    id: "u32",
    name: "Aisha Khan",
    amount: 420.5,
    avatarUrl: "https://i.pravatar.cc/150?img=33",
  },
  { id: "u33", name: "Ritesh Agarwal", amount: -2150.75 },
  { id: "u34", name: "Bhavna Kapoor", amount: 1895.0 },
  { id: "u35", name: "Manav Goel", amount: 0 },
  {
    id: "u36",
    name: "Kriti Arora",
    amount: -550.5,
    avatarUrl: "https://i.pravatar.cc/150?img=36",
  },
  { id: "u37", name: "Varun Bansal", amount: 6840.0 },
  { id: "u38", name: "Sanya Chopra", amount: -3120.25 },
  {
    id: "u39",
    name: "Dev Mishra",
    amount: 995.0,
    avatarUrl: "https://i.pravatar.cc/150?img=39",
  },
  { id: "u40", name: "Nandini Das", amount: -85.5 },

  { id: "u41", name: "Om Prakash", amount: 215.25 },
  {
    id: "u42",
    name: "Kavya Rao",
    amount: -1240.0,
    avatarUrl: "https://i.pravatar.cc/150?img=42",
  },
  { id: "u43", name: "Raghav Bedi", amount: 3485.75 },
  { id: "u44", name: "Shreya Pillai", amount: -2675.25 },
  {
    id: "u45",
    name: "Aditi Sharma",
    amount: 0,
    avatarUrl: "https://i.pravatar.cc/150?img=44",
  },
  { id: "u46", name: "Mohit Saxena", amount: 810.5 },
  {
    id: "u47",
    name: "Riya Chawla",
    amount: -920.75,
    avatarUrl: "https://i.pravatar.cc/150?img=46",
  },
  { id: "u48", name: "Saurabh Tiwari", amount: 5725.0 },
  { id: "u49", name: "Anjali Bhardwaj", amount: -4895.5 },
  {
    id: "u50",
    name: "Keshav Dubey",
    amount: 145.0,
    avatarUrl: "https://i.pravatar.cc/150?img=50",
  },
];

/**
 * Preview plan derived from the balances above so the two cards always agree.
 * Real groups render the server-computed plan instead.
 */
// Mock of the backend's optimized settlement plan for this group — the
// server-side debt-simplification output, in the API's flat shape. The
// frontend never computes this; it only organizes and renders it.
const MOCK_SETTLEMENT_PLAN: SettlementSuggestion[] = [
  {
    id: "st01",
    fromUser: { id: "u6", name: "Maryland Winkles" },
    toUser: { id: "u27", name: "Aman Choudhary" },
    amount: 6420.5,
    currency: "INR",
  },
  {
    id: "st02",
    fromUser: { id: "u49", name: "Anjali Bhardwaj" },
    toUser: { id: "u27", name: "Aman Choudhary" },
    amount: 1139.5,
    currency: "INR",
  },
  {
    id: "st03",
    fromUser: { id: "u49", name: "Anjali Bhardwaj" },
    toUser: { id: "u37", name: "Varun Bansal" },
    amount: 3756,
    currency: "INR",
  },
  {
    id: "st04",
    fromUser: { id: "u21", name: "Yash Shah" },
    toUser: { id: "u37", name: "Varun Bansal" },
    amount: 3084,
    currency: "INR",
  },
  {
    id: "st05",
    fromUser: { id: "u21", name: "Yash Shah" },
    toUser: { id: "u1", name: "Andrew Ainsley" },
    amount: 1436,
    currency: "INR",
  },
  {
    id: "st06",
    fromUser: { id: "u28", name: "Ritika Sinha" },
    toUser: { id: "u1", name: "Andrew Ainsley" },
    amount: 4425.5,
    currency: "INR",
  },
  {
    id: "st07",
    fromUser: { id: "u17", name: "Aditya Rao" },
    toUser: { id: "u1", name: "Andrew Ainsley" },
    amount: 559,
    currency: "INR",
  },
  {
    id: "st08",
    fromUser: { id: "u17", name: "Aditya Rao" },
    toUser: { id: "u48", name: "Saurabh Tiwari" },
    amount: 3221.5,
    currency: "INR",
  },
  {
    id: "st09",
    fromUser: { id: "u38", name: "Sanya Chopra" },
    toUser: { id: "u48", name: "Saurabh Tiwari" },
    amount: 2503.5,
    currency: "INR",
  },
  {
    id: "st10",
    fromUser: { id: "u38", name: "Sanya Chopra" },
    toUser: { id: "u16", name: "Ishita Verma" },
    amount: 616.75,
    currency: "INR",
  },
  {
    id: "st11",
    fromUser: { id: "u44", name: "Shreya Pillai" },
    toUser: { id: "u16", name: "Ishita Verma" },
    amount: 2675.25,
    currency: "INR",
  },
  {
    id: "st12",
    fromUser: { id: "u33", name: "Ritesh Agarwal" },
    toUser: { id: "u16", name: "Ishita Verma" },
    amount: 2128,
    currency: "INR",
  },
  {
    id: "st13",
    fromUser: { id: "u33", name: "Ritesh Agarwal" },
    toUser: { id: "u43", name: "Raghav Bedi" },
    amount: 22.75,
    currency: "INR",
  },
  {
    id: "st14",
    fromUser: { id: "u12", name: "Ananya Gupta" },
    toUser: { id: "u43", name: "Raghav Bedi" },
    amount: 1890,
    currency: "INR",
  },
  {
    id: "st15",
    fromUser: { id: "u24", name: "Nisha Reddy" },
    toUser: { id: "u43", name: "Raghav Bedi" },
    amount: 1573,
    currency: "INR",
  },
  {
    id: "st16",
    fromUser: { id: "u24", name: "Nisha Reddy" },
    toUser: { id: "u11", name: "Aarav Patel" },
    amount: 12.75,
    currency: "INR",
  },
  {
    id: "st17",
    fromUser: { id: "u10", name: "Vikram Singh" },
    toUser: { id: "u11", name: "Aarav Patel" },
    amount: 1250.75,
    currency: "INR",
  },
  {
    id: "st18",
    fromUser: { id: "u42", name: "Kavya Rao" },
    toUser: { id: "u11", name: "Aarav Patel" },
    amount: 1240,
    currency: "INR",
  },
  {
    id: "st19",
    fromUser: { id: "u26", name: "Divya Menon" },
    toUser: { id: "u11", name: "Aarav Patel" },
    amount: 946.75,
    currency: "INR",
  },
  {
    id: "st20",
    fromUser: { id: "u26", name: "Divya Menon" },
    toUser: { id: "u23", name: "Harsh Mehta" },
    amount: 33.5,
    currency: "INR",
  },
  {
    id: "st21",
    fromUser: { id: "u47", name: "Riya Chawla" },
    toUser: { id: "u23", name: "Harsh Mehta" },
    amount: 920.75,
    currency: "INR",
  },
  {
    id: "st22",
    fromUser: { id: "u31", name: "Nikhil Arora" },
    toUser: { id: "u23", name: "Harsh Mehta" },
    amount: 765,
    currency: "INR",
  },
  {
    id: "st23",
    fromUser: { id: "u2", name: "Charlotte Hanlin" },
    toUser: { id: "u23", name: "Harsh Mehta" },
    amount: 728.5,
    currency: "INR",
  },
  {
    id: "st24",
    fromUser: { id: "u19", name: "Arjun Joshi" },
    toUser: { id: "u23", name: "Harsh Mehta" },
    amount: 237.75,
    currency: "INR",
  },
  {
    id: "st25",
    fromUser: { id: "u19", name: "Arjun Joshi" },
    toUser: { id: "u34", name: "Bhavna Kapoor" },
    amount: 382.25,
    currency: "INR",
  },
  {
    id: "st26",
    fromUser: { id: "u3", name: "Darron Kulikowski" },
    toUser: { id: "u34", name: "Bhavna Kapoor" },
    amount: 586.5,
    currency: "INR",
  },
  {
    id: "st27",
    fromUser: { id: "u36", name: "Kriti Arora" },
    toUser: { id: "u34", name: "Bhavna Kapoor" },
    amount: 550.5,
    currency: "INR",
  },
  {
    id: "st28",
    fromUser: { id: "u14", name: "Sneha Iyer" },
    toUser: { id: "u34", name: "Bhavna Kapoor" },
    amount: 245.75,
    currency: "INR",
  },
  {
    id: "st29",
    fromUser: { id: "u40", name: "Nandini Das" },
    toUser: { id: "u34", name: "Bhavna Kapoor" },
    amount: 85.5,
    currency: "INR",
  },
];

/** Charlotte Hanlin — stand-in viewer until membership comes from the API. */
const DEMO_CURRENT_USER_ID = "u2";

/** Same person as an actor, so locally-sent comments render as "You". */
const DEMO_CURRENT_USER: TimelineActor = {
  id: DEMO_CURRENT_USER_ID,
  name: "Charlotte Hanlin",
  avatarUrl: "https://i.pravatar.cc/150?img=47",
};

/** Raw pairwise debts before simplification — the API sends this for real groups. */
const DEMO_ORIGINAL_DEBT_COUNT = 74;

/** Stand-in historical spend until the totals API is wired in. */
const DEMO_HISTORICAL_GRAND_TOTAL = 184320.75;
const DEMO_HISTORICAL_PERIODS: readonly PeriodTotal[] = [
  { id: "p-thismonth", label: "This month", amount: 21450.0 },
  { id: "p-lastmonth", label: "Last month", amount: 38975.5 },
  { id: "p-2024-q1", label: "Jan – Mar 2024", amount: 62890.25 },
  { id: "p-2023-q4", label: "Oct – Dec 2023", amount: 41005.0 },
  { id: "p-older", label: "Before Oct 2023", amount: 20000.0 },
];

export default function GroupDetail() {
  const colors = useColors();

  type GroupDetailTab = "activity" | "balances" | "info";
  const [activeTab, setActiveTab] = useState<GroupDetailTab>("activity");

  // Timeline is state (not the raw mock) so comments sent from the
  // composer land in the stream immediately. The API swaps in here later.
  const [timeline, setTimeline] = useState<TimelineItem[]>(MOCK_TIMELINE);

  // Tabs recede as the timeline is scrolled: full opacity at the top,
  // easing down to a quiet background level once the user scrolls in.
  const tabsOpacity = useSharedValue(1);
  const wasScrolled = useRef(false);

  const handleTimelineScroll = useCallback(
    (offsetY: number) => {
      // Inverted list: offset grows as you move into history. Cross a small
      // threshold and the tabs settle back; return near the top and they
      // come forward again. The ref gates the animation so we only spring
      // on an actual state change, not every scroll frame.
      const scrolled = offsetY > 24;
      if (scrolled !== wasScrolled.current) {
        wasScrolled.current = scrolled;
        tabsOpacity.value = withTiming(scrolled ? 0.45 : 1, {
          duration: 220,
        });
      }
    },
    [tabsOpacity],
  );

  const handleSendComment = useCallback((text: string) => {
    const message: MessageEvent = {
      kind: "message",
      id: `local-${Date.now()}`,
      createdAt: Date.now(),
      sender: DEMO_CURRENT_USER,
      text,
    };
    setTimeline((prev) => [...prev, message]);
  }, []);

  const handleAddExpense = useCallback(() => {
    // TODO: navigate to the add-expense flow once that screen exists.
    console.log("Add Expense selected");
  }, []);

  const handleRecordSettlement = useCallback(() => {
    // TODO: navigate to the record-settlement flow once that screen exists.
    console.log("Record Settlement selected");
  }, []);

  const handleOpenGroupInfo = useCallback(() => {
    // TODO: navigate to the group info screen once it exists.
    console.log("Group header pressed — group info screen comes later");
  }, []);

  const handleOpenHistoricalTotals = useCallback(() => {
    openSheet(
      <HistoricalTotalsSheet
        grandTotal={DEMO_HISTORICAL_GRAND_TOTAL}
        periods={DEMO_HISTORICAL_PERIODS}
      />,
      { snapPoints: [HISTORICAL_TOTALS_SNAP] },
    );
  }, []);

  const groupDetailTabs: TabConfig<GroupDetailTab>[] = [
    { value: "activity", label: "Activity", icon: "clock" },
    { value: "balances", label: "Balances", icon: "pie-chart" },
  ];

  return (
    <SafeView
      style={{ flex: 1, backgroundColor: colors.background }}
      statusBarColor={colors.background}
      statusBarStyle="dark-content"
    >
      {/* The group's identity lives in the top bar now (photo · name ·
          member count, one press target) — the old hero photo is gone and
          the timeline gets the reclaimed half-screen. */}
      <CustomHeader
        centerContent={
          <GroupHeaderIdentity
            name="Goa Trip 2024"
            memberCount={MOCK_MEMBER_BALANCES.length}
            photoUrl="https://picsum.photos/200"
            onPress={handleOpenGroupInfo}
          />
        }
      />

      {/* Tabs sit directly under the top bar — compact so they stay quiet,
          and they fade back while the timeline is scrolled. */}
      <GenericTabSwitcher
        tabs={groupDetailTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="separated"
      />

      {/* Content based on active tab. The Activity timeline manages its own
          gutters (its FlashList scrolls edge to edge, and the composer is
          pinned under it, outside the scroll), so the wrapper padding only
          applies to the other tabs. */}
      <View style={{ flex: 1, padding: activeTab === "activity" ? 0 : 16 }}>
        {activeTab === "activity" && (
          // iOS needs the padding behavior for the composer to ride the
          // keyboard; Android already resizes the window (adjustResize).
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <GroupTimeline
              items={timeline}
              currentUserId={DEMO_CURRENT_USER_ID}
              onScrollOffsetChange={handleTimelineScroll}
            />
            <GroupBottomComposer
              onSendComment={handleSendComment}
              onAddExpense={handleAddExpense}
              onRecordSettlement={handleRecordSettlement}
            />
          </KeyboardAvoidingView>
        )}
        {activeTab === "balances" && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32, gap: Dimens.md }}
            showsVerticalScrollIndicator={false}
          >
            <HistoricalTotalsCard
              grandTotal={DEMO_HISTORICAL_GRAND_TOTAL}
              onPress={handleOpenHistoricalTotals}
            />
            <MemberBalances members={MOCK_MEMBER_BALANCES} />
            <SettlementSuggestions
              suggestions={MOCK_SETTLEMENT_PLAN}
              currentUserId={DEMO_CURRENT_USER_ID}
              originalDebtCount={DEMO_ORIGINAL_DEBT_COUNT}
            />
          </ScrollView>
        )}
        {activeTab === "info" && (
          <Text style={{ color: colors.textPrimary }}>Group Info</Text>
        )}
      </View>
    </SafeView>
  );
}
