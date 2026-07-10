import React, { useEffect, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import { FONTS } from "@/constants/Fonts";
import TabBarButton from "./TabBarButton";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/store/themeStore";
import { scale } from "react-native-size-matters";

export function TabBar(props: any) {
  const colors = useColors();
  const styles = createTabBarStyles(colors);

  const AnimatedLinearGradient =
    Animated.createAnimatedComponent(LinearGradient);

  const { state, descriptors, navigation, insets } = props;

  const [dimensions, setdimensions] = useState({ height: scale(20), width: scale(100) });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setdimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionx = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionx.value }],
    };
  });

  useEffect(() => {
    tabPositionx.value = withSpring(buttonWidth * Number(props.state.index), {
      duration: 1200,
    });
  }, [Number(props.state.index)]);

  return (
    <View onLayout={onTabBarLayout} style={[styles.container]}>
      <AnimatedLinearGradient
        // colors={["#6366F1", "#8B5CF6"]}
        colors={colors.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          animatedStyle,
          {
            position: "absolute",
            borderRadius: scale(30),
            marginHorizontal: scale(8),
            height: dimensions.height - scale(18),
            width: buttonWidth - scale(18),
          },
        ]}
      />
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
            accessibilityLabel={options.tabBarAccessibilityLabel}
            label={label}
            name={name}
          />
        );
      })}
    </View>
  );
}

export const createTabBarStyles = (colors: any) => {

  

  return StyleSheet.create({
    container: {
      position: "absolute",
      bottom: scale(32),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card, // use theme card color
      marginHorizontal: scale(50),
      paddingVertical: scale(12),
      borderRadius: scale(35),
      shadowColor: colors.primaryShadow,
      shadowOffset: { width: scale(0), height: scale(10) },
      shadowOpacity: scale(0.1),
      shadowRadius: scale(8),
      elevation: scale(5), // Android shadow
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });
};
