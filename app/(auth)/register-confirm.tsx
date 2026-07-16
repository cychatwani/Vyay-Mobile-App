import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { registerWithPassword } from "@/auth/registration";
import SafeView from "@/components/custom/SafeView/SafeView";
import FormButton from "@/components/ui/FormButton";
import { FONTS } from "@/constants/Fonts";
import { useRegistrationStore } from "@/store/registrationStore";
import { useColorsV2 } from "@/store/themeStore";

/**
 * Review step between the registration form and account creation.
 * Nothing exists on the server yet — no network request happens on mount.
 * The registration API is called only when the user confirms.
 */
export default function RegisterConfirmScreen() {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  const identity = useRegistrationStore((s) => s.identity);
  const password = useRegistrationStore((s) => s.password);
  const setChallenge = useRegistrationStore((s) => s.setChallenge);
  const clear = useRegistrationStore((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Guard: bounce to the earliest missing step (e.g. deep-linked directly).
  // Focus-scoped: this screen stays mounted underneath verify-otp, and on
  // success clear() nulls the store — a plain effect here would fire a
  // replace() from the background and loop the navigator against the
  // home redirect.
  useFocusEffect(
    useCallback(() => {
      if (!identity) {
        router.replace("/(auth)/register");
      } else if (!password) {
        router.replace("/(auth)/register-password");
      }
    }, [identity, password]),
  );

  if (!identity || !password) return null;

  const initials =
    `${identity.firstName.charAt(0)}${identity.lastName.charAt(0)}`.toUpperCase();

  // First (and only) point where the registration API is called.
  const onConfirm = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await registerWithPassword({ ...identity, password });

      if (result.nextStep === "VERIFY_OTP") {
        setChallenge({
          verificationId: result.verificationId,
          expiresAt: result.expiresAt,
          resendAvailableAt: result.resendAvailableAt,
        });
        router.push("/(auth)/verify-otp");
        return;
      }

      // LOGIN: account exists and needs no verification — send them to
      // log in. VERIFY_LINK shouldn't occur (mobile always requests
      // EMAIL_OTP); treat it the same way rather than dead-ending.
      if (result.nextStep !== "LOGIN") {
        console.warn("[register] Unexpected nextStep:", result.nextStep);
      }
      clear();
      router.replace("/(auth)/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Something went wrong. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeView statusBarColor={colors.page} statusBarStyle="dark-content">
      <View style={styles.flex}>
        {/* Header — back + title */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Feather name="arrow-left" size={scale(22)} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Confirm your details</Text>
          {/* Spacer to keep the title optically centered */}
          <View style={{ width: scale(22) }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subheading}>
            Make sure everything looks right — we&apos;ll send a verification
            code to this email.
          </Text>

          {/* Identity card */}
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.avatarCaption}>
              You can add a profile photo after signing up
            </Text>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>First name</Text>
              <Text style={styles.rowValue}>{identity.firstName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Last name</Text>
              <Text style={styles.rowValue}>{identity.lastName}</Text>
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.emailValue}>{identity.email}</Text>
            </View>
          </View>

          {submitError ? (
            <Text style={styles.submitError}>{submitError}</Text>
          ) : null}
        </ScrollView>

        {/* Pinned footer — actions */}
        <View style={styles.footer}>
          <FormButton
            label="Continue"
            onPress={onConfirm}
            loading={submitting}
          />
          <FormButton
            label="Edit details"
            variant="ghost"
            onPress={() => router.back()}
            disabled={submitting}
          />
        </View>
      </View>
    </SafeView>
  );
}

const createStyles = (colors: ReturnType<typeof useColorsV2>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.page },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(12),
      paddingBottom: verticalScale(10),
    },
    headerTitle: {
      fontFamily: FONTS.bold,
      fontSize: scale(17),
      color: colors.text,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(4),
    },
    subheading: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
      marginBottom: verticalScale(16),
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(20),
      alignItems: "center",
      shadowColor: "#0D0E13",
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.06,
      shadowRadius: scale(12),
      elevation: 2,
    },
    avatar: {
      width: scale(72),
      height: scale(72),
      borderRadius: scale(36),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandSubtle,
    },
    avatarText: {
      fontFamily: FONTS.bold,
      fontSize: scale(26),
      color: colors.brand,
    },
    avatarCaption: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text3,
      marginTop: verticalScale(8),
    },
    divider: {
      alignSelf: "stretch",
      height: 1,
      backgroundColor: colors.border,
      marginVertical: verticalScale(16),
    },
    row: {
      alignSelf: "stretch",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: verticalScale(10),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: {
      flexDirection: "column",
      alignItems: "flex-start",
      borderBottomWidth: 0,
    },
    rowLabel: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
    },
    rowValue: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      maxWidth: "60%",
      textAlign: "right",
    },
    emailValue: {
      alignSelf: "stretch",
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text,
      marginTop: verticalScale(4),
      // No maxWidth/numberOfLines — a full email must never truncate here,
      // it's the address the OTP is about to be sent to.
    },
    submitError: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.error.text,
      textAlign: "center",
      marginTop: verticalScale(12),
    },
    footer: {
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(12),
      gap: verticalScale(4),
    },
  });
