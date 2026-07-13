import React from "react";
import { View } from "react-native";

import { Dimens } from "@/constants/Dimes";
import { useAuthStore } from "@/store/authStore";
import { useColorsV2 } from "@/store/themeStore";

import CircularPictureDisplay from "./CircularPictureDisplay";
import NotificationBell from "./NotificationBell";
import Logo from "./custom/Logo";

const MainHeaderBar = () => {
  const { user } = useAuthStore();
  const colors = useColorsV2();

  return (
    <View
      style={{
        paddingHorizontal: Dimens.screenH,
        paddingVertical: Dimens.vSm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left */}
      <Logo size={110} color={colors.text} />

      {/* Right */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: Dimens.lg,
        }}
      >
        <NotificationBell count={8} size={25} iconColor={colors.text} />
        <CircularPictureDisplay
          src={user?.profilePicture}
          size={40}
          isEditable={false}
        />
      </View>
    </View>
  );
};

export default MainHeaderBar;
