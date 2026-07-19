import MainHeaderBar from "@/components/MainHeaderBar";
import { isSettled } from "@/components/custom/MemberBalances/balanceUtils";
import SafeView from "@/components/custom/SafeView/SafeView";
import GroupListItem, {
  GROUP_CARD_HEIGHT,
} from "@/components/lists/GroupListItem";
import ListScreenHeader from "@/components/lists/ListScreenHeader";
import { MOCK_GROUPS } from "@/components/lists/mockData";
import type { GroupListItemData } from "@/components/lists/types";
import { Dimens } from "@/constants/Dimes";
import { useColorsV2 } from "@/store/themeStore";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { View } from "react-native";

/**
 * Groups — every shared ledger at a glance.
 *
 * Groups render as compact cards (money lives in cards throughout the app)
 * on the page surface, each answering three questions in reading order:
 * which group, what's my position, what happened last. Settled groups go
 * visibly quiet — muted name + emerald "Settled ✓" pill — so the groups
 * that still need attention pull the eye first. Pure UI: mock data only.
 */
export default function GroupListScreen() {
  const colors = useColorsV2();

  const activeCount = MOCK_GROUPS.filter((g) => !isSettled(g.balance)).length;
  const settledCount = MOCK_GROUPS.length - activeCount;

  // TODO: pass the pressed group's id/data through once group detail reads
  // real data instead of mocks — for now every card opens the same screen.
  const handlePressGroup = useCallback(() => {
    router.push("/(groupDetail)/groupDetail");
  }, []);

  const renderItem = ({ item }: { item: GroupListItemData }) => (
    <GroupListItem group={item} onPress={handlePressGroup} />
  );

  return (
    <SafeView
      style={{ flex: 1, backgroundColor: colors.page }}
      statusBarColor={colors.page}
      statusBarStyle="dark-content"
    >
      <MainHeaderBar />

      <FlashList
        data={MOCK_GROUPS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={GROUP_CARD_HEIGHT}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ListScreenHeader
            flush
            title="Groups"
            subtitle={`${MOCK_GROUPS.length} groups · ${activeCount} unsettled · ${settledCount} settled`}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: Dimens.md }} />}
        contentContainerStyle={{
          paddingHorizontal: Dimens.screenH,
          paddingBottom: Dimens.vXl,
        }}
      />
    </SafeView>
  );
}
