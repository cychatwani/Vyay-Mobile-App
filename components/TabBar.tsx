import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";

import { LinearGradient } from "expo-linear-gradient";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { useColorsV2 } from "@/store/themeStore";
import { shade } from "@/utils/colorUtils";
import TabBarButton from "./TabBarButton";

// Created once at module scope — recreating an animated component every
// render (the old pattern) resets its native props needlessly.
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * Inset of the sliding pill from the bar's edge. The pill is positioned
 * with `left: PILL_INSET` and sized `buttonWidth − 2·PILL_INSET`, so its
 * centre lands exactly on each button's centre — the old margin-based
 * placement drifted ~1px per tab, which compounds at four tabs.
 */
const PILL_INSET = scale(6);

/** Larger travel than the segmented control, so slightly more damping. */
const BAR_SPRING = { damping: 22, stiffness: 260, mass: 0.9 };

export function TabBar(props: any) {
  const colors = useColorsV2();
  const styles = createTabBarStyles(colors);

  const { state, descriptors, navigation } = props;

  // null until measured — the pill never renders at a guessed position.
  const [dims, setDims] = useState<{ height: number; width: number } | null>(
    null,
  );

  const buttonWidth = dims ? dims.width / state.routes.length : 0;
  const pillHeight = dims ? dims.height - PILL_INSET * 2 : 0;

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setDims({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);

  useEffect(() => {
    tabPositionX.value = withSpring(buttonWidth * state.index, BAR_SPRING);
  }, [state.index, buttonWidth, tabPositionX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  /** Same derived top-light as the segmented control: depth, not colour. */
  const pillGradient = [
    shade(colors.brand, 0.07),
    shade(colors.brand, -0.05),
  ] as const;

  return (
    <View onLayout={onTabBarLayout} style={styles.container}>
      {dims && (
        <AnimatedLinearGradient
          colors={pillGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            animatedStyle,
            styles.pill,
            {
              height: pillHeight,
              width: buttonWidth - PILL_INSET * 2,
              // Capsule by construction; concentric with the bar because
              // pillRadius = barRadius − PILL_INSET when both are capsules.
              borderRadius: pillHeight / 2,
            },
          ]}
        />
      )}
      {state.routes.map((route: any, idx: number) => {
        const { key, name } = route;
        const descriptor = descriptors[key] || {};
        const options = descriptor.options || {};
        const label = options.title ?? options.tabBarLabel ?? name;
        const isFocused = state.index === idx;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(name);
          }
        };

        return (
          <TabBarButton
            key={name}
            onPress={onPress}
            testId={options.tabBarTestID}
            isFocused={isFocused}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            label={label}
            name={name}
          />
        );
      })}
    </View>
  );
}

export const createTabBarStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: scale(28),
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      // Four tabs need room to breathe; the old 50 was sized for three.
      marginHorizontal: scale(24),
      paddingVertical: scale(10),
      borderRadius: scale(999), // capsule regardless of measured height
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      // A floating bar carries more elevation than an inline control, but
      // it should read as ambient light, not a Material key shadow:
      // large blur, restrained opacity, plain numbers (opacity is not a
      // dimension — never scale() it).
      shadowColor: "#0D0E13",
      shadowOffset: { width: 0, height: scale(8) },
      shadowOpacity: 0.1,
      shadowRadius: scale(20),
      elevation: 6,
    },
    pill: {
      position: "absolute",
      left: PILL_INSET,
      top: PILL_INSET,
      // Brand-tinted lift, matching the segmented control's language.
      shadowColor: colors.brand,
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.3,
      shadowRadius: scale(6),
      elevation: 3,
    },
  });
