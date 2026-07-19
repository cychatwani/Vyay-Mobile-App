import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import AmountInput, {
  type AmountChange,
} from "@/components/custom/AmountInput/AmountInput";
import SafeView from "@/components/custom/SafeView/SafeView";
import FormButton from "@/components/ui/FormButton";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useExpenseDraftStore } from "@/store/expenseDraftStore";
import { useColorsV2 } from "@/store/themeStore";
import { CURRENCIES } from "@/utils/amountFormat";

/**
 * Enter Amount — step 1 of the create-expense flow.
 *
 * One job: capture an amount with zero cognitive load. Three quiet layers
 * around one loud element —
 *
 *   ┌──────────────────────────────┐
 *   │  ✕         Add expense       │  header: exit + context, nothing else
 *   │                              │
 *   │         ₹ 12,34,567          │  the amount IS the interface
 *   │           ( INR ⌄ )          │  currency chip → sheet via openSheet()
 *   │                              │
 *   │  ┌────────────────────────┐  │
 *   │  │          Next          │  │  FormButton pinned above the keyboard
 *   │  └────────────────────────┘  │
 *   └──────────────────────────────┘
 *
 * No labels, no helper text, no inline errors: invalid input is structurally
 * impossible (AmountInput + utils/amountFormat), so there is nothing to
 * explain. The keyboard stays up for the whole screen — tapping anywhere in
 * the stage refocuses the input rather than dismissing.
 */
export default function EnterAmountScreen() {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  // TODO(flow): derive from the group the user is adding the expense to
  // (group currency lives on the group entity; currencySymbolFor() in
  // SettlementSuggestions/settlementUtils resolves symbols the same way).
  const currency = CURRENCIES.INR;

  const setDraftAmount = useExpenseDraftStore((s) => s.setAmount);
  const amountRaw = useExpenseDraftStore((s) => s.amountRaw);

  const inputRef = useRef<TextInput>(null);
  const [amount, setAmount] = useState<AmountChange | null>(null);
  const canContinue = amount?.isPositive === true;

  const onCurrencyPress = useCallback(() => {
    // Integration point — same pattern as FilterSheet on groupDetail:
    // openSheet(<CurrencyPickerSheet selected={currency.code} onSelect={...} />);
    // AmountInput re-clamps + re-formats in place when the prop changes.
  }, []);

  const onNext = useCallback(() => {
    if (!amount?.isPositive) return;
    setDraftAmount({
      minorUnits: amount.minorUnits, // integer paise — never the float
      raw: amount.raw,
      currency: currency.code,
    });
    // TODO(flow): router.push("/(expense)/expenseDetails") once step 2 lands.
  }, [amount, currency.code, setDraftAmount]);

  return (
    <SafeView
      statusBarColor={colors.page}
      statusBarStyle="dark-content"
      footerColor={colors.page}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header — exit + context, optically centered title */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.headerButton}
          >
            <Feather name="x" size={scale(22)} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Add expense</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Stage — the whole middle of the screen is the field */}
        <Pressable
          style={styles.stage}
          onPress={() => inputRef.current?.focus()}
          accessible={false}
        >
          <AmountInput
            ref={inputRef}
            currency={currency}
            initialRaw={amountRaw ?? undefined}
            onChangeAmount={setAmount}
            onSubmit={onNext}
            autoFocus
          />

          <Pressable
            onPress={onCurrencyPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Currency: ${currency.code}. Change currency`}
            android_ripple={{ color: colors.ripple }}
            style={({ pressed }) => [
              styles.currencyChip,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.currencyChipText}>{currency.code}</Text>
            <Feather
              name="chevron-down"
              size={scale(14)}
              color={colors.text2}
              style={styles.currencyChipIcon}
            />
          </Pressable>
        </Pressable>

        {/* CTA — pinned above the keyboard */}
        <View style={styles.footer}>
          <FormButton label="Next" onPress={onNext} disabled={!canContinue} />
        </View>
      </KeyboardAvoidingView>
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
      paddingBottom: verticalScale(6),
    },
    headerButton: {
      width: scale(36),
      height: scale(36),
      alignItems: "flex-start",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: FONTS.medium,
      fontSize: scale(14),
      color: colors.text2,
    },
    stage: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(24),
    },
    currencyChip: {
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      marginTop: verticalScale(16),
      paddingVertical: verticalScale(5),
      paddingHorizontal: scale(14),
      borderRadius: Dimens.radiusPill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    currencyChipText: {
      fontFamily: FONTS.medium,
      fontSize: scale(13),
      letterSpacing: 0.4,
      color: colors.text,
    },
    currencyChipIcon: {
      marginLeft: scale(4),
    },
    footer: {
      paddingHorizontal: Dimens.screenH,
      paddingTop: verticalScale(6),
      paddingBottom: verticalScale(10),
    },
    pressed: {
      opacity: 0.7,
    },
  });
