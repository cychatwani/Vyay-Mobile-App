import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ScrollView, StyleSheet, View } from "react-native";

import { logout } from "@/auth/coreAuth";
import NameCard from "@/components/account/_NameCard";
import IdentityCard from "@/components/account/IdentityCard";
import LogoutButton from "@/components/account/LogoutButton";
import SettingsLink from "@/components/account/SettingsLink";
import SafeView from "@/components/custom/SafeView/SafeView";
import MainHeaderBar from "@/components/MainHeaderBar";
import { Dimens } from "@/constants/Dimes";
import { useColorsV2 } from "@/store/themeStore";
import { verticalScale } from "react-native-size-matters";

const account = () => {
  const colors = useColorsV2();

  return (
    <BottomSheetModalProvider>
      <SafeView
        style={{ flex: 1, backgroundColor: colors.page }}
        statusBarColor={colors.page}
        statusBarStyle="dark-content"
      >
        <MainHeaderBar />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <NameCard />

          <View style={styles.gap}>
            <IdentityCard />
          </View>

          <View style={styles.gap}>
            <SettingsLink />
          </View>

          <View style={styles.gap}>
            <LogoutButton onPress={logout} />
          </View>
        </ScrollView>
      </SafeView>
    </BottomSheetModalProvider>
  );
};

export default account;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Dimens.sm,
    paddingTop: Dimens.vMd,
    paddingBottom: verticalScale(120),
  },
  gap: {
    marginTop: Dimens.vLg,
  },
});
