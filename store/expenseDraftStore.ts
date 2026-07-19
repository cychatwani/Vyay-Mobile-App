import { create } from "zustand";

/**
 * Ephemeral state for the multi-step create-expense flow:
 *   enterAmount -> details (description / category / group) -> split -> review
 *
 * Same rationale as registrationStore: a store rather than route params, so
 * the draft survives back-navigation within the flow without serializing into
 * navigation state. Memory-only; cleared when the flow completes or is
 * abandoned.
 *
 * Amounts are carried as integer minor units (paise) plus the canonical raw
 * string. minorUnits is what VyayCore's expense endpoint takes; raw is kept
 * so enterAmount can re-seed its input when the user navigates back.
 */
type ExpenseDraftState = {
  /** Step 1 — how much. Null until the amount step has been completed. */
  amountMinorUnits: number | null;
  /** Canonical raw ("1250.50") for re-seeding the AmountInput on back-nav. */
  amountRaw: string | null;
  /** ISO 4217 code the amount was entered in. */
  currency: string | null;

  setAmount: (a: { minorUnits: number; raw: string; currency: string }) => void;
  clear: () => void;
};

export const useExpenseDraftStore = create<ExpenseDraftState>((set) => ({
  amountMinorUnits: null,
  amountRaw: null,
  currency: null,

  setAmount: ({ minorUnits, raw, currency }) =>
    set({ amountMinorUnits: minorUnits, amountRaw: raw, currency }),
  clear: () =>
    set({ amountMinorUnits: null, amountRaw: null, currency: null }),
}));
