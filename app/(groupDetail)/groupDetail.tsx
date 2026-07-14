import CustomHeader from "@/components/custom/CustomHeader";
import ExpenseGraph from "@/components/custom/ExpenseGraph/ExpenseGraph";
import GenericTabSwitcher, {
  TabConfig,
} from "@/components/custom/GenericTabSwitcher/GenericTabSwitcher";
import SafeView from "@/components/custom/SafeView/SafeView";
import { useColors } from "@/store/themeStore";
import { useState } from "react";
import { Text, View } from "react-native";
import GroupPhotoDisplay from "./GroupPhotoDisplay";

export default function GroupDetail() {
  const colors = useColors();

  type GroupDetailTab = "activity" | "balances" | "totals" | "info";
  const [activeTab, setActiveTab] = useState<GroupDetailTab>("activity");

  const groupDetailTabs: TabConfig<GroupDetailTab>[] = [
    { value: "activity", label: "Activity", icon: "clock" },
    { value: "balances", label: "Balances", icon: "pie-chart" },
    { value: "totals", label: "Totals", icon: "dollar-sign" },
  ];

  const balanceData = [
    { name: "Andrew Ainsley", amount: 6420.5 },
    { name: "Charlotte Hanlin", amount: -728.5 },
    { name: "Darron Kulikowski", amount: -586.5 },
    { name: "Kristin Watson", amount: 586.5 },
    { name: "Joseph Thomas", amount: 728.5 },
    { name: "Maryland Winkles", amount: -6420.5 },
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

      {/* Content based on active tab */}
      <View style={{ flex: 1, padding: 16 }}>
        {activeTab === "expenses" && (
          <Text style={{ color: colors.textPrimary }}>expenses</Text>
        )}
        {activeTab === "balances" && <ExpenseGraph expenses={balanceData} />}
        {activeTab === "totals" && (
          <Text style={{ color: colors.textPrimary }}>Totals & Stats</Text>
        )}
        {activeTab === "info" && (
          <Text style={{ color: colors.textPrimary }}>Group Info</Text>
        )}
      </View>
    </SafeView>
  );
}
