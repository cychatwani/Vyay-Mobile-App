/**
 * The optimized settlement plan, exactly as the backend returns it.
 *
 * The backend is the single source of truth for debt simplification: it sends
 * the final, minimal list of transfers that clears every balance at once.
 * Each entry carries only what is needed to perform the transfer — who pays,
 * who gets paid, how much, in what currency. Everything the card displays
 * beyond that (viewer split, header summary, "Your part", folding) is derived
 * on the frontend in settlementUtils.ts.
 */

export interface SettlementParty {
  /** Stable member identity — matched against the viewer's id. */
  id: string | number;
  name: string;
  avatarUrl?: string;
}

export interface SettlementSuggestion {
  /** Stable identity for list keys. Falls back to fromUser→toUser if omitted. */
  id?: string | number;
  fromUser: SettlementParty;
  toUser: SettlementParty;
  /** Always positive — direction lives entirely in fromUser/toUser. */
  amount: number;
  /** ISO 4217 code, e.g. "INR". */
  currency: string;
}
