import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import { scale } from "react-native-size-matters";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

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

function GenericTabSwitcher<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  variant = "unified",
}: GenericTabSwitcherProps<T>) {
  const colors = useColors();
  const styles = getStyles(colors, variant);

  const P = scale(3);
  const [tabWidth, setTabWidth] = useState<number>(0);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    const singleTabWidth = (width - P * 2) / tabs.length;
    setTabWidth(singleTabWidth);
  };

  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const translateX = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    const newIndex = tabs.findIndex((tab) => tab.value === activeTab);
    if (newIndex >= 0) {
      translateX.value = withSpring(newIndex, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [activeTab, tabs]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * tabWidth }],
  }));

  const handleTabChange = (tab: T) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tab);
  };

  // Render unified variant (single card with sliding background)
  if (variant === "unified") {
    return (
      <View style={styles.container}>
        <View style={styles.tabContainer} onLayout={onContainerLayout}>
          // In the unified variant render section, update this part:
          {tabWidth > 0 && (
            <Animated.View
              style={[
                styles.activeBackground,
                {
                  width: tabWidth,
                  left: scale(3),
                  top: scale(3),
                  bottom: scale(3), // This should now work properly
                },
                animatedStyle,
              ]}
            >
              <LinearGradient
                colors={colors.primaryGradient as any}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          )}
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <Pressable
                key={tab.value}
                style={styles.tab}
                onPress={() => handleTabChange(tab.value)}
              >
                {tab.icon !== "none" && (
                  <Feather
                    name={tab.icon}
                    size={scale(18)}
                    color={isActive ? "#FFFFFF" : colors.textSecondary}
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

  // Render separated variant (individual cards)
  return (
    <View style={styles.separatedContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Pressable
            key={tab.value}
            style={[styles.separatedTab, isActive && styles.separatedTabActive]}
            onPress={() => handleTabChange(tab.value)}
          >
            {tab.icon !== "none" && (
              <Feather
                name={tab.icon}
                size={scale(18)}
                color={isActive ? "#FFFFFF" : colors.textSecondary}
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

const getStyles = (colors: ThemePalette, variant: TabVariant) =>
  StyleSheet.create({
    // Unified variant styles (keep existing)
    container: {
      paddingHorizontal: scale(8),
      marginTop: scale(10),
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: scale(25),
      padding: scale(3), // Changed back to 3
      position: "relative",
      shadowColor: colors.primaryShadow,
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.08,
      shadowRadius: scale(4),
      elevation: 2,
      overflow: "hidden",
      minHeight: scale(44),
    },
    activeBackground: {
      position: "absolute",
      borderRadius: scale(22), // Slightly larger to match
      overflow: "hidden",
    },
    gradient: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(5),
      zIndex: 1,
    },
    tabText: {
      fontSize: scale(13),
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: "#FFFFFF",
      fontFamily: FONTS.medium,
    },

    // Separated variant styles - UPDATED
    separatedContainer: {
      flexDirection: "row",
      paddingHorizontal: scale(8),
      marginTop: scale(10),
      gap: scale(5),
    },
    separatedTab: {
      flex: 1,
      flexDirection: "row", // Changed from column to row
      alignItems: "center",
      justifyContent: "center",
      gap: scale(3),
      paddingVertical: scale(5), // Reduced
      paddingHorizontal: scale(8), // Added horizontal padding
      backgroundColor: colors.card,
      borderRadius: scale(13), // More pill-shaped
      shadowColor: colors.primaryShadow,
      shadowOffset: { width: 0, height: scale(1) },
      shadowOpacity: 0.05,
      shadowRadius: scale(2),
      elevation: 1,
      borderWidth: 0, // Removed border
    },
    separatedTabActive: {
      backgroundColor: colors.main,
      shadowOpacity: 0.15,
      elevation: 3,
    },
    separatedTabText: {
      fontSize: scale(14), // Slightly larger
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    separatedTabTextActive: {
      color: "#FFFFFF", // White text on active
      fontFamily: FONTS.medium,
    },
  });
