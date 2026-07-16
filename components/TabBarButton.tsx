import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";
import { JSX } from "react/jsx-runtime";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";

const renderIcon = (route: string, color: string): JSX.Element => {
  switch (route) {
    case "index":
      return <Feather name="home" size={scale(22)} color={color} />;
    case "friends": // presented as "Contacts"
      return <Feather name="users" size={scale(22)} color={color} />;
    case "groups":
      return <Feather name="grid" size={scale(22)} color={color} />;
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

/** Focus spring: quick settle, a whisper of overshoot — iOS, not bouncy. */
const FOCUS_SPRING = { damping: 18, stiffness: 240, mass: 0.8 };

/**
 * Computed at module scope: worklets run on the UI thread, and calling a
 * plain JS function like size-matters' scale() inside useAnimatedStyle
 * crashes with "Tried to synchronously call a non-worklet function".
 * Worklets may only capture plain values.
 */
const FOCUSED_ICON_SHIFT = scale(10);

const TabBarButton = ({
  onPress,
  testId,
  isFocused,
  accessibilityLabel,
  label,
  name,
}: TabBarButtonProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const handlePress = () => {
    if (!isFocused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  // NOT named `scale` — the old code shadowed the size-matters import,
  // which meant any scale() call added inside this component body would
  // have crashed at runtime.
  const focus = useSharedValue(0);

  useEffect(() => {
    focus.value = withSpring(isFocused ? 1 : 0, FOCUS_SPRING);
  }, [isFocused, focus]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focus.value, [0, 1], [1, 0]),
  }));

  const animatedIconStyle = useAnimatedStyle(() => {
    const iconScale = interpolate(focus.value, [0, 1], [1, 1.4]);
    const top = interpolate(focus.value, [0, 1], [0, FOCUSED_ICON_SHIFT]);
    return { transform: [{ scale: iconScale }], top };
  });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={accessibilityLabel}
      testID={testId}
      onPress={handlePress}
      style={styles.tab}
    >
      <Animated.View style={animatedIconStyle}>
        {renderIcon(name, isFocused ? colors.white : colors.text2)}
      </Animated.View>
      <Animated.Text style={[styles.label, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
};

export default TabBarButton;

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: scale(4),
    },
    label: {
      fontFamily: FONTS.medium,
      fontSize: scale(11),
      letterSpacing: scale(0.2),
      color: colors.text2,
    },
  });
