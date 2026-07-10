import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { scale } from "react-native-size-matters";

import { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { useColorsV2 } from "@/store/themeStore";

type IdentityQrProps = {
  value: string;
};

export default function IdentityQr({ value }: IdentityQrProps) {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Vyay QR</Text>
      <Text style={styles.subtitle}>Let a friend scan this to add you</Text>

      <View style={styles.qrWrap}>
        <QRCode
          value={value}
          size={scale(200)}
          color={colors.text}
          backgroundColor={colors.card}
        />
      </View>

      <Text style={styles.hint}>Scan to add me on Vyay</Text>
    </View>
  );
}

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
    },
    title: {
      ...getTitleV2(colors),
    },
    subtitle: {
      ...getSubtitleV2(colors),
      marginTop: scale(2),
    },
    qrWrap: {
      marginTop: Dimens.lg,
      padding: scale(16),
      backgroundColor: colors.card,
      borderRadius: Dimens.radiusMd,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    hint: {
      ...getSubtitleV2(colors),
      marginTop: Dimens.md,
    },
  });
