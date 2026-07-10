// src/lib/authSignIn.ts (or where you have the function)
import { Method } from "@/constants/Method";
import { useAuthStore } from "@/store/authStore";
import { AuthResponse, UserDetails } from "@/types/auth";
import { apiPost } from "@/utils/ApiHelper";
import { deleteRefreshToken, saveRefreshToken } from "./refreshTokenUtils";

import { router } from "expo-router";

export const redirectToHome = () => {
  console.log("✅ Auth success, redirecting to /home");
  router.replace("/(tabs)");
};

export const SignInWithRefreshToken = async (
  refreshToken: string,
  onSuccess?: () => void,
) => {
  try {
    console.log(
      "[auth] Trying to sign-in with refresh token => ",
      refreshToken,
    );
    const response = await apiPost<AuthResponse, { refreshToken: string }>(
      Method.AUTH_REFRESH,
      { refreshToken },
    );

    if (!response || !response.data) {
      console.error(
        "[auth] No response.data from SignInWithGoogleIdToken",
        response,
      );
      throw new Error("Invalid auth response");
    }
    const {
      accessToken,
      refreshToken: newRefreshToken,
      userDetails,
    } = response.data;

    // more defensive checks
    if (!accessToken || !newRefreshToken || !userDetails) {
      console.error("[auth] Missing tokens or userDetails", {
        accessToken,
        newRefreshToken,
        userDetails,
      });
      throw new Error("Missing auth payload");
    }

    await authenticateUser(
      accessToken,
      newRefreshToken,
      userDetails,
      onSuccess ? onSuccess : redirectToHome,
    );
  } catch (err) {
    console.error("[auth] SignInWithGoogleIdToken error:", err);
  }
};

/**
 * Public function to sign in with Google idToken.
 * Adds defensive checks and uses imperative Zustand API to avoid calling hooks outside components.
 */
export const SignInWithGoogleIdToken = async (idToken: string) => {
  try {
    console.log(
      "[auth] SignInWithGoogleIdToken -> calling api with idToken",
      !!idToken,
    );

    const response = await apiPost<AuthResponse, { idToken: string }>(
      Method.AUTH_GOOGLE,
      { idToken },
    );

    console.log("[auth] API response:", response);

    // defensive check: ensure data exists
    if (!response || !response.data) {
      console.error(
        "[auth] No response.data from SignInWithGoogleIdToken",
        response,
      );
      throw new Error("Invalid auth response");
    }

    const { accessToken, refreshToken, userDetails } = response.data;

    // more defensive checks
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
      redirectToHome,
    );
    console.log("[auth] authenticateUser completed");
  } catch (err) {
    console.error("[auth] SignInWithGoogleIdToken error:", err);
    throw err;
  }
};

export const SignInWithEmailPassword = async (
  email: string,
  password: string,
) => {
  console.log("[auth] SignInWithEmailPassword -> calling api");

  const response = await apiPost<
    AuthResponse,
    { email: string; password: string }
  >(Method.AUTH_LOGIN, { email, password });

  if (!response || !response.data) {
    console.error(
      "[auth] No response.data from SignInWithEmailPassword",
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
    redirectToHome,
  );
  console.log("[auth] SignInWithEmailPassword completed");
};

/**
 * Central logout. Mirrors authenticateUser: clears the store, wipes the
 * persisted refresh token so silent-login won't re-auth, then redirects.
 */
export const logout = async () => {
  try {
    useAuthStore.getState().logout();
    await deleteRefreshToken();
  } catch (err) {
    console.warn("[auth] logout cleanup error:", err);
  } finally {
    router.replace("/(auth)/login");
  }
};

/**
 * NOTE: Do NOT call Zustand React hooks (useAuthStore(...)) from plain functions.
 * Use the imperative API useAuthStore.getState() to access setters without relying on React render rules.
 */
const authenticateUser = async (
  accessToken: string,
  refreshToken: string,
  userDetails: UserDetails,
  onSuccess?: () => void,
) => {
  try {
    // imperative access to setters (safe outside components)
    const store = useAuthStore.getState();
    if (!store) {
      console.error("[auth] useAuthStore.getState() returned falsy", store);
      return;
    }

    console.log("[auth] authenticateUser running .......");
    console.log(
      "[auth] accessToken present:",
      !!accessToken,
      "user:",
      userDetails?.userId ?? userDetails?.fullName,
    );

    store.setAccessToken(accessToken);
    store.setUser(userDetails);
    store.setIsLoggedIn(true);

    // await saving refresh token (handle errors but don't block UI)
    try {
      await saveRefreshToken(refreshToken);
    } catch (err) {
      console.warn("[auth] Failed saving refresh token to SecureStore:", err);
    }

    console.log("[auth] User details set in store", userDetails);
    if (onSuccess) {
      try {
        onSuccess();
      } catch (cbErr) {
        console.warn("[auth] onSuccess callback threw error:", cbErr);
      }
    }
  } catch (err) {
    console.error("[auth] authenticateUser fatal error:", err);
    throw err;
  }
};
