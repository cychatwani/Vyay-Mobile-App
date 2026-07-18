import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

interface GroupHeaderIdentityProps {
  name: string;
  memberCount: number;
  photoUrl?: string;
  /** Opens the group info screen. Not wired yet — safe to omit. */
  onPress?: () => void;
}

/**
 * The group's identity, folded into the top bar: small photo, name, and a
 * live member count — the WhatsApp-style header pattern. The whole thing
 * is one press target and will navigate to the group info screen once
 * that exists, which is why it renders as a button even before the
 * navigation is wired.
 *
 * This replaces the old hero photo that used to take over the top half of
 * the screen; the reclaimed space goes to the timeline.
 */
const GroupHeaderIdentity = ({
  name,
  memberCount,
  photoUrl,
  onPress,
}: GroupHeaderIdentityProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const membersLabel = `${memberCount} ${memberCount === 1 ? "member" : "members"}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      android_ripple={{ color: colors.ripple, borderless: false }}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${membersLabel}`}
      accessibilityHint="Opens group info"
    >
      <View style={styles.photoRing}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={styles.photo}
            contentFit="cover"
            transition={120}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Feather name="users" size={scale(16)} color={colors.brandText} />
          </View>
        )}
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.members} numberOfLines={1}>
          {membersLabel}
        </Text>
      </View>
    </Pressable>
  );
};

const PHOTO = scale(36);

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Dimens.sm,
      // Room around the 36dp photo so the press target clears 48dp.
      paddingVertical: Dimens.xs + scale(2),
      paddingHorizontal: Dimens.xs,
      borderRadius: Dimens.radiusPill,
      alignSelf: "flex-start",
      maxWidth: "100%",
    },
    rowPressed: {
      opacity: 0.7,
    },
    photoRing: {
      width: PHOTO + 3,
      height: PHOTO + 3,
      borderRadius: (PHOTO + 3) / 2,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
    },
    photo: {
      width: PHOTO,
      height: PHOTO,
      borderRadius: PHOTO / 2,
      overflow: "hidden",
    },
    photoFallback: {
      backgroundColor: colors.brandSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    textBlock: {
      flexShrink: 1,
    },
    name: {
      fontFamily: FONTS.medium,
      fontSize: scale(15),
      color: colors.text,
      includeFontPadding: false,
    },
    members: {
      fontFamily: FONTS.regular,
      fontSize: scale(11.5),
      color: colors.text3,
      includeFontPadding: false,
      marginTop: scale(1),
    },
  });

export default memo(GroupHeaderIdentity);
