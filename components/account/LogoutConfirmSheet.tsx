import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { closeSheet } from "@/store/sheetStore";
import { useColorsV2 } from "@/store/themeStore";

type LogoutConfirmSheetProps = {
  onConfirm: () => void;
};

export default function LogoutConfirmSheet({
  onConfirm,
}: LogoutConfirmSheetProps) {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  const handleConfirm = () => {
    // Dismiss first so the sheet animates out cleanly, then run the side
    // effect. Logging out tears down the navigator; doing that while the sheet
    // is still mounted leaves it stranded over the login screen.
    closeSheet();
    onConfirm();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Feather name="log-out" size={scale(22)} color={colors.danger.icon} />
      </View>

      <Text style={styles.title}>Log out of Vyay?</Text>
      <Text style={styles.subtitle}>
        You&apos;ll need to sign in again to see your expenses and groups.
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={closeSheet}
          android_ripple={{ color: colors.ripple }}
          style={({ pressed }) => [
            styles.button,
            styles.cancel,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={handleConfirm}
          android_ripple={{ color: colors.danger.surface }}
          style={({ pressed }) => [
            styles.button,
            styles.confirm,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.confirmLabel}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingTop: Dimens.sm,
    },
    iconWrap: {
      width: scale(52),
      height: scale(52),
      borderRadius: scale(26),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.danger.bg,
      borderWidth: 1,
      borderColor: colors.danger.border,
      marginBottom: Dimens.md,
    },
    title: {
      ...getTitleV2(colors),
      fontFamily: FONTS.bold,
    },
    subtitle: {
      ...getSubtitleV2(colors),
      textAlign: "center",
      marginTop: scale(6),
      paddingHorizontal: Dimens.lg,
    },
    actions: {
      flexDirection: "row",
      gap: scale(12),
      alignSelf: "stretch",
      marginTop: Dimens.xl,
    },
    button: {
      flex: 1,
      height: scale(50),
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Dimens.radiusLg,
      borderWidth: 1,
      overflow: "hidden",
    },
    cancel: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    cancelLabel: {
      fontFamily: FONTS.medium,
      fontSize: scale(15),
      color: colors.text,
    },
    confirm: {
      backgroundColor: colors.danger.solid,
      borderColor: colors.danger.solid,
    },
    confirmLabel: {
      fontFamily: FONTS.bold,
      fontSize: scale(15),
      color: colors.danger.onSolid,
    },
    pressed: {
      opacity: 0.85,
    },
  });
