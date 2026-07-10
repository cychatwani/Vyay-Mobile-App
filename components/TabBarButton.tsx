import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { FONTS } from "@/constants/Fonts";
import { Feather } from "@expo/vector-icons";
import { JSX } from "react/jsx-runtime";
import * as Haptics from "expo-haptics";
import { useColors } from "@/store/themeStore";
import { scale} from "react-native-size-matters";

import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const renderIcon = (route: string, color: string): JSX.Element => {
  switch (route) {
    case "index":
      return <Feather name="home" size={scale(22)} color={color} />;
    case "friends":
      return <Feather name="users" size={scale(22)} color={color} />;
    case "account":
      return <Feather name="user" size={scale(22)} color={color} />;
    default:
      return <></>;
  }
};
interface TabBarButtonProps {
  onPress: () => void;
  testId: string;
  isFocused: boolean;
  accessibilityLabel: string;
  label: string;
  name: string;
}

const TabBarButton = ({
  onPress,
  testId,
  isFocused,
  accessibilityLabel,
  label,
  name,
}: TabBarButtonProps) => {
  const colors = useColors();
  const styles = getStyles(colors);
  const handlePress = () => {
    if (!isFocused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [isFocused, scale]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return { opacity };
  });
  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.45]);
    const top = interpolate(scale.value, [0, 1], [0, 12]);
    return { transform: [{ scale: scaleValue }], top };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testId}
      onPress={handlePress}
      style={styles.tab}
    >
      <Animated.View style={animatedIconStyle}>
        {renderIcon(name, isFocused ? colors.white : colors.textPrimary)}
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

export default TabBarButton;

const getStyles = (colors: any) => StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap:scale(5)
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: scale(12),
    color: colors.textPrimary,
  },
});
