import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";

/**
 * Small pill showing how the user signed in. Reads the real authType from the
 * user object instead of hardcoding "Google".
 */
const LoginTypeBadge = () => {
  const colors = useColorsV2();
  const { user } = useAuthStore();

  // authType lives on the auth response; fall back gracefully.
  const authType = (user as any)?.authType as string | undefined;

  const { label, icon } = resolveLoginType(authType);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: scale(6),
        paddingHorizontal: scale(10),
        paddingVertical: scale(6),
        backgroundColor: colors.brandSubtle,
        borderRadius: scale(25),
      }}
    >
      <Feather name={icon} size={scale(13)} color={colors.brandText} />
      <Text
        style={{
          fontSize: scale(12),
          fontFamily: FONTS.medium,
          color: colors.brandText,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

function resolveLoginType(
  authType?: string
): { label: string; icon: React.ComponentProps<typeof Feather>["name"] } {
  switch (authType) {
    case "GOOGLE":
      return { label: "Signed in with Google", icon: "chrome" };
    case "APPLE":
      return { label: "Signed in with Apple", icon: "smartphone" };
    case "PASSWORD":
      return { label: "Signed in with email", icon: "mail" };
    default:
      return { label: "Signed in", icon: "check-circle" };
  }
}

export default LoginTypeBadge;

const styles = StyleSheet.create({});
