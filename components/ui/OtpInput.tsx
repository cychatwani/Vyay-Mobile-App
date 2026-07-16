import React, { useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { scale, verticalScale } from "react-native-size-matters";

import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";

type OtpInputProps = {
  value: string;
  onChange: (code: string) => void;
  /** Fired once when the code reaches cellCount digits. */
  onFulfill?: (code: string) => void;
  cellCount?: number;
  error?: string | null;
  autoFocus?: boolean;
  disabled?: boolean;
};

/**
 * Reusable OTP input on react-native-confirmation-code-field.
 *
 * Owns only presentation and focus mechanics — verification state (loading,
 * error copy, resend timing) belongs to the screen using it, which is what
 * keeps this reusable for any future OTP flow (phone verification, 2FA).
 */
export default function OtpInput({
  value,
  onChange,
  onFulfill,
  cellCount = 6,
  error,
  autoFocus = true,
  disabled = false,
}: OtpInputProps) {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  const ref = useBlurOnFulfill({ value, cellCount });

  /**
   * useClearByFocusCell keys an internal effect on the identity of
   * `setValue`. If the caller passes an inline arrow function (a fresh
   * reference every render — the normal, expected way to write an
   * onChange handler), that effect refires every render, which calls
   * setValue, which re-renders, which creates a new reference... an
   * infinite loop that crashes with "Maximum update depth exceeded" the
   * moment the code fills in.
   *
   * Fixing this by asking every consumer to useCallback their handlers is
   * fragile — one un-memoized call site anywhere in the app silently
   * reintroduces the crash. Instead this component stabilizes the
   * reference itself: the ref always holds the latest onChange, and the
   * function identity handed to the library never changes.
   */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const stableSetValue = useCallback((v: string) => {
    onChangeRef.current(v);
  }, []);

  const onFulfillRef = useRef(onFulfill);
  onFulfillRef.current = onFulfill;

  const [codeFieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: stableSetValue,
  });

  const handleChange = useCallback(
    (code: string) => {
      onChangeRef.current(code);
      if (code.length === cellCount) {
        onFulfillRef.current?.(code);
      }
    },
    [cellCount],
  );

  return (
    <View>
      <CodeField
        ref={ref}
        {...codeFieldProps}
        value={value}
        onChangeText={handleChange}
        cellCount={cellCount}
        rootStyle={styles.root}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        editable={!disabled}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            style={[
              styles.cell,
              symbol ? styles.cellFilled : null,
              isFocused ? styles.cellFocused : null,
              error ? styles.cellError : null,
            ]}
          >
            <Text style={styles.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColorsV2>) =>
  StyleSheet.create({
    root: {
      justifyContent: "center",
      gap: scale(8),
    },
    cell: {
      width: scale(46),
      height: scale(56),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    cellFilled: {
      borderColor: colors.text3,
    },
    /**
     * Focus ring, Stripe-style: the border swaps to brand and a soft same-hue
     * glow lifts the active cell without moving the layout.
     */
    cellFocused: {
      borderWidth: 2,
      borderColor: colors.brand,
      shadowColor: colors.brand,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: scale(6),
      elevation: 3,
    },
    cellError: {
      borderColor: colors.error.solid,
    },
    cellText: {
      fontFamily: FONTS.bold,
      fontSize: scale(22),
      color: colors.text,
    },
    errorText: {
      fontFamily: FONTS.regular,
      fontSize: scale(13),
      color: colors.error.text,
      textAlign: "center",
      marginTop: verticalScale(12),
    },
  });
