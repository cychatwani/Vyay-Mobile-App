import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useColors } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import CircularPictureDisplay from "./CircularPictureDisplay";
import { scale } from "react-native-size-matters";
import NotificationBell from "./NotificationBell";
import { Dimens } from "@/constants/Dimes";

const MainHeaderBar = () => {
  const { user } = useAuthStore();
  const colors = useColors();
  console.log("::", user?.profilePicture);
  return (
    <View
      style={{
        paddingHorizontal: Dimens.paddingMarginHorizontal,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      {
        <CircularPictureDisplay
          src={user?.profilePicture}
          size={40}
          isEditable={false}
        />
      }
      {<NotificationBell count={8} size={25} iconColor={colors.textPrimary} />}
    </View>
  );
};

export default MainHeaderBar;

const getStyle = StyleSheet.create({});
