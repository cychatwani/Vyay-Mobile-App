import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import MemberAvatar from "../MemberBalances/MemberAvatar";
import type { TimelineActor } from "./types";

interface ParticipantFacepileProps {
  people: TimelineActor[];
  /** Avatar diameter (already scaled). */
  size?: number;
  /** Faces shown before folding into a "+N" chip. */
  maxFaces?: number;
  /** Ring color separating overlapped faces — usually the card surface. */
  ringColor?: string;
}

/**
 * The expense card's answer to "who was part of this?" — the same
 * overlapping-avatar cluster the Member Balances card uses for settled
 * members. Overflow folds into a quiet "+N" disc so a 20-person dinner
 * stays one glance wide.
 */
const ParticipantFacepile = ({
  people,
  size = scale(22),
  maxFaces = 4,
  ringColor,
}: ParticipantFacepileProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const ring = ringColor ?? colors.card;
  const shown = people.length > maxFaces ? people.slice(0, maxFaces) : people;
  const overflow = people.length - shown.length;
  const overlap = Math.round(size * 0.34);

  return (
    <View
      style={styles.pile}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {shown.map((p, i) => (
        <View key={String(p.id)} style={i > 0 && { marginLeft: -overlap }}>
          <MemberAvatar
            name={p.name}
            avatarUrl={p.avatarUrl}
            size={size}
            ringColor={i > 0 || overflow > 0 ? ring : undefined}
          />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.overflowDisc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -overlap,
              borderColor: ring,
            },
          ]}
        >
          <Text
            style={[styles.overflowText, { fontSize: Math.round(size * 0.36) }]}
            allowFontScaling={false}
          >
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    pile: {
      flexDirection: "row",
      alignItems: "center",
    },
    overflowDisc: {
      backgroundColor: colors.divider,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    overflowText: {
      fontFamily: FONTS.medium,
      color: colors.text2,
      includeFontPadding: false,
    },
  });

export default memo(ParticipantFacepile);
