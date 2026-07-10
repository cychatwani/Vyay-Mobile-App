import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

import BottomSheet from "@/components/custom/BottomSheet/BottomSheet";
import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getCardV2, getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { useAuthStore } from "@/store/authStore";
import { useColorsV2 } from "@/store/themeStore";
import IdentityQr from "./IdentityQr";

const IdentityCard = () => {
  const colors = useColorsV2();
  const styles = getStyles(colors);
  const { user } = useAuthStore();

  const [qrOpen, setQrOpen] = useState(false);

  const userId = user?.userId;
  const inviteLink = `https://vyay.app/invite/${userId}`;

  const shareInviteLink = async () => {
    try {
      await Share.share({
        message:
          "Add me on Vyay so we can split and settle expenses together " +
          inviteLink,
        title: "Add me on Vyay",
      });
    } catch (error: any) {
      console.error("Error sharing:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect with friends</Text>
      <Text style={styles.subTitle}>
        Share your profile to split expenses together
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={() => {
            console.log("[qr] Show QR tapped, opening sheet");
            setQrOpen(true);
          }}
          android_ripple={{ color: colors.ripple }}
          style={({ pressed }) => [
            styles.button,
            styles.buttonOutline,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Feather name="maximize" size={scale(18)} color={colors.brand} />
          <Text style={styles.buttonOutlineLabel}>Show QR</Text>
        </Pressable>

        <Pressable
          onPress={shareInviteLink}
          android_ripple={{ color: colors.ripple }}
          style={({ pressed }) => [
            styles.button,
            styles.buttonPrimary,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Feather name="send" size={scale(18)} color={colors.white} />
          <Text style={styles.buttonPrimaryLabel}>Invite link</Text>
        </Pressable>
      </View>

      <BottomSheet
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        snapPoints={["60%"]}
      >
        <IdentityQr value={inviteLink} />
      </BottomSheet>
    </View>
  );
};

export default IdentityCard;

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      ...getCardV2(colors),
    },
    title: {
      ...getTitleV2(colors),
    },
    subTitle: {
      ...getSubtitleV2(colors),
      marginTop: scale(2),
    },
    buttonRow: {
      flexDirection: "row",
      gap: scale(12),
      marginTop: Dimens.lg,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      height: scale(46),
      borderRadius: Dimens.radiusPill,
      overflow: "hidden",
    },
    buttonPrimary: {
      backgroundColor: colors.brand,
    },
    buttonPrimaryLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.white,
    },
    buttonOutline: {
      borderWidth: 1.5,
      borderColor: colors.brand,
      backgroundColor: colors.brandSubtle,
    },
    buttonOutlineLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.brand,
    },
  });
