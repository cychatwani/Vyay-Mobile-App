import { StyleSheet, Text, View, StyleProp, ViewStyle, Pressable, Platform } from "react-native";
import React from "react";
import SignInWithGoogle from "../../../assets/images/SignInWithGoogle.svg";
import { scale} from "react-native-size-matters";
import { AndroidOnPressSignInwithGoogle } from "../../../auth/google";

interface LoginWithGoogleButtonProps {
  style?: StyleProp<ViewStyle>;
  buttonHeight?: number;
  buttonWidth?: number;
}

const LoginWithGoogleButton = ({
  style,
  buttonHeight,
  buttonWidth,
}: LoginWithGoogleButtonProps) => {
  return (
    <Pressable style={[style]} onPress={() => {
      if(Platform.OS === "android") {
        AndroidOnPressSignInwithGoogle();
      }
    }}>
    <SignInWithGoogle
      width={scale(buttonWidth || 200)}
      height={scale(buttonHeight || 50)}
    />
    </Pressable>
  );
};

export default LoginWithGoogleButton;

const styles = StyleSheet.create({});
