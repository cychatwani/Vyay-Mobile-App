import React from "react";
import { SvgProps } from "react-native-svg";

// Recolorable (currentColor) variants
import BadgeMono from "@/assets/brand/vyay-badge-mono.svg";
import SettleMotif from "@/assets/brand/vyay-settle-motif.svg";
import WordmarkDevanagari from "@/assets/brand/vyay-wordmark-devanagari.svg";
import WordmarkLatinCaps from "@/assets/brand/vyay-wordmark-latin-caps.svg";
import WordmarkLatin from "@/assets/brand/vyay-wordmark-latin.svg";

// Fixed brand-color variants
import AppIcon from "@/assets/brand/vyay-appicon.svg";
import BadgeEnglish from "@/assets/brand/vyay-badge-english.svg";
import BadgePrimary from "@/assets/brand/vyay-badge-primary.svg";
import IconCompact from "@/assets/brand/vyay-icon-compact.svg";
import LockupHorizontal from "@/assets/brand/vyay-lockup-horizontal.svg";

export type LogoVariant =
  | "wordmark-devanagari"
  | "wordmark"
  | "wordmark-caps"
  | "badge"
  | "badge-english"
  | "badge-mono"
  | "app-icon"
  | "glyph"
  | "lockup"
  | "settle-motif";

type VariantMeta = {
  Component: React.FC<SvgProps>;
  ratio: number; // width / height
  recolorable: boolean;
};

const VARIANTS: Record<LogoVariant, VariantMeta> = {
  "wordmark-devanagari": {
    Component: WordmarkDevanagari,
    ratio: 3545.7 / 1429.0,
    recolorable: true,
  },
  wordmark: {
    Component: WordmarkLatin,
    ratio: 4166.8 / 1510.7,
    recolorable: true,
  },
  "wordmark-caps": {
    Component: WordmarkLatinCaps,
    ratio: 4323.9 / 1816.6,
    recolorable: true,
  },
  badge: { Component: BadgePrimary, ratio: 1, recolorable: false },
  "badge-english": { Component: BadgeEnglish, ratio: 1, recolorable: false },
  "badge-mono": { Component: BadgeMono, ratio: 1, recolorable: true },
  "app-icon": { Component: AppIcon, ratio: 1, recolorable: false },
  glyph: { Component: IconCompact, ratio: 1, recolorable: false },
  lockup: { Component: LockupHorizontal, ratio: 254.0 / 96, recolorable: true },
  "settle-motif": { Component: SettleMotif, ratio: 1, recolorable: true },
};

export type LogoProps = {
  variant?: LogoVariant;
  size?: number;
  color?: string;
} & Omit<SvgProps, "width" | "height" | "color">;

export default function Logo({
  variant = "lockup",
  size = 160,
  color,
  ...rest
}: LogoProps) {
  const meta = VARIANTS[variant];
  const width = size;
  const height = size / meta.ratio;

  // For recolorable variants, drive currentColor via BOTH `color` and explicit
  // fill/stroke so it works regardless of how the transformer emits the SVG.
  const colorProps =
    meta.recolorable && color ? { color, fill: color, stroke: color } : {};

  return (
    <meta.Component width={width} height={height} {...colorProps} {...rest} />
  );
}
