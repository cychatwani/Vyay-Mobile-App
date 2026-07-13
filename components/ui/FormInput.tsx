import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Control,
    Controller,
    FieldValues,
    Path,
    RegisterOptions,
} from "react-hook-form";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
} & Omit<TextInputProps, "value" | "onChangeText" | "onBlur">;

export default function FormInput<T extends FieldValues>({
  control,
  name,
  rules,
  label,
  error,
  leftIcon,
  secureTextEntry,
  style,
  ...textInputProps
}: FormInputProps<T>) {
  const colors = useColorsV2();
  const styles = createStyles(colors);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, style]}
              placeholderTextColor={colors.text3}
              value={value as string}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={isPassword && hidden}
              autoCapitalize={
                isPassword ? "none" : textInputProps.autoCapitalize
              }
              autoCorrect={isPassword ? false : textInputProps.autoCorrect}
              {...textInputProps}
            />
          )}
        />

        {isPassword ? (
          <Feather
            name={hidden ? "eye-off" : "eye"}
            size={scale(18)}
            color={colors.text2}
            style={styles.rightIcon}
            onPress={() => setHidden((h) => !h)}
            suppressHighlighting
          />
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColorsV2>) =>
  StyleSheet.create({
    group: {
      width: "100%",
      marginBottom: verticalScale(16),
    },
    label: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      color: colors.text,
      marginBottom: verticalScale(6),
    },
    inputWrapper: {
      width: "100%",
      minHeight: verticalScale(48),
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: scale(12),
      paddingHorizontal: scale(14),
      backgroundColor: colors.card,
    },
    inputWrapperError: {
      borderColor: colors.error.solid,
    },
    input: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: scale(15),
      color: colors.text,
      paddingVertical: verticalScale(10),
    },
    leftIcon: {
      marginRight: scale(10),
    },
    rightIcon: {
      marginLeft: scale(8),
      padding: scale(2),
    },
    errorText: {
      fontFamily: FONTS.regular,
      fontSize: scale(12),
      color: colors.error.text,
      marginTop: verticalScale(4),
    },
  });
