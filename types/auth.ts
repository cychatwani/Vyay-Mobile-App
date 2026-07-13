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
