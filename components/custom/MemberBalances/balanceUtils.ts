import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import type { MemberBalance } from "./types";

/** Float-safe zero: anything under half a paisa is "settled". */
export const SETTLED_EPSILON = 0.005;

export const isSettled = (amount: number) => Math.abs(amount) < SETTLED_EPSILON;

export interface BalanceBreakdown {
  /** Non-zero balances, sorted descending — biggest creditor first, biggest debtor last. */
  ranked: MemberBalance[];
  /** Members at zero, in original order. */
  settled: MemberBalance[];
  creditorCount: number;
  debtorCount: number;
  /**
   * Money that still has to change hands. In a consistent group the positive
   * and negative sides are equal; `max` keeps the number honest if the
   * backend ever sends a lopsided snapshot.
   */
  outstanding: number;
}

export const splitBalances = (members: MemberBalance[]): BalanceBreakdown => {
  const active: MemberBalance[] = [];
  const settled: MemberBalance[] = [];
  let positive = 0;
  let negative = 0;

  for (const m of members) {
    if (isSettled(m.amount)) {
      settled.push(m);
    } else {
      active.push(m);
      if (m.amount > 0) positive += m.amount;
      else negative += -m.amount;
    }
  }

  const ranked = [...active].sort((a, b) => b.amount - a.amount);

  return {
    ranked,
    settled,
    creditorCount: active.filter((m) => m.amount > 0).length,
    debtorCount: active.filter((m) => m.amount < 0).length,
    outstanding: Math.max(positive, negative),
  };
};

/**
 * Indian digit grouping (₹1,10,000.00), split so the UI can demote the
 * decimals typographically. Hermes ships full Intl on Expo SDK 53, and
 * `en-IN` is already used elsewhere in the app (BalanceWidget).
 */
export const formatAmountParts = (
  amount: number,
): { int: string; dec: string } => {
  const [int, dec = "00"] = Math.abs(amount)
    .toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .split(".");
  return { int, dec };
};

export const formatAmount = (amount: number): string => {
  const { int, dec } = formatAmountParts(amount);
  return `${int}.${dec}`;
};

/** "Charlotte Hanlin" → "CH", "Priya" → "P". */
export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Deterministic identity tint for initials avatars: the same member always
 * lands on the same hue from the brand's categorical ramp. Returns a
 * low-opacity wash for the circle and the solid hue for the letters.
 */
export const avatarTint = (
  name: string,
  colors: ThemePaletteV2,
): { bg: string; fg: string } => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const hue = colors.chart[Math.abs(hash) % colors.chart.length];
  return { bg: `${hue}26`, fg: hue }; // 0x26 ≈ 15% alpha wash
};
