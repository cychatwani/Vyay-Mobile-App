import { SignInWithEmailPassword } from "@/auth/coreAuth";
import LoginWithGoogleButton from "@/components/custom/LoginScreen/LoginWithGoogleButton";
import Logo from "@/components/custom/Logo";
import SafeView from "@/components/custom/SafeView/SafeView";
import FormButton from "@/components/ui/FormButton";
import FormInput from "@/components/ui/FormInput";
import { FONTS } from "@/constants/Fonts";
import { loginSchema, type LoginForm } from "@/schemas/auth";
import { useColorsV2 } from "@/store/themeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

export default function LoginScreen() {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const [authError, setAuthError] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    try {
      await SignInWithEmailPassword(data.email, data.password);
      // authenticateUser handles the redirect on success
    } catch (err: any) {
      console.error("[login] failed:", err);
      const msg =
        err?.response?.data?.message ??
        "Login failed. Check your email and password.";
      setAuthError(msg);
    }
  };

  // TODO: wire forgot-password flow
  const onForgotPassword = () => {
    console.log("[login] forgot password tapped (not wired yet)");
  };

  return (
    <SafeView statusBarColor={colors.page} statusBarStyle="dark-content">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Animated.View style={[styles.flex, { opacity }]}>
            {/* Pinned header — logo */}
            <View style={styles.header}>
              <Logo
                variant="badge-mono"
                size={scale(80)}
                color={colors.brand}
              />
              <Text style={styles.title}>Vyay</Text>
            </View>

            {/* Scrollable form body */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headingBlock}>
                <Text style={styles.heading}>Welcome back</Text>
                <Text style={styles.subheading}>
                  Log in to continue to your account
                </Text>
              </View>

              <FormInput
                control={control}
                name="email"
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email?.message}
              />

              <FormInput
                control={control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password?.message}
              />

              <Pressable
                onPress={onForgotPassword}
                style={styles.forgotWrapper}
                hitSlop={8}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              {authError ? (
                <Text style={styles.authError}>{authError}</Text>
              ) : null}

              <FormButton
                label="Log in"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
              />

              {/* Sign up link */}
              <View style={styles.signupRow}>
                <Text style={styles.signupText}>
                  Don&apos;t have an account?{" "}
                </Text>
                <Pressable
                  onPress={() => router.push("/(auth)/register")}
                  hitSlop={8}
                >
                  <Text style={styles.signupLink}>Sign up</Text>
                </Pressable>
              </View>

              {/* OR separator */}
              <View style={styles.separatorRow}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>or</Text>
                <View style={styles.separatorLine} />
              </View>
            </ScrollView>

            {/* Pinned footer — Google */}
            <View style={styles.footer}>
              <LoginWithGoogleButton
                style={styles.googleButton}
                buttonHeight={50 * 1.2}
                buttonWidth={200 * 1.2}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeView>
  );
}

const createStyles = (colors: ReturnType<typeof useColorsV2>) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: verticalScale(12),
      paddingBottom: verticalScale(10),
      backgroundColor: colors.page,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: scale(26),
      color: colors.brand,
      marginLeft: scale(8),
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: colors.page,
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(8),
      paddingBottom: verticalScale(8),
    },
    headingBlock: {
      width: "100%",
      marginBottom: verticalScale(16),
    },
    heading: {
      fontFamily: FONTS.bold,
      fontSize: scale(22),
      color: colors.text,
    },
    subheading: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
      marginTop: verticalScale(2),
    },
    forgotWrapper: {
      alignSelf: "flex-end",
      marginBottom: verticalScale(14),
    },
    forgotText: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      color: colors.brand,
    },
    authError: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.error.text,
      marginBottom: verticalScale(10),
      textAlign: "center",
    },
    signupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: verticalScale(14),
    },
    signupText: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
    },
    signupLink: {
      fontFamily: FONTS.bold,
      fontSize: scale(13),
      color: colors.brand,
    },
    separatorRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: verticalScale(16),
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    separatorText: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
      marginHorizontal: scale(12),
    },
    footer: {
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(12),
      alignItems: "center",
      backgroundColor: colors.page,
    },
  });
