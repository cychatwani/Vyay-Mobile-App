import { StyleSheet } from "react-native";

import SafeView from "@/components/custom/SafeView/SafeView";
import BalanceWidget from "@/components/home/BalanceWidget";
import Greetings from "@/components/home/Greetings";
import MainHeaderBar from "@/components/MainHeaderBar";
import RecentExpensesWidget from "@/components/home/RecentExpensesWidget";
import { useColors } from "@/store/themeStore";
import ExpenseByCategoryWidget from "@/components/home/ExpenseByCategoryWidget";
import { Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import AddeExpenseFAB from "@/components/home/AddeExpenseFAB";

export default function HomeScreen() {
  const colors = useColors();

  return (
    <SafeView
      style={{ flex: 1, backgroundColor: colors.background }}
      statusBarColor={colors.background}
      statusBarStyle="dark-content"
    >
      <MainHeaderBar />
      <Greetings />
      <BalanceWidget />
      <RecentExpensesWidget />
      <ExpenseByCategoryWidget />
      <View style={{position: "absolute", bottom: scale(25), right: scale(20)}}>
        <AddeExpenseFAB />
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
