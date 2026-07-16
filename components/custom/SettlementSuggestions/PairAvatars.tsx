import { useColorsV2 } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import MemberAvatar from "../MemberBalances/MemberAvatar";
import type { SettlementParty } from "./types";

interface PairAvatarsProps {
  fromUser: SettlementParty;
  toUser: SettlementParty;
  /** Avatar diameter (already scaled). */
  size?: number;
  /** Brand-tinted arrow marks the viewer's own transfers. */
  emphasized?: boolean;
  /**
   * Ring + badge outline color. Defaults to the card surface; pass the tile
   * surface when the pair sits on something else.
   */
  ringColor?: string;
}

/**
 * The settlement glyph: sender and recipient overlap, and a small arrow badge
 * rides the seam pointing the way the money flows. Reading order matches the
 * money — left pays right — so a row is legible before a single word is read.
 */
const PairAvatars = ({
  fromUser,
  toUser,
  size = scale(28),
  emphasized = false,
  ringColor,
}: PairAvatarsProps) => {
  const colors = useColorsV2();

  const ring = ringColor ?? colors.card;
  const overlap = Math.round(size * 0.32);
  const badge = Math.round(size * 0.52);
  // Center the badge on the seam where the two circles meet.
  const seamX = size - overlap / 2;

  return (
    <View
      style={[styles.wrap, { paddingBottom: scale(3) }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <MemberAvatar name={fromUser.name} avatarUrl={fromUser.avatarUrl} size={size} />
      <View style={{ marginLeft: -overlap }}>
        <MemberAvatar
          name={toUser.name}
          avatarUrl={toUser.avatarUrl}
          size={size}
          ringColor={ring}
        />
      </View>

      <View
        style={[
          styles.badge,
          {
            width: badge,
            height: badge,
            borderRadius: badge / 2,
            left: seamX - badge / 2,
            backgroundColor: emphasized ? colors.brand : colors.divider,
            borderColor: ring,
          },
        ]}
      >
        <Feather
          name="arrow-right"
          size={Math.round(badge * 0.58)}
          color={emphasized ? colors.white : colors.text2}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    bottom: 0,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PairAvatars;
