import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { closeSheet, openSheet } from "@/store/sheetStore";
import { useColorsV2 } from "@/store/themeStore";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";
import AddActivitySheet, { ADD_ACTIVITY_SHEET_SNAP } from "./AddActivitySheet";
import type { ActivityActionId } from "./types";

/** Same emphasized curve as the timeline accordions — one motion language. */
const EASE = Easing.bezier(0.2, 0, 0, 1);
const ENTER_MS = 200;
const EXIT_MS = 160;

type ComposerMode = "idle" | "comment";

interface GroupBottomComposerProps {
  /** Fired with trimmed, non-empty text. The composer clears itself. */
  onSendComment?: (text: string) => void;
  /** Navigation into the add-expense flow. Wired later. */
  onAddExpense?: () => void;
  /** Navigation into the record-settlement flow. Wired later. */
  onRecordSettlement?: () => void;
}

/**
 * The Group Bottom Composer — the timeline's single point of contribution,
 * pinned beneath the inverted FlashList.
 *
 * Two verbs, two controls, deliberately NOT one message box:
 *
 *   comments  → the quiet pill on the left. It supports the discussion.
 *   money     → the loud gradient "Add Activity" pill on the right. It IS
 *               the screen's primary action, and it looks like it.
 *
 * Idle, both are visible. Tapping the comment pill morphs the row: the
 * input takes the full width, the money button folds away, a Send button
 * fades in — one continuous width/fade/scale composition, never a layout
 * swap. Blur with an empty draft and the row breathes back to idle; a
 * non-empty draft keeps Comment Mode alive so nothing typed is ever lost.
 *
 * Performance: all text state lives HERE, below the FlashList — keystrokes
 * never re-render a single timeline row. The component is memoized and its
 * transition runs entirely on the UI thread via Reanimated.
 */
