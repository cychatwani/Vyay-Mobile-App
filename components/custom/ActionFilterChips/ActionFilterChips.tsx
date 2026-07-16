import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
    LayoutChangeEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { scale } from "react-native-size-matters";

/**
 * ActionFilterChips — generic, controlled, single-select chip group.
 *
 * The chip equivalent of GenericTabSwitcher: it has no idea what its chips
 * mean. It renders them, animates the active selection, and calls
 * `onChange(id)`. Selection state, and whatever reacts to it (fetches,
 * stores, params), belongs entirely to the parent.
 *
 * Variants (mirrors GenericTabSwitcher's unified/separated split):
 * - "connected" (default): chips share one card track; a brand indicator
 *   slides/resizes behind the active chip.
 * - "cards": no shared track. Each chip is its own independent card with
 *   its own background and shadow; the active chip animates its own
 *   background/shadow/scale in place. No indicator, no rect tracking.
 *
 * Layouts (independent of variant):
 * - "scroll" (default): single horizontally-scrollable row.
 * - "wrap": chips flow onto multiple rows.
 *
 * Sizing:
 * - `span` gives a chip a grid-style width: span × SPAN_UNIT plus the gaps
 *   it absorbs, so two span-1 chips + one gap align exactly with one span-2
 *   chip on the row below. Omit `span` for content-sized chips.
 */

export type ActionFilterChip<T extends string> = {
  id: T;
  label: string;
  /** Grid-style width multiplier. Omit to size the chip to its content. */
  span?: 1 | 2 | 3 | 4;
};

export type ActionFilterChipsLayout = "scroll" | "wrap";
export type ActionFilterChipsVariant = "connected" | "cards";

interface ActionFilterChipsProps<T extends string> {
  items: readonly ActionFilterChip<T>[];
  value: T;
  onChange: (id: T) => void;
  layout?: ActionFilterChipsLayout;
  variant?: ActionFilterChipsVariant;
}

type ChipRect = { x: number; y: number; width: number; height: number };

const SPAN_UNIT = scale(64);
const GAP = scale(6);
const TRACK_PADDING = scale(3);

const SPRING = { damping: 20, stiffness: 200 };
const FADE_OUT_MS = 90;
const FADE_IN_MS = 120;
/** Rects on (approximately) the same y live on the same row. */
const SAME_ROW_EPSILON = 2;

