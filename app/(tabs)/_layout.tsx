// app/(tabs)/_layout.tsx
import { Tabs, useSegments } from "expo-router";

import { TabBar } from "@/components/TabBar";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments() as string[];

  // Hide tab bar if we're in the auth group
  const inAuthGroup = segments.includes("(auth)");

  return (
    <Tabs
      tabBar={(props) => {
        if (inAuthGroup) return null;
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
          title: "Contacts",
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
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
