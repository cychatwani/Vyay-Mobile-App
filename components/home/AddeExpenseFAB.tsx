import { Platform, Pressable, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { ThemePalette } from "@/constants/Colors";
import { useColors } from "@/store/themeStore";
import { scale } from "react-native-size-matters";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AddExpenseFAB = () => {
  const colors = useColors();
  const styles = getStyles(colors);
  const [isOpen, setIsOpen] = useState(false);

  // Animated values
  const rotation = useSharedValue(0);
  const cameraTranslateY = useSharedValue(0);
  const cameraTranslateX = useSharedValue(0);
  const cameraOpacity = useSharedValue(0);
  const cameraScale = useSharedValue(0);

  const micTranslateY = useSharedValue(0);
  const micTranslateX = useSharedValue(0);
  const micOpacity = useSharedValue(0);
  const micScale = useSharedValue(0);

  const editTranslateY = useSharedValue(0);
  const editTranslateX = useSharedValue(0);
  const editOpacity = useSharedValue(0);
  const editScale = useSharedValue(0);

  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState) {
      // Open animation - flower pattern above and to the left
      rotation.value = withSpring(45); // Rotate plus to X

      // Camera button (top)
      cameraTranslateY.value = withSpring(-scale(70));
      cameraTranslateX.value = withSpring(0);
      cameraOpacity.value = withTiming(1, { duration: 200 });
      cameraScale.value = withSpring(1);

      // Mic button (top-left diagonal)
      micTranslateY.value = withSpring(-scale(50));
      micTranslateX.value = withSpring(-scale(50));
      micOpacity.value = withTiming(1, { duration: 200 });
      micScale.value = withSpring(1);

      // Edit button (left)
      editTranslateY.value = withSpring(0);
      editTranslateX.value = withSpring(-scale(70));
      editOpacity.value = withTiming(1, { duration: 200 });
      editScale.value = withSpring(1);
    } else {
      // Close animation
      rotation.value = withSpring(0);

      cameraTranslateY.value = withSpring(0);
      cameraTranslateX.value = withSpring(0);
      cameraOpacity.value = withTiming(0, { duration: 150 });
      cameraScale.value = withSpring(0);

      micTranslateY.value = withSpring(0);
      micTranslateX.value = withSpring(0);
      micOpacity.value = withTiming(0, { duration: 150 });
      micScale.value = withSpring(0);

      editTranslateY.value = withSpring(0);
      editTranslateX.value = withSpring(0);
      editOpacity.value = withTiming(0, { duration: 150 });
      editScale.value = withSpring(0);
    }
  };

  // Animated styles
  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: cameraTranslateY.value },
      { translateX: cameraTranslateX.value },
      { scale: cameraScale.value },
    ],
    opacity: cameraOpacity.value,
  }));

  const micStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: micTranslateY.value },
      { translateX: micTranslateX.value },
      { scale: micScale.value },
    ],
    opacity: micOpacity.value,
  }));

  const editStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: editTranslateY.value },
      { translateX: editTranslateX.value },
      { scale: editScale.value },
    ],
    opacity: editOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Camera Button */}
      <AnimatedPressable
        style={[styles.circle, cameraStyle]}
        android_ripple={{ color: colors.rippleColor }}
        onPress={() => console.log("Camera pressed")}
      >
        <Feather name="camera" size={scale(20)} color="#fff" />
      </AnimatedPressable>

      {/* Mic Button */}
      <AnimatedPressable
        style={[styles.circle, micStyle]}
        android_ripple={{ color: colors.rippleColor }}
        onPress={() => console.log("Mic pressed")}
      >
        <Feather name="mic" size={scale(20)} color="#fff" />
      </AnimatedPressable>

      {/* Edit Button */}
      <AnimatedPressable
        style={[styles.circle, editStyle]}
        android_ripple={{ color: colors.rippleColor }}
        onPress={() => console.log("Edit pressed")}
      >
        <Feather name="edit" size={scale(20)} color="#fff" />
      </AnimatedPressable>

      {/* Main Plus/Close Button */}
      <AnimatedPressable
        style={[styles.circle, mainButtonStyle]}
        android_ripple={{ color: colors.rippleColor }}
        onPress={toggleMenu}
      >
        <Feather name="plus" size={scale(20)} color="#fff" />
      </AnimatedPressable>
    </View>
  );
};

export default AddExpenseFAB;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: scale(90), // Position above the bottom navigation
      right: scale(20),
      alignItems: "center",
      justifyContent: "center",
    },
    circle: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(30),
      backgroundColor: colors.main,
      overflow: Platform.OS === "android" ? "hidden" : "visible",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primaryShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      position: "absolute",
    },
  });