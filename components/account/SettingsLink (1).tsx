import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { FONTS } from "@/constants/Fonts";
import { getCardV2 } from "@/constants/Styles";
import { useColorsV2 } from "@/store/themeStore";

type SettingsLinkProps = {
  label?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
};

const SettingsLink = ({
  label = "Preferences",
  icon = "settings",
  onPress,
}: SettingsLinkProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.left}>
        <Feather name={icon} size={scale(20)} color={colors.text2} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={scale(20)} color={colors.text3} />
    </Pressable>
  );
};

export default SettingsLink;

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      ...getCardV2(colors),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: scale(14),
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    label: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
    },
  });
