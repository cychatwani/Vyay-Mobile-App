import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/store/themeStore";
import SplahLogo from "../../assets/images/SplahLogo.svg";

/**
 * SplashScreen Component
 *
 * A loading screen that displays a wallet animation for 2 seconds,
 * then transitions to show the app logo with name.
 *
 * @returns {React.JSX.Element}
 */
const SplashScreen = () => {
  const colors = useColors();
  const [isWalletAnimationCompleted, setIsWalletAnimationCompleted] =
    useState(false);
  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWalletAnimationCompleted(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0D0E13", // vy-neutral-1000, always black
    },
    mainContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    logoContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      marginTop: -120,
      // marginLeft:45,
    },
    lottieAnimation: {
      flex: 1,
      width: "100%",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        {isWalletAnimationCompleted ? (
          <View style={styles.logoContainer}>
            <SplahLogo width={352} height={352} style={styles.logo} />
          </View>
        ) : (
          <LottieView
            source={require("../../assets/images/vyay_splash.json")}
            autoPlay
            loop
            speed={1}
            style={styles.lottieAnimation}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;
