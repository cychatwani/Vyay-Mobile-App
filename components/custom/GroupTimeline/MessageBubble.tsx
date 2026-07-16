import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import { avatarTint } from "../MemberBalances/balanceUtils";
import { formatClockTime } from "./timelineUtils";
import type { MessageEvent, MessageRunMeta } from "./types";

interface MessageBubbleProps {
  event: MessageEvent;
  run: MessageRunMeta;
  isMine: boolean;
}

/**
 * Conversation, kept deliberately familiar: my messages right, everyone
 * else's left, roughly half-width bubbles, timestamp tucked into the
 * corner. Consecutive messages from one sender within a few minutes read
 * as a single run — the name appears once, the gaps tighten, and only the
 * run's first bubble keeps its "tail" corner.
 *
 * Messages never expand. They are chat, not activity cards.
 */
const MessageBubble = ({ event, run, isMine }: MessageBubbleProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  // Same deterministic hue as the sender's avatar — WhatsApp's trick for
  // letting you attribute a bubble before reading the name.
  const senderColor = avatarTint(event.sender.name, colors).fg;

  const tailCorner = run.firstInRun
    ? isMine
      ? { borderTopRightRadius: scale(5) }
      : { borderTopLeftRadius: scale(5) }
    : null;

  return (
    <View
      style={[
        styles.row,
        isMine ? styles.rowMine : styles.rowTheirs,
        { marginTop: run.firstInRun ? Dimens.sm : scale(2) },
      ]}
      accessible
      accessibilityLabel={`${isMine ? "You" : event.sender.name} said: ${event.text}, at ${formatClockTime(event.createdAt)}`}
    >
      <View
        style={[styles.bubble, isMine ? styles.mine : styles.theirs, tailCorner]}
      >
        {!isMine && run.firstInRun && (
          <Text style={[styles.sender, { color: senderColor }]} numberOfLines={1}>
            {event.sender.name}
          </Text>
        )}
        <Text style={styles.text}>{event.text}</Text>
        <Text style={styles.time}>{formatClockTime(event.createdAt)}</Text>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
    },
    rowMine: {
      justifyContent: "flex-end",
    },
    rowTheirs: {
      justifyContent: "flex-start",
    },
    bubble: {
      maxWidth: "72%",
      borderRadius: Dimens.radiusMd,
      paddingHorizontal: Dimens.md,
      paddingVertical: Dimens.sm,
    },
    mine: {
      backgroundColor: colors.brandSubtle,
    },
    theirs: {
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    sender: {
      fontFamily: FONTS.medium,
      fontSize: scale(11.5),
      marginBottom: scale(2),
      includeFontPadding: false,
    },
    text: {
      fontFamily: FONTS.regular,
      fontSize: scale(13.5),
      lineHeight: scale(19),
      color: colors.text,
      includeFontPadding: false,
    },
    time: {
      fontFamily: FONTS.regular,
      fontSize: scale(9.5),
      color: colors.text3,
      alignSelf: "flex-end",
      marginTop: scale(2),
      includeFontPadding: false,
    },
  });

export default memo(MessageBubble);
