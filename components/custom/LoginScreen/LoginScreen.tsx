import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import Logo from "@/assets/images/Logo.svg";
import LoginWithGoogleButton from "@/components/custom/LoginScreen/LoginWithGoogleButton";
import SafeView from "@/components/custom/SafeView/SafeView";
import { FONTS } from "@/constants/Fonts";
import { useColors } from "@/store/themeStore";

type LoginForm = {
  email: string;
  password: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const colors = useColors();
  const styles = createStyles(colors);

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  // Fade the screen in to smooth the handoff from the black splash
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  // TODO: wire to backend email/password login endpoint (returns AuthResponse envelope)
  const onSubmit = (data: LoginForm) => {
    console.log("[login] submit (not wired yet):", data);
  };

  // TODO: navigate to forgot-password flow once built
  const onForgotPassword = () => {
    console.log("[login] forgot password tapped (not wired yet)");
  };

  return (
    <SafeView statusBarColor={colors.background} statusBarStyle="dark-content">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.container, { opacity }]}>
              {/* Brand */}
              <View style={styles.logoTextWrapper}>
                <Logo width={scale(55)} height={scale(50)} />
                <Text style={styles.title}>Vyay</Text>
              </View>

              {/* Heading */}
              <View style={styles.headingBlock}>
                <Text style={styles.heading}>Welcome back</Text>
                <Text style={styles.subheading}>
                  Log in to continue to your account
                </Text>
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_REGEX,
                      message: "Enter a valid email",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    errors.password && styles.inputError,
                  ]}
                >
                  <Controller
                    control={control}
                    name="password"
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "At least 6 characters",
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <Pressable
                    onPress={() => setShowPassword((s) => !s)}
                    hitSlop={8}
                  >
                    <Text style={styles.showToggle}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Forgot password */}
              <Pressable
                onPress={onForgotPassword}
                style={styles.forgotWrapper}
                hitSlop={8}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              {/* Login button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                ]}
                android_ripple={{ color: colors.rippleColor }}
              >
                <Text style={styles.loginButtonText}>Log in</Text>
              </Pressable>

              {/* OR separator */}
              <View style={styles.separatorRow}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>or</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Google */}
              <LoginWithGoogleButton
                style={styles.googleButton}
                buttonHeight={50 * 1.2}
                buttonWidth={200 * 1.2}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeView>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: verticalScale(20),
      paddingHorizontal: scale(24),
    },
    logoTextWrapper: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(24),
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: scale(32),
      color: colors.main,
      marginLeft: scale(10),
    },
    headingBlock: {
      width: "100%",
      marginBottom: verticalScale(24),
    },
    heading: {
      fontFamily: FONTS.bold,
      fontSize: scale(24),
      color: colors.textPrimary,
    },
    subheading: {
      fontFamily: FONTS.regular,
      fontSize: scale(14),
      color: colors.textSecondary,
      marginTop: verticalScale(4),
    },
    fieldGroup: {
      width: "100%",
      marginBottom: verticalScale(16),
    },
    label: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      color: colors.textPrimary,
      marginBottom: verticalScale(6),
    },
    input: {
      width: "100%",
      height: verticalScale(48),
      borderWidth: 1,
      borderColor: colors.pictureBorderColor,
      borderRadius: scale(12),
      paddingHorizontal: scale(14),
      fontFamily: FONTS.regular,
      fontSize: scale(15),
      color: colors.textPrimary,
      backgroundColor: colors.card,
    },
    inputError: {
      borderColor: "#C82F2C", // vy-error
    },
    passwordWrapper: {
      width: "100%",
      height: verticalScale(48),
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.pictureBorderColor,
      borderRadius: scale(12),
      paddingHorizontal: scale(14),
      backgroundColor: colors.card,
    },
    passwordInput: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: scale(15),
      color: colors.textPrimary,
      height: "100%",
    },
    showToggle: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      color: colors.main,
      marginLeft: scale(8),
    },
    errorText: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: "#C82F2C", // vy-error
      marginTop: verticalScale(4),
    },
    forgotWrapper: {
      alignSelf: "flex-end",
      marginBottom: verticalScale(20),
    },
    forgotText: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      color: colors.main,
    },
    loginButton: {
      width: "100%",
      height: verticalScale(50),
      backgroundColor: colors.main,
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    loginButtonPressed: {
      opacity: 0.9,
    },
    loginButtonText: {
      fontFamily: FONTS.bold,
      fontSize: scale(16),
      color: "#FFFFFF",
    },
    separatorRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginVertical: verticalScale(24),
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.pictureBorderColor,
    },
    separatorText: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.textSecondary,
      marginHorizontal: scale(12),
    },
    googleButton: {
      alignSelf: "center",
    },
  });
