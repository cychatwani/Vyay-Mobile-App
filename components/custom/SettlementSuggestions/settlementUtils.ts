import type { SettlementSuggestion } from "./types";

/**
 * Pure presentation helpers over the backend's settlement plan.
 *
 * The backend owns debt simplification — the plan arrives here already
 * optimized and is never re-derived, re-ordered for correctness, or mutated.
 * Everything below is UI-only: splitting out the viewer's transfers,
 * summarizing the header, and resolving a display symbol for the currency.
 */

/** Loose equality across string/number ids — backend ids vs local mocks. */
const sameId = (a: string | number, b: string | number) =>
  String(a) === String(b);

export const viewerPays = (
  s: SettlementSuggestion,
  viewerId: string | number,
) => sameId(s.fromUser.id, viewerId);

export const keyOfSuggestion = (s: SettlementSuggestion, i: number) =>
  s.id ?? `${s.fromUser.id}\u2192${s.toUser.id}-${i}`;

/**
 * Everything the card needs to know about a plan, computed in one pass.
 * `mine` / `others` is the personalization split: the viewer's transfers are
 * always surfaced first, with the ones they must *send* leading (that is the
 * actionable half), then everything sorts largest-first so big moves lead.
 */
export interface SettlementPlanView {
  /** Transfers involving the viewer — payments they make first. */
  mine: SettlementSuggestion[];
  /** Everyone else's transfers, largest first. */
  others: SettlementSuggestion[];
  /** Sum of every transfer — the money that changes hands executing the plan. */
  totalMoving: number;
  /** Distinct people who appear anywhere in the plan. */
  peopleCount: number;
  /** The viewer's totals across their transfers. */
  myPayTotal: number;
  myReceiveTotal: number;
  /** ISO code taken from the plan itself (undefined for an empty plan). */
  currency?: string;
}

export const buildPlanView = (
  suggestions: SettlementSuggestion[],
  viewerId?: string | number,
): SettlementPlanView => {
  const mine: SettlementSuggestion[] = [];
  const others: SettlementSuggestion[] = [];
  const people = new Set<string>();
  let totalMoving = 0;
  let myPayTotal = 0;
  let myReceiveTotal = 0;

  for (const s of suggestions) {
    totalMoving += s.amount;
    people.add(String(s.fromUser.id));
    people.add(String(s.toUser.id));

    const iPay = viewerId != null && sameId(s.fromUser.id, viewerId);
    const iReceive = viewerId != null && sameId(s.toUser.id, viewerId);

    if (iPay || iReceive) {
      mine.push(s);
      if (iPay) myPayTotal += s.amount;
      else myReceiveTotal += s.amount;
    } else {
      others.push(s);
    }
  }

  if (viewerId != null) {
    mine.sort(
      (a, b) =>
        Number(viewerPays(b, viewerId)) - Number(viewerPays(a, viewerId)) ||
        b.amount - a.amount,
    );
  }
  others.sort((a, b) => b.amount - a.amount);

  return {
    mine,
    others,
    totalMoving,
    peopleCount: people.size,
    myPayTotal,
    myReceiveTotal,
    currency: suggestions[0]?.currency,
  };
};

/**
 * Display symbol for an ISO currency code ("INR" → "₹"). Uses Intl when the
 * runtime provides it (Hermes on current Expo SDKs does), with a small manual
 * fallback so a missing locale never breaks rendering.
 */
const FALLBACK_SYMBOLS: Record<string, string> = {
  INR: "\u20B9",
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
};

export const currencySymbolFor = (code?: string): string => {
  if (!code) return FALLBACK_SYMBOLS.INR;
  try {
    const part = new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    if (part?.value) return part.value;
  } catch {
    // Unknown code or no Intl currency data — fall through.
  }
  return FALLBACK_SYMBOLS[code.toUpperCase()] ?? code;
};
