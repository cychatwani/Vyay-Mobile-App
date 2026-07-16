import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { avatarTint, initialsOf } from "./balanceUtils";

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string;
  /** Diameter in already-scaled px. */
  size: number;
  /**
   * Ring color for overlapping facepiles (usually the card surface) so
   * stacked avatars read as separate circles.
   */
  ringColor?: string;
}

/**
 * Circular member avatar. Photos load through expo-image with a soft
 * cross-fade; members without a photo get initials on a deterministic
 * brand-hue wash, so the same person is always the same color.
 */
const MemberAvatar = ({ name, avatarUrl, size, ringColor }: MemberAvatarProps) => {
  const colors = useColorsV2();
  const tint = avatarTint(name, colors);

  const shape = {
    width: size,
    height: size,
    borderRadius: size / 2,
  } as const;

  const ring = ringColor
    ? { borderWidth: 2, borderColor: ringColor }
    : null;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[shape, ring]}
        contentFit="cover"
        transition={150}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={[styles.fallback, shape, ring, { backgroundColor: tint.bg }]}>
      <Text
        style={[
          styles.initials,
          { color: tint.fg, fontSize: Math.round(size * 0.38) },
        ]}
        allowFontScaling={false}
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: FONTS.medium,
    includeFontPadding: false,
  },
});

export default MemberAvatar;
