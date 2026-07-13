import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColorsV2 } from "@/store/themeStore";

type LogoutButtonProps = {
  onPress: () => void;
};

export default function LogoutButton({ onPress }: LogoutButtonProps) {
  const colors = useColorsV2();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.22)" }}
      style={styles.wrap}
    >
      {({ pressed }) => (
        // The shadow lives on an outer View and the ripple/overflow on an
        // inner one. On Android `overflow: "hidden"` (needed to clip the
        // ripple) also clips the elevation shadow — so they cannot be the
        // same node. That's why this is two Views, not one.
        <View style={[styles.lift, pressed && styles.liftPressed]}>
          <View style={styles.button}>
            <Feather
              name="log-out"
              size={scale(18)}
              color={colors.danger.onSolid}
            />
            <Text style={styles.label}>Log out</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    wrap: {
      alignSelf: "stretch",
    },
    /**
     * Solid danger CTA. Deliberately NOT the card surface — this is the one
     * destructive action on the screen and it should not blend into the stack
     * of cards around it.
     */
    lift: {
      borderRadius: Dimens.radiusLg,
      backgroundColor: colors.danger.solid,
      // Tinted shadow, not the neutral card grey. A solid saturated button
      // sitting on a grey shadow reads muddy; echoing its own hue keeps the
      // lift clean and lets it carry more opacity without looking heavy.
      shadowColor: colors.danger.solid,
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: 0.3,
      shadowRadius: scale(12),
      elevation: 6,
    },
    /** Press collapses the lift — the depth has to react to touch. */
    liftPressed: {
      shadowOpacity: 0.12,
      shadowRadius: scale(4),
      shadowOffset: { width: 0, height: scale(1) },
      elevation: 1,
      transform: [{ translateY: scale(2) }],
    },
    button: {
      height: verticalScale(50),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      borderRadius: Dimens.radiusLg,
      backgroundColor: colors.danger.solid,
      overflow: "hidden",
    },
    label: {
      fontFamily: FONTS.bold,
      fontSize: scale(15),
      color: colors.danger.onSolid,
    },
  });
