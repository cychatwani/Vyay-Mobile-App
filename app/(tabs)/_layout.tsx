// app/(tabs)/_layout.tsx
import { Tabs, useSegments } from "expo-router";

import { TabBar } from "@/components/TabBar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUiStore } from "@/store/uiStore";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments() as string[];

  // Hide tab bar if we're in the auth group
  const inAuthGroup = segments.includes("(auth)");

  // Hide tab bar while a bottom sheet is open so it doesn't stack above it
  const isSheetOpen = useUiStore((s) => s.isSheetOpen);

  return (
    <Tabs
      tabBar={(props) => {
        if (inAuthGroup) return null;
        // if (isSheetOpen) return null;
        return <TabBar {...props} />;
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
        }}
      />
    </Tabs>
  );
}
