import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { scale } from "react-native-size-matters";
import { useColors } from "@/store/themeStore";
import { FONTS } from "@/constants/Fonts";

const LoginTypeBadge = () => {
  const colors = useColors();
  return (
    <View
      style={{
        paddingHorizontal: scale(10),
        paddingVertical: scale(6),
        backgroundColor: colors.badgeBackgorund,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start", // This makes it take only required width
        borderRadius: scale(25), // Optional: adds rounded corners
        padding:scale(7)
      }}
    >
      <Image
        source={require("../../assets/images/goolgeIcon.png")}
        style={{ height: scale(20), width: scale(20), resizeMode: "contain" }}
      />
      <Text style={{ marginLeft: scale(6), fontSize: scale(12), fontFamily:FONTS.medium }}>
        Logged in with Google
      </Text>
    </View>
  );
};

export default LoginTypeBadge;

const styles = StyleSheet.create({});