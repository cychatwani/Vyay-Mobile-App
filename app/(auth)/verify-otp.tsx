import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { redirectToHome } from "@/auth/coreAuth";
import { resendEmailOtp, verifyEmailOtpAndLogin } from "@/auth/registration";
import SafeView from "@/components/custom/SafeView/SafeView";
import FormButton from "@/components/ui/FormButton";
import OtpInput from "@/components/ui/OtpInput";
import { FONTS } from "@/constants/Fonts";
import { useRegistrationStore } from "@/store/registrationStore";
import { useColorsV2 } from "@/store/themeStore";

const OTP_LENGTH = 6;
/** Fallback if the server timestamp is missing or already in the past. */
const RESEND_FALLBACK_SECONDS = 30;

/** Whole seconds from now until an ISO timestamp, clamped to >= 0. */
const secondsUntil = (iso: string) =>
  Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 1000));

export default function VerifyOtpScreen() {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  const identity = useRegistrationStore((s) => s.identity);
  const challenge = useRegistrationStore((s) => s.challenge);
  const setChallenge = useRegistrationStore((s) => s.setChallenge);
  const clear = useRegistrationStore((s) => s.clear);

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(() =>
    challenge ? secondsUntil(challenge.resendAvailableAt) : RESEND_FALLBACK_SECONDS,
  );

  /**
   * Set before clear() on success. clear() nulls the identity, which would
   * otherwise re-fire the guard below and race the home redirect with a
   * bounce back to /register.
   */
  const completedRef = useRef(false);

  // Guard: bounce to the earliest missing step. A missing challenge means
  // the registration API never ran for this session. Focus-scoped like the
  // other steps, and additionally gated by completedRef: on success this
  // screen IS focused when clear() nulls the store, and without the gate
  // the guard would bounce to /register while the home redirect is in
  // flight.
  useFocusEffect(
    useCallback(() => {
      if (completedRef.current) return;
      if (!identity) {
        router.replace("/(auth)/register");
      } else if (!challenge) {
        router.replace("/(auth)/register-confirm");
      }
    }, [identity, challenge]),
  );

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!identity || !challenge) return null;

  const onVerify = async (otp: string) => {
    Keyboard.dismiss();
    setError(null);
    setVerifying(true);
    try {
      await verifyEmailOtpAndLogin(challenge.verificationId, otp, () => {
        // Session is stored; tear down the draft before leaving.
        completedRef.current = true;
        clear();
        redirectToHome();
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "That code didn't work. Try again.";
      setError(msg);
      setCode("");
      setVerifying(false);
    }
    // No finally-reset on success: this screen unmounts on redirect.
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    try {
      // Resend issues a NEW verificationId — replace the stored challenge,
      // never reuse the old id.
      const next = await resendEmailOtp(identity.email);
      setChallenge(next);
      setCode("");
      setCooldown(
        secondsUntil(next.resendAvailableAt) || RESEND_FALLBACK_SECONDS,
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Couldn't resend the code. Try again.";
      setError(msg);
    }
  };

  return (
    <SafeView statusBarColor={colors.page} statusBarStyle="dark-content">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header — back only */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Feather
                name="arrow-left"
                size={scale(22)}
                color={colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.body}>
            {/* Icon badge */}
            <View style={styles.iconBadge}>
              <Feather name="mail" size={scale(24)} color={colors.brand} />
            </View>

            <Text style={styles.heading}>Check your email</Text>
            <Text style={styles.subheading}>
              We sent a {OTP_LENGTH}-digit code to{"\n"}
              <Text style={styles.email}>{identity.email}</Text>
            </Text>

            <View style={styles.otpWrap}>
              <OtpInput
                value={code}
                onChange={(c) => {
                  setError(null);
                  setCode(c);
                }}
                onFulfill={onVerify}
                cellCount={OTP_LENGTH}
                error={error}
                disabled={verifying}
              />
            </View>

            <FormButton
              label="Verify"
              onPress={() => onVerify(code)}
              loading={verifying}
              disabled={code.length !== OTP_LENGTH}
              style={styles.verifyButton}
            />

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn&apos;t get it? </Text>
              {cooldown > 0 ? (
                <Text style={styles.resendCooldown}>
                  Resend in {cooldown}s
                </Text>
              ) : (
                <Pressable onPress={onResend} hitSlop={8}>
                  <Text style={styles.resendLink}>Resend code</Text>
                </Pressable>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeView>
  );
}

const createStyles = (colors: ReturnType<typeof useColorsV2>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.page },
    header: {
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(12),
      paddingBottom: verticalScale(6),
    },
    body: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(28),
    },
    iconBadge: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandSubtle,
      marginBottom: verticalScale(18),
    },
    heading: {
      fontFamily: FONTS.bold,
      fontSize: scale(22),
      color: colors.text,
    },
    subheading: {
      fontFamily: FONTS.regular,
      fontSize: scale(14),
      color: colors.text2,
      textAlign: "center",
      lineHeight: scale(21),
      marginTop: verticalScale(6),
    },
    email: {
      fontFamily: FONTS.medium,
      color: colors.text,
    },
    otpWrap: {
      alignSelf: "stretch",
      marginTop: verticalScale(28),
    },
    verifyButton: {
      marginTop: verticalScale(24),
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: verticalScale(18),
    },
    resendText: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.text2,
    },
    resendCooldown: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      color: colors.text3,
    },
    resendLink: {
      fontFamily: FONTS.bold,
      fontSize: scale(13),
      color: colors.brand,
    },
  });
