import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
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

import SafeView from "@/components/custom/SafeView/SafeView";
import FormButton from "@/components/ui/FormButton";
import FormInput from "@/components/ui/FormInput";
import PasswordChecklist from "@/components/ui/PasswordChecklist";
import { FONTS } from "@/constants/Fonts";
import {
  registerPasswordSchema,
  type RegisterPasswordForm,
} from "@/schemas/auth";
import { useRegistrationStore } from "@/store/registrationStore";
import { useColorsV2 } from "@/store/themeStore";

export default function RegisterPasswordScreen() {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  const identity = useRegistrationStore((s) => s.identity);
  const storedPassword = useRegistrationStore((s) => s.password);
  const setPassword = useRegistrationStore((s) => s.setPassword);

  // Guard: password step is meaningless without an identity.
  // Focus-scoped on purpose: this screen stays MOUNTED in the stack while
  // later steps are on top. A plain useEffect here fires when the store is
  // cleared on success and issues a rogue replace() from a background
  // screen — which is what loops the navigator. Unfocused screens must
  // never navigate.
  useFocusEffect(
    useCallback(() => {
      if (!identity) {
        router.replace("/(auth)/register");
      }
    }, [identity]),
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPasswordForm>({
    resolver: zodResolver(registerPasswordSchema),
    // Rehydrate on "Edit" from the confirmation screen.
    defaultValues: {
      password: storedPassword ?? "",
      confirmPassword: storedPassword ?? "",
    },
    mode: "onBlur",
  });

  // Live value for the checklist.
  const passwordValue = useWatch({ control, name: "password" }) ?? "";

  if (!identity) return null;

  // Local validation only — the API is called on the confirmation screen.
  const onContinue = (data: RegisterPasswordForm) => {
    setPassword(data.password);
    router.push("/(auth)/register-confirm");
  };

  return (
    <SafeView statusBarColor={colors.page} statusBarStyle="dark-content">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header — back */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Feather
                name="arrow-left"
                size={scale(22)}
                color={colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>Set your password</Text>
              <Text style={styles.subheading}>
                This keeps your account secure — make it strong
              </Text>
            </View>

            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              autoComplete="new-password"
              error={errors.password?.message}
            />

            <PasswordChecklist value={passwordValue} />

            <FormInput
              control={control}
              name="confirmPassword"
              label="Confirm password"
              placeholder="Repeat your password"
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
            />

            <FormButton label="Continue" onPress={handleSubmit(onContinue)} />
          </ScrollView>
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(8),
      paddingBottom: verticalScale(16),
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
  });