const GroupBottomComposer = ({
  onSendComment,
  onAddExpense,
  onRecordSettlement,
}: GroupBottomComposerProps) => {
  const colors = useColorsV2();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const reducedMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();

  const [mode, setMode] = useState<ComposerMode>("idle");
  const [text, setText] = useState("");

  const inputRef = useRef<TextInput>(null);
  // Mirror for the keyboard listener, so it never re-subscribes per keystroke.
  const textRef = useRef("");
  textRef.current = text;

  // Spec: the primary CTA owns ~35–40% of the row while idle.
  const activityWidth = Math.round((windowWidth - Dimens.lg * 2) * 0.38);
  const sendSize = scale(44);
  // scale() is a plain JS function and cannot run inside a worklet, so any
  // scaled constant an animated style needs is computed here on the JS
  // thread and captured as a number.
  const activityDriftX = scale(10);

  /* ------------------------- mode transition ------------------------- */

  const progress = useSharedValue(0); // 0 = idle, 1 = comment

  useEffect(() => {
    progress.value = withTiming(mode === "comment" ? 1 : 0, {
      duration: reducedMotion ? 0 : mode === "comment" ? ENTER_MS : EXIT_MS,
      easing: EASE,
    });
  }, [mode, progress, reducedMotion]);

  // The money button folds away: width collapses (clipping, not squishing —
  // the inner button keeps its natural width), while it fades, shrinks a
  // touch and drifts right. Reversing the same curve brings it back.
  const activityWrapStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [activityWidth, 0]),
    marginLeft: interpolate(progress.value, [0, 1], [Dimens.sm, 0]),
    opacity: interpolate(
      progress.value,
      [0, 0.55],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 0.92]) },
      { translateX: interpolate(progress.value, [0, 1], [0, activityDriftX]) },
    ],
  }));

  // Send arrives in the second half of the same gesture.
  const sendWrapStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, sendSize]),
    marginLeft: interpolate(progress.value, [0, 1], [0, Dimens.sm]),
    opacity: interpolate(
      progress.value,
      [0.45, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0.45, 1],
          [0.7, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  /* --------------------------- comment mode -------------------------- */

  const enterCommentMode = useCallback(() => {
    setMode("comment");
    // The input is always mounted and always editable (the idle overlay is
    // what blocks touches), so focus() lands synchronously — Android drops
    // focus() on a TextInput whose native editable flag is still false.
    inputRef.current?.focus();
  }, []);

  const exitIfEmpty = useCallback(() => {
    if (!textRef.current.trim()) setMode("idle");
  }, []);

  // Android back button hides the keyboard without blurring the input —
  // treat it exactly like a blur so the row still returns to idle.
  useEffect(() => {
    if (mode !== "comment") return;
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      inputRef.current?.blur();
      exitIfEmpty();
    });
    return () => sub.remove();
  }, [mode, exitIfEmpty]);

  const canSend = text.trim().length > 0;

  const handleSend = useCallback(() => {
    const trimmed = textRef.current.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSendComment?.(trimmed);
    // Chat convention: clear the draft, keep the keyboard up for the next one.
    setText("");
  }, [onSendComment]);

  /* --------------------------- add activity -------------------------- */

  const handleActivitySelect = useCallback(
    (id: ActivityActionId) => {
      closeSheet();
      if (id === "expense") onAddExpense?.();
      else onRecordSettlement?.();
    },
    [onAddExpense, onRecordSettlement],
  );

  const openActivitySheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    openSheet(<AddActivitySheet onSelect={handleActivitySelect} />, {
      snapPoints: [ADD_ACTIVITY_SHEET_SNAP],
    });
  }, [handleActivitySelect]);

  /* ------------------------------ render ----------------------------- */

  return (
    <View style={styles.container}>
      {/* Comment pill. The input is always mounted so entering Comment
          Mode is a focus, not a remount — that's what keeps the morph
          continuous. While idle a full-size overlay makes it behave like
          a button, exactly as specced. */}
      <View style={styles.pill}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          multiline
          placeholder={
            mode === "comment" ? "Type a comment..." : "Add a comment..."
          }
          placeholderTextColor={colors.text3}
          onFocus={enterCommentMode}
          onBlur={exitIfEmpty}
          accessibilityLabel="Comment"
          maxLength={1000}
        />
        {mode === "idle" && (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={enterCommentMode}
            accessibilityRole="button"
            accessibilityLabel="Add a comment"
            accessibilityHint="Opens the comment box"
          />
        )}
      </View>

      {/* 💰 Add Activity — the screen's primary CTA. */}
      <Animated.View style={[styles.activityWrap, activityWrapStyle]}>
        <Pressable
          style={({ pressed }) => [
            styles.activityPressable,
            { width: activityWidth },
            pressed && styles.activityPressed,
          ]}
          android_ripple={{ color: colors.ripple, foreground: true }}
          onPress={openActivitySheet}
          accessibilityRole="button"
          accessibilityLabel="Add activity"
          accessibilityHint="Add an expense or record a settlement"
        >
          <LinearGradient
            colors={colors.brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activityGradient}
          >
            <Ionicons
              name="wallet-outline"
              size={scale(16)}
              color={colors.white}
            />
            <Text
              style={styles.activityLabel}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              Add Activity
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Send — only meaningful in Comment Mode, disabled until there's text. */}
      <Animated.View style={[styles.sendWrap, sendWrapStyle]}>
        <Pressable
          style={[
            styles.sendButton,
            { width: sendSize, height: sendSize, borderRadius: sendSize / 2 },
            !canSend && styles.sendDisabled,
          ]}
          android_ripple={{ color: colors.ripple, foreground: true }}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send comment"
          accessibilityState={{ disabled: !canSend }}
        >
          <Feather name="send" size={scale(17)} color={colors.white} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: Dimens.lg,
      paddingTop: Dimens.sm,
      paddingBottom: Dimens.sm,
      backgroundColor: colors.page,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    pill: {
      flex: 1,
      minHeight: scale(50),
      maxHeight: scale(112),
      borderRadius: Dimens.radiusPill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: Dimens.lg,
      justifyContent: "center",
    },
    input: {
      fontFamily: FONTS.regular,
      fontSize: scale(14),
      color: colors.text,
      paddingVertical: scale(13),
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    activityWrap: {
      overflow: "hidden",
      borderRadius: Dimens.radiusPill,
    },
    activityPressable: {
      height: scale(50),
      borderRadius: Dimens.radiusPill,
      overflow: "hidden", // keeps the Android ripple inside the pill
    },
    activityPressed: {
      opacity: 0.9,
    },
    activityGradient: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Dimens.xs,
      paddingHorizontal: Dimens.sm,
    },
    activityLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(12.5),
      lineHeight: scale(15),
      color: colors.white,
      includeFontPadding: false,
      flexShrink: 1,
      textAlign: "center",
    },
    sendWrap: {
      overflow: "hidden",
      // Optically center the 44dp circle against the 50dp pill.
      marginBottom: scale(3),
    },
    sendButton: {
      backgroundColor: colors.brand,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    sendDisabled: {
      opacity: 0.45,
    },
  });

export default memo(GroupBottomComposer);
