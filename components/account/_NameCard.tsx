import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useColors } from "@/store/themeStore";
import { scale } from "react-native-size-matters";
import CircularPictureDisplay from "../CircularPictureDisplay";
import { useAuthStore } from "@/store/authStore";
import { FONTS } from "@/constants/Fonts";
import { ThemePalette } from "@/constants/Colors";
import {
  getCardDefaults,
  getTitleFontStyle,
  getSubTitleFontStyle,
} from "@/constants/Styles";
import LoginTypeBadge from "./LoginTypeBadge";

const NameCard = () => {
  const colors = useColors();
  const styles = getStyles(colors);
  const { user } = useAuthStore();
  
  return (
    <View style={styles.container}>
      <CircularPictureDisplay
        src={user?.profilePicture}
        size={70}
        isEditable={true}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <LoginTypeBadge />
      </View>
    </View>
  );
};

export default NameCard;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      ...getCardDefaults(colors),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(15),
      paddingVertical: scale(12), // ← Slightly reduce padding
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      gap: scale(3), // ← Tighten gap between text elements
    },
    name: {
      ...getTitleFontStyle(colors),
      paddingLeft: 0,
      marginTop: 0,
    },
    email: {
      ...getSubTitleFontStyle(colors),
      paddingLeft: 0,
      marginVertical: 0,
    },
  });