import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

const FriendsInfoNote = () => {
  const colors = useColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Feather name="alert-circle" size={scale(18)} color="#F59E0B" />

      <Text style={styles.text}>
        Showing direct balances only. Group expenses are optimized separately.
      </Text>
    </View>
  );
};

export default FriendsInfoNote;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FEF3C7",
      marginHorizontal: scale(24),
      marginBottom: scale(8),
      marginTop: scale(8),
      paddingVertical: scale(5),
      paddingHorizontal: scale(12),
      borderRadius: scale(10),
      gap: scale(10),
      borderLeftWidth: scale(3),
      borderLeftColor: "#F59E0B",
    },
    iconContainer: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      backgroundColor: "#FDE68A",
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      flex: 1,
      fontSize: scale(8),
      fontFamily: FONTS.regular,
      color: "#92400E",
      lineHeight: scale(12),
    },
  });
