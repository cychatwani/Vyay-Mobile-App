import type { ColorValue } from "react-native";

/**
 * Vyay design tokens — V2 (brand-accurate)
 *
 * Source of truth: assets/BrandKit Dump/vyay-tokens.css + vyay-brand-kit.html.
 * Every text/bg pair is WCAG 2.2 AA validated per the brand kit.
 *
 * This is a PARALLEL token system to constants/Colors.ts. It exists so the
 * app can migrate screen-by-screen without breaking the 17 files still on the
 * old palette. Consume it via `useColorsV2()` from the theme store. Once every
 * screen is migrated, the old Colors.ts + useColors() can be deleted.
 *
 * Naming follows the brand guide vocabulary: `brand`, `page`, `text`, `text2`,
 * not the old `main`, `background`, `textPrimary`.
 */

/* ------------------------------------------------------------------ *
 * 1. RAW PALETTE RAMPS
 *    The literal source values. Components should NOT read these
 *    directly — they exist so the semantic tokens below reference a
 *    single source. Exported for edge cases (charts, custom art).
 * ------------------------------------------------------------------ */

export const Palette = {
  indigo: {
    50: "#F3F6FF",
    100: "#E5EBFF",
    200: "#CED7FF",
    300: "#AEBAFF",
    400: "#8E99FF",
    500: "#6F76FE",
    600: "#595AE4",
    700: "#4747BD",
    800: "#393B97",
    900: "#2D2F76",
    950: "#1C1D4D",
  },
  marigold: {
    50: "#FEF7EC",
    100: "#FDECD3",
    200: "#F8D9AA",
    300: "#F3C170",
    400: "#ECA609",
    500: "#D58E00",
    600: "#AE7200",
    700: "#895800",
    800: "#6E4500",
    900: "#573500",
    950: "#372100",
  },
  emerald: {
    50: "#EFFAF3",
    100: "#DDF3E6",
    200: "#BCE7CE",
    300: "#8FD3AE",
    400: "#5ABD8D",
    500: "#0AA26B",
    600: "#008952",
    700: "#007041",
    800: "#005A35",
    900: "#00472A",
    950: "#002D1A",
  },
  teal: {
    50: "#EEFAF7",
    100: "#DCF3EE",
    200: "#B9E6DE",
    300: "#89D2C6",
    400: "#4EBBAC",
    500: "#00A090",
    600: "#008677",
    700: "#006D61",
    800: "#00594E",
    900: "#00463E",
    950: "#002C27",
  },
  cyan: {
    50: "#EEF9FC",
    100: "#DBF2F7",
    200: "#B8E3EF",
    300: "#87CEE0",
    400: "#4CB7CF",
    500: "#009BB7",
    600: "#00819B",
    700: "#00697F",
    800: "#005568",
    900: "#004351",
    950: "#002A34",
  },
  sky: {
    50: "#EFF8FF",
    100: "#DCF0FF",
    200: "#BBE0FE",
    300: "#8EC9F8",
    400: "#5AAFED",
    500: "#1991D9",
    600: "#0077C0",
    700: "#00619F",
    800: "#004E7F",
    900: "#003E63",
    950: "#002740",
  },
  violet: {
    50: "#F8F4FF",
    100: "#EFE8FF",
    200: "#DFD1FF",
    300: "#CAB1FF",
    400: "#B28DFF",
    500: "#9868EE",
    600: "#804CD5",
    700: "#693BB0",
    800: "#54328C",
    900: "#42286E",
    950: "#2A1947",
  },
  amber: {
    50: "#FEF5ED",
    100: "#FCE9D9",
    200: "#F7D3B5",
    300: "#ECB584",
    400: "#DD944E",
    500: "#C57200",
    600: "#AA5900",
    700: "#8C4700",
    800: "#713900",
    900: "#592D00",
    950: "#391C00",
  },
  rose: {
    50: "#FFF2F3",
    100: "#FFE3E5",
    200: "#FFC8CD",
    300: "#FFA3AC",
    400: "#F67A89",
    500: "#E04F67",
    600: "#C52F4F",
    700: "#A2223F",
    800: "#821F33",
    900: "#661A29",
    950: "#421019",
  },
  red: {
    50: "#FFF2F0",
    100: "#FFE4DF",
    200: "#FFC9C1",
    300: "#FFA49A",
    400: "#F97B70",
    500: "#E35047",
    600: "#C82F2C",
    700: "#A52220",
    800: "#841F1C",
    900: "#681B17",
    950: "#43100D",
  },
  neutral: {
    0: "#FFFFFF",
    25: "#FAFBFE",
    50: "#F6F6FB",
    100: "#EBECF2",
    200: "#D9DBE2",
    300: "#BFC1C9",
    400: "#A1A3AA",
    500: "#82838B",
    600: "#686A71",
    700: "#54555C",
    800: "#3F4046",
    900: "#2B2C32",
    950: "#1A1B20",
    1000: "#0D0E13",
  },
} as const;

/* ------------------------------------------------------------------ *
 * 2. SEMANTIC ROLE TYPE
 *    A status role bundles the full set of surfaces/text for a
 *    financial state (income, expense, pending, etc.).
 * ------------------------------------------------------------------ */

