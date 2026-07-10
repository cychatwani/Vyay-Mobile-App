import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import React from "react";
import { useColors } from "@/store/themeStore";
import { ThemePalette } from "@/constants/Colors";
import QRCode from "react-native-qrcode-svg";
import {
  getCardDefaults,
  getTitleFontStyle,
  getSubTitleFontStyle,
} from "@/constants/Styles";
import { useAuthStore } from "@/store/authStore";
import { scale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { Share } from "react-native";

const IdentityCard = () => {
  const colors = useColors();
  const styles = getStyles(colors);
  const { user } = useAuthStore();
  const userId = user?.id; // From your auth store
  const inviteLink = `https://spliiteasy.app/invite/${userId}`;

  const shareInviteLink = async () => {
    try {
      await Share.share({
        message:
          "Click this to add me friend on SplitEasy to share expenses together " +
          inviteLink,
        title: "Add me on SplitEasy",
      });
    } catch (error: any) {
      console.error("Error sharing:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Connect with Friends</Text>
        <Text style={styles.subTitle}>
          Share your profile to split expenses together
        </Text>
        <QRCode
          value={inviteLink} // The data to encode
          size={scale(145)} // Size of the QR code in pixels
          color={colors.qrCode} // Color of the QR code dots
          backgroundColor={colors.card} // Background color
          logo={require("@/assets/images/splash-icon.png")}
          logoBackgroundColor="transparent"
        />
        <Text style={styles.subTitle}>Scan to add me on SpliitEasy</Text>

        {/* ✅ Only ripple added here */}
        <Pressable
          onPress={shareInviteLink}
          style={({ pressed }) => [
            styles.shareButton,
            pressed && Platform.OS === "ios" && { opacity: 0.8 },
          ]}
          android_ripple={{ color: colors.rippleColor}}
        >
          <View style={styles.shareButtonContentContianer}>
            <Feather name="send" size={scale(22)} color={colors.white} />
            <Text
              style={{ ...getSubTitleFontStyle(colors), color: colors.white }}
            >
              Send Invite Link
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default IdentityCard;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: { ...getCardDefaults(colors) },
    title: { ...getTitleFontStyle(colors) },
    subTitle: { ...getSubTitleFontStyle(colors) },
    titleContainer: { alignItems: "center" },
    shareButton: {
      ...getCardDefaults(colors),
      backgroundColor: colors.main,
      overflow: Platform.OS === "android" ? "hidden" : "visible", // needed for ripple
      borderRadius: scale(30),
      
    },
    shareButtonContentContianer: {
      flexDirection: "row",
      padding:scale(5),
      justifyContent: "center",
      alignItems: "center",
    },
  });
