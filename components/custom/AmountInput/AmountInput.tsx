import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import {
  fromRaw,
  rawToMinorUnits,
  rawToValue,
  sanitizeFull,
  type CurrencyConfig,
} from "@/utils/amountFormat";
import * as Haptics from "expo-haptics";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform, StyleSheet, Text, TextInput } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";

/**
 * AmountInput — the amount as the interface.
 *
 * A controlled TextInput with a native cursor that can never hold an invalid
 * value. Like GenericTabSwitcher / ActionFilterChips, it is fully generic: it
 * has no currency knowledge of its own — symbol, decimal digits, and locale
 * all arrive via the `currency` prop, and swapping that prop mid-flow
 * re-clamps and re-formats the entered value in place (INR 123.45 → JPY 123).
 *
 * Architecture:
 * - utils/amountFormat.ts owns every rule (sanitize, grouping, clamping).
 *   This file only bridges native edit events to that engine and renders the
 *   result. The engine is pure and unit-tested (utils/amountFormat.test.ts).
 * - Each onChangeText re-derives the value from the WHOLE native text via
 *   sanitizeFull() and commits it as the controlled `value`. It is NOT a diff
 *   against the previous text: on Android a fast typist queues several native
 *   change events before React can commit a render, and a diff-based engine
 *   misreads that batch (scrambled digits, cursor jumping behind). Whole-string
 *   sanitize is order-independent, so every event is self-consistent.
 * - The caret is left to the OS. We never control `selection`; while appending
 *   (the entire interaction) native keeps the cursor at the end, and never
 *   fighting native is exactly what removes the jump. Trade-off: editing in the
 *   middle of the number re-lands the caret at the end — acceptable for a pad.
 * - Rejected edits (integer-digit overflow) revert native text via a render
 *   tick, shake 6dp, and fire a warning haptic. Over-precision digits and
 *   dead keys are silent no-ops — there are no error states to render, ever.
 * - JPY-style currencies get a pure number pad: the decimal key doesn't exist.
 */

export interface AmountChange {
  /** Canonical string, "." decimal — safe to persist in a draft store. */
  raw: string;
  /** What the user sees, e.g. "12,34,567.50". */
  formatted: string;
  /** Convenience float for display logic. Not for money math. */
  value: number | null;
  /** Integer minor units (paise / fils) — what VyayCore stores. */
  minorUnits: number;
  /** True once the amount is submittable (> 0). */
  isPositive: boolean;
}

interface AmountInputProps {
  currency: CurrencyConfig;
  /** Canonical raw seed, e.g. "1250.50" when editing an existing expense. */
  initialRaw?: string;
  onChangeAmount?: (change: AmountChange) => void;
  /** Fired on the keyboard's done/return key. */
  onSubmit?: () => void;
  autoFocus?: boolean;
  testID?: string;
}

interface AmountState {
  raw: string;
  text: string;
  /** Bumped to force a re-render (and native text resync) on rejected edits. */
  tick: number;
}

/**
 * The amount steps down as it grows so it never wraps or clips. Only the type
 * scale moves — layout stays perfectly still. Poppins needs the generous
 * line-height (1.3) or Android clips its ascenders at these sizes.
 */
const TYPE_SCALE = [
  { maxChars: 7, size: 52 },
  { maxChars: 10, size: 42 },
  { maxChars: 13, size: 34 },
  { maxChars: Number.POSITIVE_INFINITY, size: 27 },
] as const;

const stepFor = (text: string) =>
  TYPE_SCALE.find((t) => text.length <= t.maxChars) ??
  TYPE_SCALE[TYPE_SCALE.length - 1];

