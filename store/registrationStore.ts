import { create } from "zustand";

import type { RegisterIdentityForm } from "@/schemas/auth";
import type { OtpChallenge } from "@/types/auth";

/**
 * Ephemeral state for the multi-step registration flow:
 *   register (identity) -> register-password -> register-confirm -> verify-otp
 *
 * Deliberately a store rather than route params: the flow carries a password,
 * and Expo Router params serialize into navigation state (and can surface in
 * deep-link history / logs). This store is memory-only and is cleared when
 * the flow completes or is abandoned.
 *
 * Note: confirmPassword never lands here — it's a form-level check only.
 */
type RegistrationState = {
  /** Step 1 — who the user is. */
  identity: RegisterIdentityForm | null;
  /** Step 2 — chosen password. */
  password: string | null;
  /**
   * OTP challenge returned by the register / resend-otp APIs.
   * Null until the registration API has been called.
   */
  challenge: OtpChallenge | null;

  setIdentity: (identity: RegisterIdentityForm) => void;
  setPassword: (password: string) => void;
  setChallenge: (challenge: OtpChallenge) => void;
  clear: () => void;
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  identity: null,
  password: null,
  challenge: null,

  setIdentity: (identity) => set({ identity }),
  setPassword: (password) => set({ password }),
  setChallenge: (challenge) => set({ challenge }),
  clear: () => set({ identity: null, password: null, challenge: null }),
}));
