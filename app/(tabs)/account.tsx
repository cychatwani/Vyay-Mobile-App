import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";

import { logout } from "@/auth/coreAuth";
import NameCard from "@/components/account/_NameCard";
import IdentityCard from "@/components/account/IdentityCard";
import LogoutButton from "@/components/account/LogoutButton";
import LogoutConfirmSheet from "@/components/account/LogoutConfirmSheet";
import SettingsLink from "@/components/account/SettingsLink";
import MainHeaderBar from "@/components/MainHeaderBar";
import { Dimens } from "@/constants/Dimes";
import { openSheet } from "@/store/sheetStore";
import { useColorsV2 } from "@/store/themeStore";

const Account = () => {
  const colors = useColorsV2();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.page,
        paddingTop: insets.top,
      }}
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
          <LogoutButton
            onPress={() =>
              openSheet(<LogoutConfirmSheet onConfirm={logout} />, {
                snapPoints: ["42%"],
              })
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Account;

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