const AmountInput = forwardRef<TextInput, AmountInputProps>(
  (
    {
      currency,
      initialRaw,
      onChangeAmount,
      onSubmit,
      autoFocus = true,
      testID = "amount-input",
    },
    ref,
  ) => {
    const colors = useColorsV2();
    const styles = getStyles(colors);

    const [state, setState] = useState<AmountState>(() => {
      const seed = fromRaw(initialRaw ?? "", currency);
      return {
        raw: seed.raw,
        text: seed.formatted,
        tick: 0,
      };
    });

    // Latest state/props for event handlers without re-binding.
    const stateRef = useRef(state);
    stateRef.current = state;
    const changeRef = useRef(onChangeAmount);
    changeRef.current = onChangeAmount;

    const emit = useCallback(
      (raw: string, formatted: string) => {
        const value = rawToValue(raw);
        changeRef.current?.({
          raw,
          formatted,
          value,
          minorUnits: rawToMinorUnits(raw, currency.decimalDigits),
          isPositive: (value ?? 0) > 0,
        });
      },
      [currency.decimalDigits],
    );

    // Announce the seeded value once so the parent's CTA state is correct.
    useEffect(() => {
      emit(stateRef.current.raw, stateRef.current.text);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Currency switched mid-flow (from the currency sheet): re-clamp and
    // re-format the entered value instead of clearing it.
    const currencyKey = `${currency.code}|${currency.decimalDigits}|${currency.locale}`;
    const prevCurrencyKey = useRef(currencyKey);
    useEffect(() => {
      if (prevCurrencyKey.current === currencyKey) return;
      prevCurrencyKey.current = currencyKey;
      const seed = fromRaw(stateRef.current.raw, currency);
      setState((s) => ({
        raw: seed.raw,
        text: seed.formatted,
        tick: s.tick,
      }));
      emit(seed.raw, seed.formatted);
    }, [currencyKey, currency, emit]);

    // Rejection feedback: 6dp shake + warning haptic, value untouched.
    const shakeX = useSharedValue(0);
    const shakeStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shakeX.value }],
    }));

    const rejectEdit = useCallback(() => {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 40 }),
        withTiming(6, { duration: 60 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 40 }),
      );
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      ).catch(() => {});
      // Same text, new tick → re-render → RN resyncs native text to state.text.
      setState((s) => {
        const next = { ...s, tick: s.tick + 1 };
        stateRef.current = next;
        return next;
      });
    }, [shakeX]);

    // The edit pipeline. We re-derive the value from the WHOLE native text
    // (sanitizeFull) rather than diffing against the previous value: a fast
    // typist queues several native onChangeText events before React can commit
    // a render, and a diff-based engine misreads that batch (scrambled digits,
    // caret drift). Sanitizing the full string is order-independent, so every
    // event is self-consistent. We deliberately do NOT control `selection` —
    // the OS keeps the caret at the end while appending, which is the entire
    // interaction, and never fighting native is what kills the cursor jump.
    const handleChangeText = useCallback(
      (nextText: string) => {
        const prev = stateRef.current;
        if (nextText === prev.text) return;
        const result = sanitizeFull(nextText, currency);
        if (result === null) {
          rejectEdit();
          return;
        }
        const next: AmountState = {
          raw: result.raw,
          text: result.formatted,
          tick: prev.tick,
        };
        // Keep the ref current synchronously so a batched follow-up event's
        // `nextText === prev.text` short-circuit compares against this result.
        stateRef.current = next;
        setState(next);
        if (result.raw !== prev.raw) emit(result.raw, result.formatted);
      },
      [currency, emit, rejectEdit],
    );

    const step = stepFor(state.text);

    return (
      <Animated.View style={[styles.row, shakeStyle]}>
        <Text
          style={[
            styles.symbol,
            {
              fontSize: scale(step.size * 0.5),
              // Optical alignment to the digits' cap height.
              marginTop: scale(step.size * 0.16),
            },
          ]}
          maxFontSizeMultiplier={1.2}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {currency.symbol}
        </Text>
        <TextInput
          ref={ref}
          testID={testID}
          value={state.text}
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmit}
          // Zero-decimal currencies get a pure number pad — no decimal key.
          keyboardType={currency.decimalDigits > 0 ? "decimal-pad" : "number-pad"}
          inputMode={currency.decimalDigits > 0 ? "decimal" : "numeric"}
          returnKeyType="done"
          autoFocus={autoFocus}
          placeholder="0"
          placeholderTextColor={colors.text3}
          selectionColor={colors.brand}
          cursorColor={colors.brand}
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize="none"
          importantForAutofill="no"
          maxFontSizeMultiplier={1.2}
          accessibilityLabel={`Amount in ${currency.code}`}
          style={[
            styles.input,
            {
              fontSize: scale(step.size),
              lineHeight: scale(step.size * 1.3),
            },
          ]}
        />
      </Animated.View>
    );
  },
);

AmountInput.displayName = "AmountInput";

export default AmountInput;

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    symbol: {
      fontFamily: FONTS.medium,
      color: colors.text2,
      marginRight: scale(6),
      ...Platform.select({ android: { includeFontPadding: false } }),
    },
    input: {
      fontFamily: FONTS.bold,
      color: colors.text,
      padding: 0,
      margin: 0,
      textAlign: "left",
      flexShrink: 1,
      ...Platform.select({ android: { includeFontPadding: false } }),
    },
  });
