import { StyleSheet, Text, View } from "react-native";
import React from "react";
// import Logo from "../../../assets/images/Logo.svg";
import Logo from "@/assets/images/Logo.svg"
import { scale } from "react-native-size-matters";
import { FONTS } from "@/constants/Fonts";
import { useColors } from "@/store/themeStore";
import LottieView from "lottie-react-native";
// import SafeView from "../SafeView/SafeView";
import SafeView from "@/components/custom/SafeView/SafeView";

import LoginWithGoogleButton from "@/components/custom/LoginScreen/LoginWithGoogleButton";


export default function LoginScreen() {
  const colors = useColors();
  const styles = createStyles(colors.main);
  console.log(colors);
  return (
    <SafeView statusBarColor={"white"} statusBarStyle="dark-content">
      <View style={styles.container}>
        <View style={styles.logoTextWrapper}>
          <Logo width={scale(55)} height={scale(50)} />
          <Text style={styles.title}>SplitEasy</Text>
        </View>
        <Text style={styles.tagline}>Split Karo Chill Karo</Text>
        <LottieView
          source={require("@/assets/images/LoginScreenAnimation.json")}
          autoPlay
          loop
          style={{
            height: scale(360),
            marginTop: scale(30),
            width: "100%",
          }}
        />
        <LoginWithGoogleButton
          style={styles.loginWithGoogleButton}
          buttonHeight={50 * 1.20}
          buttonWidth={200 * 1.20}
        />
      </View>
    </SafeView>
  );
}

const createStyles = (textColor: string) =>
  StyleSheet.create({
    loginWithGoogleButton: {
      marginTop: scale(75),
    },
    container: {
      flex: 1,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: scale(10),
    },
    logoTextWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: scale(32),
      color: textColor,
      marginLeft: scale(10),
    },
    tagline: {
      fontFamily: FONTS.medium,
      fontSize: scale(16),
      color: textColor,
      marginTop: scale(5),
    },
  });
