import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, Pressable, LayoutChangeEvent } from "react-native";
import { scale } from "react-native-size-matters";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

type TabOption = "friends" | "groups";

interface TabSwitcherProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
  friendsCount?: number;
  groupsCount?: number;
}

const TabSwitcher = ({
  activeTab,
  onTabChange,
    friendsCount = 0,
    groupsCount = 0,
}: TabSwitcherProps) => {
  const colors = useColors();
  const styles = getStyles(colors);

  const P = scale(3); // Reduced padding for sleeker look
  const [innerHalf, setInnerHalf] = React.useState<number>(0);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    const half = (width - P * 2) / 2;
    setInnerHalf(half);
  };

  const translateX = useSharedValue(activeTab === "friends" ? 0 : 1);

  React.useEffect(() => {
    translateX.value = withSpring(activeTab === "friends" ? 0 : 1, {
      damping: 20,
      stiffness: 200,
    });
  }, [activeTab]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * innerHalf }],
  }));

  const handleTabChange = (tab: TabOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer} onLayout={onContainerLayout}>
        {/* Animated Background */}
        {innerHalf > 0 && (
          <Animated.View
            style={[
              styles.activeBackground,
              { width: innerHalf, left: P, top: P, bottom: P },
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

        {/* Friends Tab */}
        <Pressable style={styles.tab} onPress={() => handleTabChange("friends")}>
          <Feather
            name="users"
            size={scale(18)}
            color={activeTab === "friends" ? "#FFFFFF" : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </Pressable>

        {/* Groups Tab */}
        <Pressable style={styles.tab} onPress={() => handleTabChange("groups")}>
          <Feather
            name="grid"
            size={scale(18)}
            color={activeTab === "groups" ? "#FFFFFF" : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "groups" && styles.activeTabText,
            ]}
          >
            Groups
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TabSwitcher;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: scale(16),
      marginTop: scale(10),
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: scale(25),
      padding: scale(3),
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
      borderRadius: scale(22),
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
      gap: scale(6),
      paddingVertical: scale(8),
      zIndex: 1,
    },
    tabText: {
      fontSize: scale(14),
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: "#FFFFFF",
    },
  });