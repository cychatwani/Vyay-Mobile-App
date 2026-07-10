import { Dimens } from "./Dimes";
import { scale } from "react-native-size-matters";
import { ThemePalette } from "./Colors";
import { FONTS } from "./Fonts";

export const getCardDefaults = (colors: ThemePalette) => ({
  backgroundColor: colors.card,
  marginHorizontal: Dimens.paddingMarginHorizontal,
  paddingVertical: Dimens.paddingMarginVertical,
  shadowColor: colors.primaryShadow,
  shadowOffset: { width: scale(0), height: scale(10) },
  shadowOpacity: scale(0.1),
  paddingHorizontal: Dimens.paddingMarginVertical,
  shadowRadius: scale(8),
  elevation: scale(5),
  borderRadius: scale(20),
});
export const getTitleFontStyle = (colors: ThemePalette) => ({
  fontSize: scale(18),
  fontFamily: FONTS.medium,
  paddingLeft: scale(6),
  color: colors.textPrimary,
});
export const getSubTitleFontStyle = (colors: ThemePalette) => ({
  fontSize: scale(12),
  fontFamily: FONTS.regular,
  paddingLeft: scale(6),
  color: colors.textSecondary,
});
