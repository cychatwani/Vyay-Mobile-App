import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
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

import LoginWithGoogleButton from "@/components/custom/LoginScreen/LoginWithGoogleButton";
import Logo from "@/components/custom/Logo";
import SafeView from "@/components/custom/SafeView/SafeView";
import FormButton from "@/components/ui/FormButton";
import FormInput from "@/components/ui/FormInput";
import { FONTS } from "@/constants/Fonts";
import {
  registerIdentitySchema,
  type RegisterIdentityForm,
} from "@/schemas/auth";
import { useRegistrationStore } from "@/store/registrationStore";
import { useColorsV2 } from "@/store/themeStore";

export default function RegisterScreen() {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  const identity = useRegistrationStore((s) => s.identity);
  const setIdentity = useRegistrationStore((s) => s.setIdentity);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterIdentityForm>({
    resolver: zodResolver(registerIdentitySchema),
    // Rehydrate so coming back from a later step doesn't wipe what the
    // user typed.
    defaultValues: identity ?? {
      firstName: "",
      lastName: "",
      email: "",
    },
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

  // Local validation only — no API call until the confirmation screen.
  const onContinue = (data: RegisterIdentityForm) => {
    setIdentity(data);
    router.push("/(auth)/register-password");
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
                <Text style={styles.heading}>
                  Let&apos;s create a Vyay account
                </Text>
                <Text style={styles.subheading}>
                  First, tell us who you are
                </Text>
              </View>

              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <FormInput
                    control={control}
                    name="firstName"
                    label="First name"
                    placeholder="First name"
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                  />
                </View>
                <View style={styles.nameField}>
                  <FormInput
                    control={control}
                    name="lastName"
                    label="Last name"
                    placeholder="Last name"
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                  />
                </View>
              </View>

              <FormInput
                control={control}
                name="email"
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                error={errors.email?.message}
              />


              <FormButton label="Continue" onPress={handleSubmit(onContinue)} />

              {/* Log in link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Pressable
                  onPress={() => router.replace("/(auth)/login")}
                  hitSlop={8}
                >
                  <Text style={styles.loginLink}>Log in</Text>
                </Pressable>
              </View>

              {/* OR separator */}
              <View style={styles.separatorRow}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>or</Text>
                <View style={styles.separatorLine} />
              </View>
            </ScrollView>

            {/* Pinned footer — Google (same flow as the login screen) */}
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
    nameRow: {
      flexDirection: "row",
      gap: scale(12),
    },
    nameField: {
      flex: 1,
    },
    loginRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: verticalScale(14),
    },
    loginText: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
    },
    loginLink: {
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
    googleButton: {},
  });
