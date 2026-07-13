import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { getCardV2, getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { useAuthStore } from "@/store/authStore";
import { useColorsV2 } from "@/store/themeStore";
import CircularPictureDisplay from "../CircularPictureDisplay";
import LoginTypeBadge from "./LoginTypeBadge";

const NameCard = () => {
  const colors = useColorsV2();
  const styles = getStyles(colors);
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <CircularPictureDisplay
        src={user?.profilePicture}
        size={64}
        isEditable={true}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {user?.fullName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user?.email}
        </Text>
        <View style={styles.badgeWrap}>
          <LoginTypeBadge />
        </View>
      </View>
    </View>
  );
};

export default NameCard;

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      ...getCardV2(colors),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(14),
    },
    contentContainer: {
      flex: 1,
      justifyContent: "center",
      gap: scale(2),
    },
    name: {
      ...getTitleV2(colors),
    },
    email: {
      ...getSubtitleV2(colors),
    },
    badgeWrap: {
      marginTop: scale(6),
    },
  });
