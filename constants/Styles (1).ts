import { Dimens } from "./Dimes";
import { scale } from "react-native-size-matters";
import { ThemePalette } from "./Colors";
import { ThemePaletteV2 } from "./ColorsV2";
import { FONTS } from "./Fonts";

/* ------------------------------------------------------------------ *
 * LEGACY helpers (old palette). Deprecated — migrate to the V2 helpers
 * below. Kept so un-migrated screens keep working.
 * ------------------------------------------------------------------ */

/** @deprecated Use getCardV2 */
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

/** @deprecated Use getTitleV2 */
export const getTitleFontStyle = (colors: ThemePalette) => ({
  fontSize: scale(18),
  fontFamily: FONTS.medium,
  paddingLeft: scale(6),
  color: colors.textPrimary,
});

/** @deprecated Use getSubtitleV2 */
export const getSubTitleFontStyle = (colors: ThemePalette) => ({
  fontSize: scale(12),
  fontFamily: FONTS.regular,
  paddingLeft: scale(6),
  color: colors.textSecondary,
});

/* ------------------------------------------------------------------ *
 * V2 helpers (brand-accurate). Warm & friendly: rounded, generous
 * padding, hairline border + soft subtle shadow.
 * ------------------------------------------------------------------ */

/**
 * Warm card: rounded, generous internal padding, hairline border, and a
 * soft low shadow (not the old heavy floaty one).
 */
export const getCardV2 = (colors: ThemePaletteV2) => ({
  backgroundColor: colors.card,
  borderRadius: Dimens.radiusLg,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: Dimens.lg,
  paddingHorizontal: Dimens.lg,
  // soft shadow (iOS)
  shadowColor: "#0D0E13",
  shadowOffset: { width: 0, height: scale(2) },
  shadowOpacity: 0.06,
  shadowRadius: scale(12),
  // subtle elevation (Android)
  elevation: 2,
});

export const getTitleV2 = (colors: ThemePaletteV2) => ({
  fontSize: scale(17),
  fontFamily: FONTS.medium,
  color: colors.text,
});

export const getSubtitleV2 = (colors: ThemePaletteV2) => ({
  fontSize: scale(13),
  fontFamily: FONTS.regular,
  color: colors.text2,
});
