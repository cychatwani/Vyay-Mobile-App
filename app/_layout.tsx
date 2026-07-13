// app/_layout.tsx
import SheetHost from "@/components/custom/BottomSheet/SheetHost";
import SplashScreen from "@/components/custom/SplashScreen";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFonts } from "expo-font";
import { Redirect, Slot, useSegments } from "expo-router";
import * as SplashScreenNative from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SignInWithRefreshToken } from "@/auth/coreAuth";
import { getRefreshToken } from "@/auth/refreshTokenUtils";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { MenuProvider } from "react-native-popup-menu";

const MIN_SPLASH_MS = 3500;

// Global flag to track if splash has been shown
let globalSplashShown = false;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const hasInitialized = useRef(false);

  const [fontsLoaded] = useFonts({
    PoppinsBlack: require("../assets/fonts/Poppins-Black.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    PoppinsExtraBold: require("../assets/fonts/Poppins-ExtraBold.ttf"),
    PoppinsLight: require("../assets/fonts/Poppins-Light.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const [showSplash, setShowSplash] = useState(!globalSplashShown);
  const [splashTimerElapsed, setSplashTimerElapsed] =
    useState(globalSplashShown);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // minimum splash timer
  useEffect(() => {
    if (globalSplashShown) return;

    let mounted = true;
    const t = setTimeout(() => {
      if (mounted) {
        setSplashTimerElapsed(true);
        globalSplashShown = true;
      }
    }, MIN_SPLASH_MS);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  // check refresh token + do silent login if present
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let mounted = true;

    async function checkAuth() {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          console.log("[auth] Found refresh token, trying silent refresh");
          await SignInWithRefreshToken(refreshToken, () => {
            console.log("[auth] Silent refresh successful");
          });
          if (mounted) setIsAuthenticated(true);
        } else {
          console.log("[auth] No refresh token found, must login");
          if (mounted) setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("[auth] Silent refresh failed", err);
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  // hide splash after everything is ready
  useEffect(() => {
    let mounted = true;
    async function finish() {
      if (!fontsLoaded || !splashTimerElapsed || !authChecked) return;
      try {
        await SplashScreenNative.hideAsync();
      } catch {}
      if (mounted) setShowSplash(false);
    }
    finish();
    return () => {
      mounted = false;
    };
  }, [fontsLoaded, splashTimerElapsed, authChecked]);

  // ---- Compute the content, then wrap everything in SafeAreaProvider ----

  let content: React.ReactNode;

  if (!fontsLoaded || showSplash) {
    content = <SplashScreen />;
  } else if (!authChecked) {
    content = null;
  } else {
    const inAuthGroup = segments.includes("(auth)");

    if (!isAuthenticated && !inAuthGroup) {
      content = <Redirect href="/(auth)/login" />;
    } else if (isAuthenticated && inAuthGroup) {
      content = <Redirect href="/(tabs)" />;
    } else {
      content = (
        <MenuProvider>
          <Slot />
        </MenuProvider>
      );
    }
  }

  // SafeAreaProvider MUST wrap everything so useSafeAreaInsets() returns real
  // values. Without it, insets are all 0 and content renders under the notch.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          {content}
          {/* One global sheet, mounted above the navigator so it can never be
              remounted by a screen re-render and always paints over the tabs. */}
          <SheetHost />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
