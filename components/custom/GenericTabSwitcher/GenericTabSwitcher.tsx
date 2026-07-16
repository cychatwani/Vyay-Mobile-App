import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";

import { shade } from "@/utils/colorUtils";

export interface TabConfig<T extends string> {
  value: T;
  label: string;
  icon: keyof typeof Feather.glyphMap | "none";
}

type TabVariant = "unified" | "separated";

interface GenericTabSwitcherProps<T extends string> {
  tabs: TabConfig<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  variant?: TabVariant; // "unified" or "separated"
}

/* ------------------------------------------------------------------ *
 * Geometry — one source of truth so every radius/inset stays coherent.
 *
 * The concentric-radius rule: innerRadius = outerRadius − inset.
 * 44 tall capsule (radius 22), 4pt inset → 36 tall pill (radius 18),
 * which is itself a perfect capsule. Corners look "intentional" because
 * they are mathematically related, not eyeballed.
 * ------------------------------------------------------------------ */
const TRACK_HEIGHT = scale(44); // Apple minimum touch target
const TRACK_INSET = scale(4);
const TRACK_RADIUS = TRACK_HEIGHT / 2;
const PILL_RADIUS = TRACK_RADIUS - TRACK_INSET;

/** Spring tuned for iOS-feel: fast settle, one barely-there overshoot. */
const PILL_SPRING = { damping: 24, stiffness: 300, mass: 0.8 };

function GenericTabSwitcher<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  variant = "unified",
}: GenericTabSwitcherProps<T>) {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  /**
   * Soft top-light on the brand colour: +7% white at the top edge fading to
   * −5% black at the bottom. A luminance shift, not a hue transition — the
   * pill reads as a lit surface rather than a "gradient", and it stays
   * correct in dark mode because it derives from the active brand token.
   */
  const pillGradient = [
    shade(colors.brand, 0.07),
    shade(colors.brand, -0.05),
  ] as const;

  const [tabWidth, setTabWidth] = useState<number>(0);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setTabWidth((width - TRACK_INSET * 2) / tabs.length);
  };

  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const translateX = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    if (activeIndex >= 0) {
      translateX.value = withSpring(activeIndex, PILL_SPRING);
    }
    // Keyed on the resolved index, not the tabs array identity — call sites
    // pass inline arrays, and re-running the spring every parent render
    // (even to the same value) is wasted work.
  }, [activeIndex, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * tabWidth }],
  }));

  const handleTabChange = (tab: T) => {
    // Re-pressing the active segment is a no-op: no haptic, no callback.
    // Feedback on a press that changes nothing reads as a glitch.
    if (tab === activeTab) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tab);
  };

  // Unified variant — single track with the sliding lit pill.
  if (variant === "unified") {
    return (
      <View style={styles.container}>
        <View
          style={styles.track}
          onLayout={onContainerLayout}
          accessibilityRole="tablist"
        >
          {tabWidth > 0 && (
            <Animated.View
              style={[styles.pill, { width: tabWidth }, animatedStyle]}
            >
              {/* Shadow lives on the outer node; the clip lives inside.
                  overflow:"hidden" would swallow the elevation shadow. */}
              <View style={styles.pillClip}>
                <LinearGradient
                  colors={pillGradient}
                  style={styles.gradient}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                />
              </View>
            </Animated.View>
          )}
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <Pressable
                key={tab.value}
                style={styles.tab}
                onPress={() => handleTabChange(tab.value)}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                {tab.icon !== "none" && (
                  <Feather
                    name={tab.icon}
                    size={scale(15)}
                    color={isActive ? colors.white : colors.text2}
                  />
                )}
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Separated variant — individual cards, same design language.
  return (
    <View style={styles.separatedContainer} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Pressable
            key={tab.value}
            style={[styles.separatedTab, isActive && styles.separatedTabActive]}
            onPress={() => handleTabChange(tab.value)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            {tab.icon !== "none" && (
              <Feather
                name={tab.icon}
                size={scale(15)}
                color={isActive ? colors.white : colors.text2}
              />
            )}
            <Text
              numberOfLines={1}
              style={[
                styles.separatedTabText,
                isActive && styles.separatedTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default GenericTabSwitcher;

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    /* ------------------------------ unified ------------------------------ */
    container: {
      paddingHorizontal: scale(12),
      marginTop: scale(10),
    },
    track: {
      flexDirection: "row",
      height: TRACK_HEIGHT,
      backgroundColor: colors.card,
      borderRadius: TRACK_RADIUS,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: TRACK_INSET,
      position: "relative",
      // Ambient, not cast: big radius + low opacity reads as soft ground
      // shadow. Tight dark shadows are what make controls look "generated".
      shadowColor: "#0D0E13",
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.05,
      shadowRadius: scale(10),
      elevation: 1,
    },
    pill: {
      position: "absolute",
      left: TRACK_INSET,
      top: TRACK_INSET,
      bottom: TRACK_INSET,
      borderRadius: PILL_RADIUS,
      // Brand-tinted lift: the pill glows faintly with its own colour
      // instead of dropping a grey Material key shadow.
      shadowColor: colors.brand,
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.28,
      shadowRadius: scale(5),
      elevation: 3,
    },
    pillClip: {
      flex: 1,
      borderRadius: PILL_RADIUS,
      overflow: "hidden",
    },
    gradient: {
      flex: 1,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
      zIndex: 1,
    },
    tabText: {
      fontSize: scale(13),
      fontFamily: FONTS.medium,
      letterSpacing: scale(0.2),
      color: colors.text2,
    },
    activeTabText: {
      color: colors.white,
      // Same weight as inactive — the state change is carried entirely by
      // colour and the pill. Bumping weight makes labels shift width as the
      // pill arrives, which reads as a layout twitch.
    },

    /* ----------------------------- separated ----------------------------- */
    separatedContainer: {
      flexDirection: "row",
      paddingHorizontal: scale(12),
      marginTop: scale(10),
      gap: scale(8),
    },
    separatedTab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
      height: scale(40),
      paddingHorizontal: scale(10),
      backgroundColor: colors.card,
      borderRadius: scale(20),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#0D0E13",
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.04,
      shadowRadius: scale(6),
      elevation: 1,
    },
    separatedTabActive: {
      backgroundColor: colors.brand,
      borderColor: colors.brand,
      shadowColor: colors.brand,
      shadowOpacity: 0.28,
      shadowRadius: scale(5),
      elevation: 3,
    },
    separatedTabText: {
      fontSize: scale(13),
      fontFamily: FONTS.medium,
      letterSpacing: scale(0.2),
      color: colors.text2,
    },
    separatedTabTextActive: {
      color: colors.white,
    },
  });
