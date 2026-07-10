import { create } from "zustand";

/**
 * Global UI state. Currently tracks whether a bottom sheet is open so the
 * floating tab bar can hide itself (avoids the tab bar stacking above the
 * sheet on Android).
 */
type UiState = {
  isSheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSheetOpen: false,
  setSheetOpen: (open) => set({ isSheetOpen: open }),
}));
