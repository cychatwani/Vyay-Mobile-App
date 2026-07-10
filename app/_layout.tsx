// app/_layout.tsx
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";

import SplashScreen from "@/components/custom/SplashScreen";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Redirect, Slot, useSegments } from "expo-router";
import * as SplashScreenNative from "expo-splash-screen";

import { SignInWithRefreshToken } from "@/auth/coreAuth";
import { getRefreshToken } from "@/auth/refreshTokenUtils";
import { MenuProvider } from 'react-native-popup-menu';


const MIN_SPLASH_MS = 2500; // 2.5s minimum

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
  const [splashTimerElapsed, setSplashTimerElapsed] = useState(globalSplashShown);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // minimum splash timer
  useEffect(() => {
    // Skip if splash already shown
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
    // Only run once
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    let mounted = true;

    async function checkAuth() {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          console.log("[auth] Found refresh token, trying silent refresh");
          
          // Wait for the refresh to complete
          await SignInWithRefreshToken(refreshToken, () => {
            console.log("[auth] Silent refresh successful");
          });
          
          // Only set authenticated if we reach here without error
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
  }, []); // Empty dependency array - only run once

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

  // still showing splash
  if (!fontsLoaded || showSplash) {
    return <SplashScreen />;
  }

  // Wait for auth check to complete before showing any content
  if (!authChecked) {
    return null; // or return <SplashScreen /> if you prefer
  }

  // redirect logic based on auth state
  const inAuthGroup = segments.includes("(auth)");
  
  console.log("[layout] isAuthenticated:", isAuthenticated, "inAuthGroup:", inAuthGroup, "segments:", segments);
  
  // If not authenticated and not already in auth group, redirect to login
  if (!isAuthenticated && !inAuthGroup) {
    console.log("[layout] Redirecting to login");
    return <Redirect href="/(auth)/login" />;
  }
  
  // If authenticated and in auth group, redirect to main app
  if (isAuthenticated && inAuthGroup) {
    console.log("[layout] Redirecting to main app");
    return <Redirect href="/(tabs)" />;
  }

  console.log("[layout] Rendering Slot");
  // Allow the route to render - wrapped with MenuProvider
  return (
    <MenuProvider>
      <Slot />
    </MenuProvider>
  );
}