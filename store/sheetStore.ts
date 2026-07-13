import type { ReactNode } from "react";
import { create } from "zustand";

export type SheetOptions = {
  snapPoints?: (string | number)[];
  /** Fired after the sheet has finished dismissing, however it was dismissed. */
  onClose?: () => void;
};

type SheetState = {
  content: ReactNode | null;
  options: SheetOptions;
  /**
   * Monotonic counter — the host calls present() on every increment.
   *
   * This is the whole point of the refactor. A boolean trigger (`isOpen`)
   * bails out when you set it to a value it already holds, so if the flag
   * ever got stuck at `true` the next open was a silent no-op — that was the
   * "opens once, then never again" bug. A counter that only ever increments
   * cannot bail out, so that failure mode stops existing.
   */
  openToken: number;
};

export const useSheetStore = create<SheetState>(() => ({
  content: null,
  options: {},
  openToken: 0,
}));

/* ------------------------------------------------------------------ *
 * Imperative handle, registered by SheetHost.
 *
 * open() has to go through state + an effect, because the content must be
 * mounted before present() is called. close() does NOT — dismiss() is purely
 * imperative and needs no render — so it can hit the ref directly.
 * ------------------------------------------------------------------ */

let handle: { dismiss: () => void } | null = null;

export const registerSheetHandle = (h: typeof handle) => {
  handle = h;
};

/** Open the global sheet with any content. Callers own nothing. */
export const openSheet = (content: ReactNode, options: SheetOptions = {}) =>
  useSheetStore.setState((s) => ({
    content,
    options,
    openToken: s.openToken + 1,
  }));

/** Dismiss the sheet with animation. Content is cleared in onDismiss. */
export const closeSheet = () => handle?.dismiss();
