import ActionFilterChips, {
  ActionFilterChip,
} from "@/components/custom/ActionFilterChips/ActionFilterChips";
import CustomHeader from "@/components/custom/CustomHeader";
import GenericTabSwitcher, {
  TabConfig,
} from "@/components/custom/GenericTabSwitcher/GenericTabSwitcher";
import GroupTimeline from "@/components/custom/GroupTimeline/GroupTimeline";
import MemberBalances from "@/components/custom/MemberBalances/MemberBalances";
import type { MemberBalance } from "@/components/custom/MemberBalances/types";
import SafeView from "@/components/custom/SafeView/SafeView";
import SettlementSuggestions from "@/components/custom/SettlementSuggestions/SettlementSuggestions";
import type { SettlementSuggestion } from "@/components/custom/SettlementSuggestions/types";
import { Dimens } from "@/constants/Dimes";
import { useColors } from "@/store/themeStore";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import GroupPhotoDisplay from "./GroupPhotoDisplay";
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

/** Raw pairwise debts before simplification — the API sends this for real groups. */
const DEMO_ORIGINAL_DEBT_COUNT = 74;

export default function GroupDetail() {
  const colors = useColors();
  const [selectedRange, setSelectedRange] = useState<DateRangeId>("1w");
  const [status, setStatus] = useState<StatusId>("all");

  type GroupDetailTab = "activity" | "balances" | "totals" | "info";
  const [activeTab, setActiveTab] = useState<GroupDetailTab>("activity");

  const groupDetailTabs: TabConfig<GroupDetailTab>[] = [
    { value: "activity", label: "Activity", icon: "clock" },
    { value: "balances", label: "Balances", icon: "pie-chart" },
    { value: "totals", label: "Totals", icon: "dollar-sign" },
  ];

  type StatusId =
    | "all"
    | "pending"
    | "needs_review"
    | "expenses"
    | "settlements";

  type DateRangeId = "1d" | "1w" | "4w" | "3m" | "1y" | "all";

  const DATE_RANGE_OPTIONS: readonly ActionFilterChip<DateRangeId>[] = [
    { id: "1d", label: "1D" },
    { id: "1w", label: "1W" },
    { id: "4w", label: "4W" },
    { id: "3m", label: "3M" },
    { id: "1y", label: "1Y" },
    { id: "all", label: "All" },
  ];

  const STATUS_OPTIONS: readonly ActionFilterChip<StatusId>[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending", span: 2 },
    { id: "needs_review", label: "Needs Review", span: 3 },
    { id: "expenses", label: "Expenses", span: 2 },
    { id: "settlements", label: "Settlements", span: 3 },
  ];

  return (
    <SafeView
      style={{ flex: 1, backgroundColor: colors.background }}
      statusBarColor={colors.background}
      statusBarStyle="dark-content"
    >
      <CustomHeader title="Goa Trip 2024" />

      {/* Center only the photo */}
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GroupPhotoDisplay src="https://picsum.photos/200" />
      </View>

      {/* Tab switcher */}
      <GenericTabSwitcher
        tabs={groupDetailTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="unified"
      />

      {/* Content based on active tab. The Activity timeline manages its own
          gutters (its FlashList scrolls edge to edge, and a composer will be
          pinned under it later), so the wrapper padding only applies to the
          other tabs. */}
      <View style={{ flex: 1, padding: activeTab === "activity" ? 0 : 16 }}>
        {activeTab === "activity" && (
          <GroupTimeline
            items={MOCK_TIMELINE}
            currentUserId={DEMO_CURRENT_USER_ID}
          />
        )}
        {activeTab === "balances" && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32, gap: Dimens.md }}
            showsVerticalScrollIndicator={false}
          >
            <MemberBalances members={MOCK_MEMBER_BALANCES} />
            <SettlementSuggestions
              suggestions={MOCK_SETTLEMENT_PLAN}
              currentUserId={DEMO_CURRENT_USER_ID}
              originalDebtCount={DEMO_ORIGINAL_DEBT_COUNT}
            />
          </ScrollView>
        )}
        {activeTab === "totals" && (
          <ActionFilterChips
            items={DATE_RANGE_OPTIONS}
            value={selectedRange}
            onChange={setSelectedRange}
            variant="cards"
          />
        )}
        {activeTab === "info" && (
          <Text style={{ color: colors.textPrimary }}>Group Info</Text>
        )}
      </View>
    </SafeView>
  );
}
