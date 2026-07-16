import { Method } from "@/constants/Method";
import type { RegisterForm } from "@/schemas/auth";
import type {
  AuthResponse,
  OtpChallenge,
  RegisterResponse,
  RegisterResponseData,
  ResendOtpResponse,
} from "@/types/auth";
import { apiPost } from "@/utils/ApiHelper";
import { authenticateUser, redirectToHome } from "./coreAuth";

/**
 * Registration + OTP verification API layer.
 * Same conventions as coreAuth.ts: apiPost with typed envelopes and
 * defensive checks on the payload before it's trusted.
 */

type RegisterPayload = RegisterForm & {
  verificationType: "EMAIL_OTP";
};

/**
 * Create the account. Mobile always requests EMAIL_OTP — the link-based
 * verification flow (EMAIL_LINK / VERIFY_LINK) is web-only by design.
 *
 * Returns RegisterResponseData; the caller branches on `nextStep`
 * (VERIFY_OTP -> OTP screen, LOGIN -> login screen).
 */
export const registerWithPassword = async (
  form: RegisterForm,
): Promise<RegisterResponseData> => {
  console.log("[auth] registerWithPassword -> calling api");

  const response = await apiPost<RegisterResponse, RegisterPayload>(
    Method.AUTH_REGISTER,
    { ...form, verificationType: "EMAIL_OTP" },
  );

  if (!response || !response.data) {
    console.error("[auth] No response.data from registerWithPassword", response);
    throw new Error("Invalid register response");
  }

  return response.data;
};

/**
 * Verify the emailed OTP and log the user in — this is the endpoint that
 * actually issues tokens for a fresh registration.
 *
 * `onSuccess` runs after the session is stored (the caller uses it to clear
 * the registration draft before redirecting).
 */
export const verifyEmailOtpAndLogin = async (
  verificationId: string,
  otp: string,
  onSuccess?: () => void,
) => {
  console.log("[auth] verifyEmailOtpAndLogin -> calling api");

  const response = await apiPost<
    AuthResponse,
    { verificationId: string; otp: string }
  >(Method.VERIFY_EMAIL_OTP_AND_LOGIN, { verificationId, otp });

  if (!response || !response.data) {
    console.error(
      "[auth] No response.data from verifyEmailOtpAndLogin",
      response,
    );
    throw new Error("Invalid auth response");
  }

  const { accessToken, refreshToken, userDetails } = response.data;

  if (!accessToken || !refreshToken || !userDetails) {
    console.error("[auth] Missing tokens or userDetails", {
      accessToken,
      refreshToken,
      userDetails,
    });
    throw new Error("Missing auth payload");
  }

  await authenticateUser(
    accessToken,
    refreshToken,
    userDetails,
    onSuccess ?? redirectToHome,
  );
  console.log("[auth] verifyEmailOtpAndLogin completed");
};

/**
 * Request a fresh OTP. The response contains a NEW verificationId — the
 * caller must replace the stored challenge; the old id is dead.
 */
export const resendEmailOtp = async (email: string): Promise<OtpChallenge> => {
  console.log("[auth] resendEmailOtp -> calling api");

  const response = await apiPost<ResendOtpResponse, { email: string }>(
    Method.RESEND_OTP,
    { email },
  );

  if (!response || !response.data) {
    console.error("[auth] No response.data from resendEmailOtp", response);
    throw new Error("Invalid resend response");
  }

  return response.data;
};
