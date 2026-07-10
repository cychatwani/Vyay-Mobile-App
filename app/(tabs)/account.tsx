import { StyleSheet, Text, View } from "react-native";
import React from "react";
import SafeView from "@/components/custom/SafeView/SafeView";
import { useColors } from "@/store/themeStore";
import MainHeaderBar from "@/components/MainHeaderBar";
import NameCard from "@/components/account/_NameCard";
import { Dimens } from "@/constants/Dimes";
import IdentityCard from "@/components/account/IdentityCard";
import SettingsLink from "@/components/account/SettingsLink";
import SwipeToLogout from "@/components/account/SwipeToLogout";

const account = () => {
  const colors = useColors();
  return (
    <SafeView
      style={{ flex: 1, backgroundColor: colors.background }}
      statusBarColor={colors.background}
      statusBarStyle="dark-content"
    >
      <MainHeaderBar />
      <View style={{ marginTop: Dimens.paddingMarginHorizontal }}>
        <NameCard />
        <View style={{ marginTop:Dimens.paddingMarginHorizontal }}>
          <IdentityCard />
        </View>
        <View style={{ marginTop:Dimens.paddingMarginHorizontal }}>
          <SettingsLink/>
        </View>
        <View style={{ marginTop:Dimens.paddingMarginHorizontal }}>
          <SwipeToLogout onLogout={()=>{console.log("Will logout now")}}/>
        </View>
      </View>
    </SafeView>
  );
};

export default account;

const styles = StyleSheet.create({});