function ActionFilterChips<T extends string>({
  items,
  value,
  onChange,
  layout = "scroll",
  variant = "connected",
}: ActionFilterChipsProps<T>) {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const handlePress = (id: T) => {
    if (id === value) return; // redundant reselect — no haptic, no onChange
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(id);
  };

  const spanWidth = (span: 1 | 2 | 3 | 4) =>
    span * SPAN_UNIT + (span - 1) * GAP;

  /* ==================================================================== *
   * VARIANT: "cards" — independent per-chip cards, no shared track/indicator
   * ==================================================================== */

  if (variant === "cards") {
    const content = (
      <View style={[styles.cardsRow, layout === "wrap" && styles.wrapContent]}>
        {items.map((item) => (
          <Chip
            key={item.id}
            item={item}
            isActive={item.id === value}
            colors={colors}
            styles={styles}
            width={item.span ? spanWidth(item.span) : undefined}
            onPress={() => handlePress(item.id)}
          />
        ))}
      </View>
    );

    if (layout === "wrap") return content;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  /* ==================================================================== *
   * VARIANT: "connected" — shared card track, sliding brand indicator
   * ==================================================================== */

  const [rects, setRects] = useState<Partial<Record<T, ChipRect>>>({});

  const onChipLayout = (id: T) => (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setRects((prev) => {
      const r = prev[id];
      if (
        r &&
        Math.abs(r.x - x) < 0.5 &&
        Math.abs(r.y - y) < 0.5 &&
        Math.abs(r.width - width) < 0.5 &&
        Math.abs(r.height - height) < 0.5
      ) {
        return prev; // unchanged — don't churn state
      }
      return { ...prev, [id]: { x, y, width, height } };
    });
  };

  const ix = useSharedValue(0);
  const iy = useSharedValue(0);
  const iw = useSharedValue(0);
  const ih = useSharedValue(0);
  const iOpacity = useSharedValue(0);
  const iScale = useSharedValue(1);

  const prevRectRef = useRef<ChipRect | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const viewportW = useRef(0);
  const contentW = useRef(0);

  const centerChip = (rect: ChipRect) => {
    if (!scrollRef.current || viewportW.current <= 0) return;
    const maxX = Math.max(0, contentW.current - viewportW.current);
    const target = Math.min(
      maxX,
      Math.max(0, rect.x + rect.width / 2 - viewportW.current / 2),
    );
    scrollRef.current.scrollTo({ x: target, animated: true });
  };

  useEffect(() => {
    const rect = rects[value];

    if (!rect) {
      if (prevRectRef.current) {
        iOpacity.value = withTiming(0, { duration: FADE_OUT_MS });
        prevRectRef.current = null;
      }
      return;
    }

    const prev = prevRectRef.current;
    prevRectRef.current = rect;

    if (!prev) {
      ix.value = rect.x;
      iy.value = rect.y;
      iw.value = rect.width;
      ih.value = rect.height;
      iScale.value = 1;
      iOpacity.value = withTiming(1, { duration: FADE_IN_MS });
    } else if (Math.abs(rect.y - prev.y) < SAME_ROW_EPSILON) {
      iOpacity.value = withTiming(1, { duration: FADE_IN_MS });
      ix.value = withSpring(rect.x, SPRING);
      iw.value = withSpring(rect.width, SPRING);
      iy.value = rect.y;
      ih.value = rect.height;
    } else {
      iOpacity.value = withSequence(
        withTiming(0, { duration: FADE_OUT_MS }),
        withTiming(1, { duration: FADE_IN_MS }),
      );
      ix.value = withDelay(FADE_OUT_MS, withTiming(rect.x, { duration: 0 }));
      iy.value = withDelay(FADE_OUT_MS, withTiming(rect.y, { duration: 0 }));
      iw.value = withDelay(
        FADE_OUT_MS,
        withTiming(rect.width, { duration: 0 }),
      );
      ih.value = withDelay(
        FADE_OUT_MS,
        withTiming(rect.height, { duration: 0 }),
      );
      iScale.value = withDelay(
        FADE_OUT_MS,
        withSequence(withTiming(0.94, { duration: 0 }), withSpring(1, SPRING)),
      );
    }

    if (layout === "scroll") {
      centerChip(rect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, rects, layout]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: iw.value,
    height: ih.value,
    opacity: iOpacity.value,
    transform: [
      { translateX: ix.value },
      { translateY: iy.value },
      { scale: iScale.value },
    ],
  }));

  const renderConnectedChips = () => (
    <>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {items.map((item) => {
        const isActive = item.id === value;
        return (
          <Pressable
            key={item.id}
            onLayout={onChipLayout(item.id)}
            onPress={() => handlePress(item.id)}
            style={[
              styles.chip,
              item.span
                ? { width: spanWidth(item.span) }
                : styles.chipAutoWidth,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.chipText, isActive && styles.chipTextActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </>
  );

  if (layout === "wrap") {
    return (
      <View style={styles.track}>
        <View style={[styles.content, styles.wrapContent]}>
          {renderConnectedChips()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.track}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => {
          viewportW.current = e.nativeEvent.layout.width;
        }}
        onContentSizeChange={(w) => {
          contentW.current = w;
        }}
      >
        <View style={styles.content}>{renderConnectedChips()}</View>
      </ScrollView>
    </View>
  );
}

export default ActionFilterChips;

/* ======================================================================== *
 * "cards" variant sub-component — owns its own activation animation.
 * Split out because each chip needs its own shared values; can't call
 * hooks inside the parent's .map().
 * ======================================================================== */

function Chip<T extends string>({
  item,
  isActive,
  colors,
  styles,
  width,
  onPress,
}: {
  item: ActionFilterChip<T>;
  isActive: boolean;
  colors: ThemePaletteV2;
  styles: ReturnType<typeof getStyles>;
  width?: number;
  onPress: () => void;
}) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, SPRING);
  }, [isActive, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.brand : colors.card,
    shadowOpacity: 0.08 + progress.value * 0.27, // 0.08 -> 0.35
    shadowColor: progress.value > 0.5 ? colors.brand : colors.black,
    elevation: 2 + progress.value * 2, // 2 -> 4
    transform: [{ scale: 1 + progress.value * 0.03 }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: progress.value > 0.5 ? colors.white : colors.text2,
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[styles.cardChip, animatedStyle, width ? { width } : null]}
      >
        <Animated.Text numberOfLines={1} style={[styles.chipText, textStyle]}>
          {item.label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    // --- "connected" variant ---
    track: {
      backgroundColor: colors.card,
      borderRadius: scale(25),
      padding: TRACK_PADDING,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.08,
      shadowRadius: scale(4),
      elevation: 2,
    },
    content: {
      flexDirection: "row",
      gap: GAP,
      position: "relative",
    },
    wrapContent: {
      flexWrap: "wrap",
    },
    indicator: {
      position: "absolute",
      left: 0,
      top: 0,
      backgroundColor: colors.brand,
      borderRadius: scale(16),
      shadowColor: colors.brand,
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.35,
      shadowRadius: scale(5),
      elevation: 4,
    },
    chip: {
      minHeight: scale(30),
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(7),
      borderRadius: scale(16),
      zIndex: 1,
    },
    chipAutoWidth: {
      paddingHorizontal: scale(14),
    },
    chipText: {
      fontSize: scale(13),
      fontFamily: FONTS.medium,
      color: colors.text2,
    },
    chipTextActive: {
      color: colors.white,
    },

    // --- "cards" variant ---
    cardsRow: {
      flexDirection: "row",
      gap: GAP,
    },
    cardChip: {
      minHeight: scale(30),
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(7),
      paddingHorizontal: scale(14),
      borderRadius: scale(16),
      backgroundColor: colors.card,
      shadowOffset: { width: 0, height: scale(2) },
      shadowRadius: scale(4),
    },
  });
