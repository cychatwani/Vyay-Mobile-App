import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** Material "emphasized" curve — same feel as the Member Balances card. */
const EASE = Easing.bezier(0.2, 0, 0, 1);
const OPEN_MS = 340;
const CLOSE_MS = 260;
const RESIZE_MS = 240;

/**
 * The expand/collapse engine shared by every financial timeline card.
 *
 * Same motion vocabulary as MemberBalances (measured height, emphasized
 * ease, content that rises into place, rotating chevron) — but built for
 * a recycling FlashList:
 *
 *   • expansion is CONTROLLED. The list owns which ids are open, the card
 *     only receives `expanded`. Recycled components can't leak open state
 *     onto the wrong event.
 *   • when the hook detects it has been recycled onto a different item
 *     (`itemId` changed) it snaps to the new state instead of animating,
 *     and re-measures the new content.
 */
export const useTimelineAccordion = (itemId: string, expanded: boolean) => {
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(expanded ? 1 : 0);
  const contentHeight = useSharedValue(0);
  const hasMeasured = useRef(false);
  const boundId = useRef(itemId);

  // Recycled onto another event mid-render: snap, never animate.
  if (boundId.current !== itemId) {
    boundId.current = itemId;
    hasMeasured.current = false;
    contentHeight.value = 0;
    progress.value = expanded ? 1 : 0;
  }

  // Controlled state changed (user toggled) — glide. Animating to the value
  // it already holds (mount, recycle) is a no-op.
  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: reducedMotion ? 0 : expanded ? OPEN_MS : CLOSE_MS,
      easing: EASE,
    });
  }, [expanded, progress, reducedMotion]);

  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (!hasMeasured.current) {
      hasMeasured.current = true;
      contentHeight.value = h; // first measurement snaps — no mount animation
    } else if (Math.abs(contentHeight.value - h) > 0.5) {
      contentHeight.value = withTiming(h, {
        duration: reducedMotion ? 0 : RESIZE_MS,
        easing: EASE,
      });
    }
  };

  const collapseStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
  }));

  // Expanded content doesn't just appear — it rises into place.
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.35, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [10, 0]) }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  /** Card-standard haptic: light tap on open, soft exhale on close. */
  const toggleHaptic = (opening: boolean) => {
    Haptics.impactAsync(
      opening
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Soft,
    ).catch(() => {});
  };

  return {
    collapseStyle,
    contentStyle,
    chevronStyle,
    onContentLayout,
    toggleHaptic,
  };
};
