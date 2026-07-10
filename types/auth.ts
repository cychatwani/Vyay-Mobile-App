// src/types/auth.ts
export type AuthType = "GOOGLE" | "REFRESH" | "APPLE";

export type UserDetails = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture: string;
  email: string;
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
