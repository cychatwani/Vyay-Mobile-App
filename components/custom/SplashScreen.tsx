import LottieView from "lottie-react-native";
import React from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";

/**
 * SplashScreen Component
 *
 * Plays the Vyay logo-reveal animation once on a full-bleed black
 * background and holds on the final frame. Overall splash duration is
 * controlled by MIN_SPLASH_MS in app/_layout.tsx.
 *
 * @returns {React.JSX.Element}
 */
const SplashScreen = () => {
  const { width } = Dimensions.get("window");
  const size = width * 0.95; // 80% of screen width, centered

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000", // matches the animation's baked background
      justifyContent: "center",
      alignItems: "center",
    },
    lottieAnimation: {
      width: size,
      height: size, // square, matches the 1024x1024 source aspect ratio
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <LottieView
        source={require("../../assets/images/vyay_splash.json")}
        autoPlay
        loop={false}
        speed={1}
        resizeMode="contain"
        style={styles.lottieAnimation}
      />
    </View>
  );
};

export default SplashScreen;