export type StatusRole = {
  bg: string;
  surface: string;
  border: string;
  text: string;
  icon: string;
  solid: string;
  onSolid: string;
};

export type ThemePaletteV2 = {
  // gradient (brand keeps a gradient for hero/CTA moments)
  brandGradient: readonly [ColorValue, ColorValue, ...ColorValue[]];

  // surfaces
  page: string;
  card: string;
  border: string;
  divider: string;

  // text
  text: string;
  text2: string;
  text3: string;

  // brand
  brand: string;
  brandHover: string;
  brandSubtle: string;
  brandText: string;

  // accent (marigold — celebration only)
  accent: string;
  accentSubtle: string;
  accentText: string;

  // misc literals
  white: string;
  black: string;
  ripple: string;

  // status roles
  income: StatusRole;
  expense: StatusRole;
  success: StatusRole;
  error: StatusRole;
  danger: StatusRole;
  warning: StatusRole;
  info: StatusRole;
  pending: StatusRole;
  processing: StatusRole;
  failed: StatusRole;
  refunded: StatusRole;
  budgetOk: StatusRole;
  budgetOver: StatusRole;
  savings: StatusRole;
  invest: StatusRole;
  rewards: StatusRole;

  // categorical (charts)
  chart: readonly string[];
};

/* ------------------------------------------------------------------ *
 * 3. THEMES (light + dark) — mapped straight from vyay-tokens.css
 * ------------------------------------------------------------------ */

const chartHues = [
  "#6F76FE",
  "#ECA609",
  "#0AA26B",
  "#1991D9",
  "#E04F67",
  "#00A090",
  "#9868EE",
  "#AA5900",
] as const;

