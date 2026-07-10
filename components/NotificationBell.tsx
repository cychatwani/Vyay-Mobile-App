import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { scale } from "react-native-size-matters";
import { FONTS } from "@/constants/Fonts";
import { useColors } from "@/store/themeStore";

type Props = {
  count?: number;
  onPress?: () => void;
  size?: number;
  iconColor?: string;
};

const NotificationBell: React.FC<Props> = ({
  count = 0,
  onPress,
  size = 24,
  iconColor = "#fff",
}) => {
  const displayCount = count > 99 ? "99+" : count.toString();
  const showBadge = count > 0;
  const colors = useColors();
  const styles = getStyles(colors);
  // Dynamic sizing based on content
  const getBadgeSize = () => {
    if (count < 10)
      return {
        top: scale(-8),
        right: scale(-5.5),
        padding: scale(1),
        paddingHorizontal: scale(6.5),
      };
    if (count < 100)
      return {
        top: scale(-8),
        right: scale(-5.5),
        padding: scale(1),
        paddingHorizontal: scale(3.5),
      };
    return { top: scale(-8), right: scale(-7.5), padding: scale(0.5) };
  };

  const badgeSize = getBadgeSize();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Feather name="bell" size={scale(size)} color={iconColor} />

      {showBadge && (
        <View style={[styles.badge, badgeSize]}>
          <Text style={styles.badgeText}>{displayCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;

const getStyles = (colors: any  ) =>
  StyleSheet.create({
    container: {
      position: "relative",
    },
    badge: {
      position: "absolute",
      borderRadius: scale(20),
      backgroundColor: "#FF3B30",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.75,
      borderColor: colors.pictureBorderColor,
      shadowColor: colors.primaryShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: scale(3),
      elevation: 4,
    },
    badgeText: {
      color: colors.white,
      fontSize: scale(10),
      fontFamily: FONTS.bold,
      letterSpacing: -0.3,
    },
  });
