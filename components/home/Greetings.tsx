import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/store/themeStore";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

const Greetings = () => {
  const { user } = useAuthStore();
  const colors = useColors();
  const styles = getStyles(colors);

  const greetingData = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return { greeting: "Good morning", icon: require("@/assets/images/morning.png") };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: "Good afternoon", icon: require("@/assets/images/afternoon.png") };
    } else if (hour >= 17 && hour < 19) {
      return { greeting: "Good evening", icon: require("@/assets/images/sunset.png") };
    } else {
      return { greeting: "Good evening", icon: require("@/assets/images/night.png") };
    }
  }, [colors]);

  const isEmoji = typeof greetingData.icon === "string";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {isEmoji ? (
          <Text style={styles.emoji}>{greetingData.icon}</Text>
        ) : (
          <Image style={styles.image} source={greetingData.icon} />
        )}
        <Text style={styles.greeting}>
          {greetingData.greeting + " "}
          <Text style={styles.name}>{user?.firstName}</Text>
        </Text>
      </View>
    </View>
  );
};

export default Greetings;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      paddingVertical: scale(8), // reduced padding for compact look
      paddingHorizontal: scale(16),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8), // small spacing between icon and text
    },
    image: {
      width: scale(30),
      height: scale(30),
      marginRight: scale(4),
    },
    emoji: {
      fontSize: scale(24),
      marginRight: scale(4),
    },
    greeting: {
      fontFamily: FONTS.medium,
      fontSize: scale(16),
      color: colors.textPrimary,
    },
    name: {
      fontFamily: FONTS.bold,
      fontSize: scale(16),
      color: colors.textPrimary,
    },
  });
