import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import QRCode from "react-native-qrcode-svg";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getCardV2, getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { useAuthStore } from "@/store/authStore";
import { useColorsV2 } from "@/store/themeStore";

const IdentityCard = () => {
  const colors = useColorsV2();
  const styles = getStyles(colors);
  const { user } = useAuthStore();

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

      <View style={styles.qrWrap}>
        <QRCode
          value={inviteLink}
          size={scale(140)}
          color={colors.text}
          backgroundColor={colors.card}
          logo={require("@/assets/images/splash-icon.png")}
          logoBackgroundColor="transparent"
        />
      </View>

      <Text style={styles.scanHint}>Scan to add me on Vyay</Text>

      <Pressable
        onPress={shareInviteLink}
        style={({ pressed }) => [
          styles.shareButton,
          pressed && Platform.OS === "ios" && { opacity: 0.85 },
        ]}
        android_ripple={{ color: colors.ripple }}
      >
        <View style={styles.shareButtonContent}>
          <Feather name="send" size={scale(20)} color={colors.white} />
          <Text style={styles.shareButtonLabel}>Send invite link</Text>
        </View>
      </Pressable>
    </View>
  );
};

export default IdentityCard;

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      ...getCardV2(colors),
      alignItems: "center",
    },
    title: {
      ...getTitleV2(colors),
      textAlign: "center",
    },
    subTitle: {
      ...getSubtitleV2(colors),
      textAlign: "center",
      marginTop: scale(2),
    },
    qrWrap: {
      marginTop: Dimens.lg,
      padding: scale(12),
      backgroundColor: colors.card,
      borderRadius: Dimens.radiusMd,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    scanHint: {
      ...getSubtitleV2(colors),
      marginTop: Dimens.md,
    },
    shareButton: {
      marginTop: Dimens.lg,
      width: "100%",
      backgroundColor: colors.brand,
      borderRadius: Dimens.radiusPill,
      overflow: "hidden",
    },
    shareButtonContent: {
      flexDirection: "row",
      gap: scale(8),
      paddingVertical: scale(12),
      justifyContent: "center",
      alignItems: "center",
    },
    shareButtonLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.white,
    },
  });
