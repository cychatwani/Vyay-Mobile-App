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

const SettingsLink = () => {
  const colors = useColors();
  const styles = getStyles(colors);
  const { user } = useAuthStore();
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent:"space-between", alignItems:"center" }}>
        <View style={{ flexDirection: "row", justifyContent:"center", alignItems:"center", gap:5, padding:scale(7) }}>
          <Feather
            name="settings"
            size={scale(22)}
            color={colors.textSecondary}
          />
          <Text style={{ ...getSubTitleFontStyle(colors)}}>Preferences</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent:"center", alignItems:"center", gap:5, padding:scale(7) }}>
          <Feather
            name="chevron-right"
            size={scale(22)}
            color={colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );
};

export default SettingsLink;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      ...getCardDefaults(colors),
      padding:5
    },
  });
