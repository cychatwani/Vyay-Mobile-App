import React from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";

type FormButtonVariant = "primary" | "secondary" | "ghost";

type FormButtonProps = {
  label: string;
  onPress: () => void;
  variant?: FormButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function FormButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  leftIcon,
  style,
}: FormButtonProps) {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  const isDisabled = disabled || loading;

  const containerVariant =
    variant === "primary"
      ? styles.primary
      : variant === "secondary"
        ? styles.secondary
        : styles.ghost;

  const labelVariant =
    variant === "primary"
      ? styles.primaryLabel
      : variant === "secondary"
        ? styles.secondaryLabel
        : styles.ghostLabel;

  const spinnerColor = variant === "primary" ? colors.white : colors.brand;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{ color: colors.ripple }}
      style={({ pressed }) => [
        styles.base,
        containerVariant,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
          <Text style={[styles.label, labelVariant]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useColorsV2>) =>
  StyleSheet.create({
    base: {
      width: "100%",
      height: verticalScale(50),
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
    },
    leftIcon: {
      marginRight: scale(8),
    },
    label: {
      fontFamily: FONTS.bold,
      fontSize: scale(16),
    },
    primary: {
      backgroundColor: colors.brand,
    },
    primaryLabel: {
      color: colors.white,
    },
    secondary: {
      backgroundColor: colors.brandSubtle,
    },
    secondaryLabel: {
      color: colors.brandText,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    ghostLabel: {
      color: colors.brand,
    },
    pressed: {
      opacity: 0.9,
    },
    disabled: {
      opacity: 0.5,
    },
  });