export const ColorsV2 = {
  light: {
    brandGradient: ["#595AE4", "#8E99FF"] as const,

    page: "#FAFBFE",
    card: "#FFFFFF",
    border: "#D9DBE2",
    divider: "#EBECF2",

    text: "#1A1B20",
    text2: "#686A71",
    text3: "#82838B",

    brand: "#595AE4",
    brandHover: "#4747BD",
    brandSubtle: "#F3F6FF",
    brandText: "#4747BD",

    accent: "#ECA609",
    accentSubtle: "#FEF7EC",
    accentText: "#895800",

    white: "#FFFFFF",
    black: "#0D0E13",
    ripple: "rgba(89,90,228,0.12)",

    income: {
      bg: "#EFFAF3",
      surface: "#DDF3E6",
      border: "#8FD3AE",
      text: "#007041",
      icon: "#0AA26B",
      solid: "#007041",
      onSolid: "#FFFFFF",
    },
    expense: {
      bg: "#FFF2F3",
      surface: "#FFE3E5",
      border: "#FFA3AC",
      text: "#C52F4F",
      icon: "#E04F67",
      solid: "#C52F4F",
      onSolid: "#FFFFFF",
    },
    success: {
      bg: "#EFFAF3",
      surface: "#DDF3E6",
      border: "#8FD3AE",
      text: "#007041",
      icon: "#0AA26B",
      solid: "#007041",
      onSolid: "#FFFFFF",
    },
    error: {
      bg: "#FFF2F0",
      surface: "#FFE4DF",
      border: "#FFA49A",
      text: "#C82F2C",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    warning: {
      bg: "#FEF5ED",
      surface: "#FCE9D9",
      border: "#ECB584",
      text: "#AA5900",
      icon: "#C57200",
      solid: "#AA5900",
      onSolid: "#FFFFFF",
    },
    info: {
      bg: "#EFF8FF",
      surface: "#DCF0FF",
      border: "#8EC9F8",
      text: "#00619F",
      icon: "#1991D9",
      solid: "#0077C0",
      onSolid: "#FFFFFF",
    },
    pending: {
      bg: "#FEF5ED",
      surface: "#FCE9D9",
      border: "#ECB584",
      text: "#AA5900",
      icon: "#C57200",
      solid: "#AA5900",
      onSolid: "#FFFFFF",
    },
    processing: {
      bg: "#EFF8FF",
      surface: "#DCF0FF",
      border: "#8EC9F8",
      text: "#00619F",
      icon: "#1991D9",
      solid: "#0077C0",
      onSolid: "#FFFFFF",
    },
    failed: {
      bg: "#FFF2F0",
      surface: "#FFE4DF",
      border: "#FFA49A",
      text: "#C82F2C",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    refunded: {
      bg: "#EEF9FC",
      surface: "#DBF2F7",
      border: "#87CEE0",
      text: "#00697F",
      icon: "#009BB7",
      solid: "#00819B",
      onSolid: "#FFFFFF",
    },
    budgetOk: {
      bg: "#EFFAF3",
      surface: "#DDF3E6",
      border: "#8FD3AE",
      text: "#007041",
      icon: "#0AA26B",
      solid: "#007041",
      onSolid: "#FFFFFF",
    },
    danger: {
      bg: "#FFF2F0",
      surface: "#FFE4DF",
      border: "#FFA49A",
      text: "#C82F2C",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    budgetOver: {
      bg: "#FFF2F0",
      surface: "#FFE4DF",
      border: "#FFA49A",
      text: "#C82F2C",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    savings: {
      bg: "#EEFAF7",
      surface: "#DCF3EE",
      border: "#89D2C6",
      text: "#006D61",
      icon: "#00A090",
      solid: "#006D61",
      onSolid: "#FFFFFF",
    },
    invest: {
      bg: "#F8F4FF",
      surface: "#EFE8FF",
      border: "#CAB1FF",
      text: "#804CD5",
      icon: "#9868EE",
      solid: "#804CD5",
      onSolid: "#FFFFFF",
    },
    rewards: {
      bg: "#FEF7EC",
      surface: "#FDECD3",
      border: "#F3C170",
      text: "#895800",
      icon: "#AE7200",
      solid: "#ECA609",
      onSolid: "#0D0E13",
    },

    chart: chartHues,
  },

  dark: {
    brandGradient: ["#8E99FF", "#4747BD"] as const,

    page: "#0D0E13",
    card: "#1A1B20",
    border: "#3F4046",
    divider: "#2B2C32",

    text: "#F6F6FB",
    text2: "#A1A3AA",
    text3: "#82838B",

    brand: "#8E99FF",
    brandHover: "#AEBAFF",
    brandSubtle: "#1C1D4D",
    brandText: "#AEBAFF",

    accent: "#ECA609",
    accentSubtle: "#372100",
    accentText: "#F3C170",

    white: "#FFFFFF",
    black: "#0D0E13",
    ripple: "rgba(142,153,255,0.16)",

    income: {
      bg: "#002D1A",
      surface: "#00472A",
      border: "#007041",
      text: "#5ABD8D",
      icon: "#0AA26B",
      solid: "#008952",
      onSolid: "#FFFFFF",
    },
    expense: {
      bg: "#421019",
      surface: "#661A29",
      border: "#A2223F",
      text: "#F67A89",
      icon: "#E04F67",
      solid: "#C52F4F",
      onSolid: "#FFFFFF",
    },
    success: {
      bg: "#002D1A",
      surface: "#00472A",
      border: "#007041",
      text: "#5ABD8D",
      icon: "#0AA26B",
      solid: "#008952",
      onSolid: "#FFFFFF",
    },
    danger: {
      bg: "#43100D",
      surface: "#681B17",
      border: "#A52220",
      text: "#F97B70",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    error: {
      bg: "#43100D",
      surface: "#681B17",
      border: "#A52220",
      text: "#F97B70",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    warning: {
      bg: "#391C00",
      surface: "#592D00",
      border: "#8C4700",
      text: "#DD944E",
      icon: "#C57200",
      solid: "#AA5900",
      onSolid: "#FFFFFF",
    },
    info: {
      bg: "#002740",
      surface: "#003E63",
      border: "#00619F",
      text: "#5AAFED",
      icon: "#1991D9",
      solid: "#0077C0",
      onSolid: "#FFFFFF",
    },
    pending: {
      bg: "#391C00",
      surface: "#592D00",
      border: "#8C4700",
      text: "#DD944E",
      icon: "#C57200",
      solid: "#AA5900",
      onSolid: "#FFFFFF",
    },
    processing: {
      bg: "#002740",
      surface: "#003E63",
      border: "#00619F",
      text: "#5AAFED",
      icon: "#1991D9",
      solid: "#0077C0",
      onSolid: "#FFFFFF",
    },
    failed: {
      bg: "#43100D",
      surface: "#681B17",
      border: "#A52220",
      text: "#F97B70",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    refunded: {
      bg: "#002A34",
      surface: "#004351",
      border: "#00697F",
      text: "#4CB7CF",
      icon: "#009BB7",
      solid: "#00819B",
      onSolid: "#FFFFFF",
    },
    budgetOk: {
      bg: "#002D1A",
      surface: "#00472A",
      border: "#007041",
      text: "#5ABD8D",
      icon: "#0AA26B",
      solid: "#008952",
      onSolid: "#FFFFFF",
    },
    budgetOver: {
      bg: "#43100D",
      surface: "#681B17",
      border: "#A52220",
      text: "#F97B70",
      icon: "#E35047",
      solid: "#C82F2C",
      onSolid: "#FFFFFF",
    },
    savings: {
      bg: "#002C27",
      surface: "#00463E",
      border: "#006D61",
      text: "#4EBBAC",
      icon: "#00A090",
      solid: "#006D61",
      onSolid: "#FFFFFF",
    },
    invest: {
      bg: "#2A1947",
      surface: "#42286E",
      border: "#693BB0",
      text: "#B28DFF",
      icon: "#9868EE",
      solid: "#804CD5",
      onSolid: "#FFFFFF",
    },
    rewards: {
      bg: "#372100",
      surface: "#573500",
      border: "#895800",
      text: "#ECA609",
      icon: "#D58E00",
      solid: "#ECA609",
      onSolid: "#0D0E13",
    },

    chart: chartHues,
  },
} satisfies { light: ThemePaletteV2; dark: ThemePaletteV2 };
