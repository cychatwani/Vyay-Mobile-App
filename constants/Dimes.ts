import { scale, verticalScale } from "react-native-size-matters";

/**
 * Spacing scale. Prefer the named scale (xs..xxl) for new work.
 * The legacy keys (paddingMarginHorizontal / paddingMarginVertical) are kept
 * so existing screens don't break during the V2 migration.
 */
export const Dimens = {
  // legacy (do not use in new code) — kept for back-compat
  paddingMarginHorizontal: scale(20),
  paddingMarginVertical: scale(12),

  // spacing scale
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(28),

  // vertical rhythm (height-aware)
  vSm: verticalScale(8),
  vMd: verticalScale(12),
  vLg: verticalScale(16),
  vXl: verticalScale(24),

  // screen gutters
  screenH: scale(20),
  screenV: verticalScale(12),

  // radii
  radiusSm: scale(10),
  radiusMd: scale(16),
  radiusLg: scale(20),
  radiusPill: scale(30),
};
