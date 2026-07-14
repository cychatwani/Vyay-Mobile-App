// src/types/auth.ts
export type AuthType = "GOOGLE" | "REFRESH" | "APPLE" | "PASSWORD";

export type UserDetails = {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture: string;
  email: string;
  hasProfile: boolean;
};

export type AuthResponseData = {
  accessToken: string;
  refreshToken: string;
  authType: AuthType;
  isNewUser: boolean;
  userDetails: UserDetails;
};

export type AuthResponse = {
  code: number;
  message: string | null;
  errorCode: string | null;
  data: AuthResponseData;
};

/** Mirror of the backend's RegisterResponseDTO. */
export type RegisterResponseData = {
  email: string;
  verificationRequired: boolean;
  verificationType: "EMAIL_OTP" | "EMAIL_LINK";
  nextStep: "VERIFY_OTP" | "VERIFY_LINK" | "LOGIN";
  verificationId: string;
  expiresAt: string;
  resendAvailableAt: string;
  message: string;
};

export type RegisterResponse = {
  code: number;
  message: string | null;
  errorCode: string | null;
  data: RegisterResponseData;
};

/** Mirror of the backend's OtpChallenge (returned by resend-otp). */
export type OtpChallenge = {
  verificationId: string;
  expiresAt: string;
  resendAvailableAt: string;
};

export type ResendOtpResponse = {
  code: number;
  message: string | null;
  errorCode: string | null;
  data: OtpChallenge;
};
