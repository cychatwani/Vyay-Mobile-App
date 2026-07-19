import MainHeaderBar from "@/components/MainHeaderBar";
import { isSettled } from "@/components/custom/MemberBalances/balanceUtils";
import SafeView from "@/components/custom/SafeView/SafeView";
import FriendListItem, {
  FRIEND_ROW_HEIGHT,
} from "@/components/lists/FriendListItem";
import InfoBanner from "@/components/lists/InfoBanner";
import ListScreenHeader from "@/components/lists/ListScreenHeader";
import { MOCK_FRIENDS } from "@/components/lists/mockData";
import type { FriendListItemData } from "@/components/lists/types";
import { Dimens } from "@/constants/Dimes";
import { useColorsV2 } from "@/store/themeStore";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";

/**
 * Contacts — a shortcut into each private 1:1 expense group.
 *
 * Balances never exist directly between two people in Vyay — they live in
 * groups. Each contact row previews the balance of the two-member
 * INDIVIDUAL group shared with that friend (opening it will land in that
 * group), and an info note above the list makes the scope explicit.
 * Quiet full-bleed rows with hairline seams; settled contacts go quiet so
 * unfinished business surfaces first. Pure UI: mock data only.
 */
export default function FriendListScreen() {
  const colors = useColorsV2();

  const oweYou = MOCK_FRIENDS.filter((f) => f.balance > 0 && !isSettled(f.balance)).length;
  const youOwe = MOCK_FRIENDS.filter((f) => f.balance < 0 && !isSettled(f.balance)).length;

  const renderItem = ({ item }: { item: FriendListItemData }) => (
    <FriendListItem friend={item} />
  );

  return (
    <SafeView
      style={{ flex: 1, backgroundColor: colors.page }}
      statusBarColor={colors.page}
      statusBarStyle="dark-content"
    >
      <MainHeaderBar />

      <FlashList
        data={MOCK_FRIENDS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={FRIEND_ROW_HEIGHT}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <ListScreenHeader
              title="Contacts"
              subtitle={`${MOCK_FRIENDS.length} contacts · ${oweYou} owe you · ${youOwe} you owe`}
            />
            <View style={styles.bannerWrap}>
              <InfoBanner text="Balances shown here are only from your private 1:1 expenses with each friend. Shared group expenses appear inside their respective groups." />
            </View>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: colors.divider }]}
          />
        )}
        contentContainerStyle={{ paddingBottom: Dimens.vXl }}
      />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    // Seam starts where the text starts: gutter + avatar + row gap.
    marginLeft: Dimens.screenH + scale(44) + Dimens.md,
    marginRight: Dimens.screenH,
  },
  bannerWrap: {
    paddingHorizontal: Dimens.screenH,
    paddingBottom: Dimens.vMd,
  },
});
