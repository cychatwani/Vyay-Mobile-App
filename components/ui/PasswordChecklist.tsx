import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";

type Rule = {
  label: string;
  test: (value: string) => boolean;
};

/**
 * Mirrors the backend StandardPasswordPolicy (and passwordSchema in
 * schemas/auth.ts). If the policy changes, all three must move together.
 */
const RULES: Rule[] = [
  { label: "At least 10 characters", test: (v) => v.length >= 10 },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
  { label: "A special character", test: (v) => /[^A-Za-z0-9\s]/.test(v) },
  { label: "No spaces", test: (v) => v.length > 0 && !/\s/.test(v) },
];

type PasswordChecklistProps = {
  /** Current password value — rules tick live as they're satisfied. */
  value: string;
};

/**
 * Live password-policy checklist. Purely presentational — enforcement stays
 * in the zod schema; this just shows progress so the user is never surprised
 * by a validation error at submit time.
 */
export default function PasswordChecklist({ value }: PasswordChecklistProps) {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <View key={rule.label} style={styles.row}>
            <Feather
              name={met ? "check-circle" : "circle"}
              size={scale(14)}
              color={met ? colors.success.icon : colors.text3}
            />
            <Text style={[styles.label, met && styles.labelMet]}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColorsV2>) =>
  StyleSheet.create({
    container: {
      alignSelf: "stretch",
      gap: verticalScale(6),
      paddingHorizontal: scale(2),
      marginBottom: verticalScale(14),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    label: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.text2,
    },
    labelMet: {
      color: colors.success.text,
    },
  });
