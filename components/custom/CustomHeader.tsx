import { ThemePalette } from "@/constants/Colors";
import { Dimens } from "@/constants/Dimes";
import { FONTS } from "@/constants/Fonts";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { scale } from "react-native-size-matters";

interface CustomHeaderProps {
  title?: string;
  showTitle?: boolean;
  /**
   * Replaces the plain title in the middle slot. Used by the group detail
   * screen to show the group's identity (photo · name · member count).
   */
  centerContent?: React.ReactNode;
}

const CustomHeader = ({
  title = "",
  showTitle = true,
  centerContent,
}: CustomHeaderProps) => {
  const colors = useColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
        android_ripple={{
          color: colors.rippleColor,
          borderless: true,
          radius: scale(20),
        }}
      >
        <Feather
          name="arrow-left"
          size={scale(24)}
          color={colors.textPrimary}
        />
      </Pressable>

      {centerContent ? (
        <View style={styles.center}>{centerContent}</View>
      ) : (
        showTitle &&
        title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )
      )}

      <Menu
        rendererProps={{
          placement: "bottom",
          anchorStyle: { backgroundColor: "transparent" },
        }}
      >
        <MenuTrigger>
          <View style={styles.backButton}>
            <Feather
              name="more-vertical"
              size={scale(24)}
              color={colors.textPrimary}
            />
          </View>
        </MenuTrigger>

        <MenuOptions
          customStyles={{
            optionsContainer: {
              backgroundColor: colors.card,
              borderRadius: scale(12),
              padding: scale(4),
              shadowColor: colors.primaryShadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
              marginTop: scale(8), // Add spacing from trigger
            },
            optionsWrapper: {
              backgroundColor: "transparent",
            },
          }}
          optionsContainerStyle={{
            marginTop: scale(45), // Position below the icon
          }}
        >
          <MenuOption onSelect={() => console.log("Edit Group")}>
            <View style={styles.menuItem}>
              <Feather
                name="edit-2"
                size={scale(16)}
                color={colors.textPrimary}
              />
              <Text style={styles.menuText}>Edit Group</Text>
            </View>
          </MenuOption>

          <View style={styles.menuDivider} />

          <MenuOption onSelect={() => console.log("delete")}>
            <View style={styles.menuItem}>
              <Feather name="trash-2" size={scale(16)} color="#EF4444" />
              <Text style={[styles.menuText, { color: "#EF4444" }]}>
                Delete
              </Text>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
};

export default CustomHeader;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Dimens.paddingMarginHorizontal,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      flex: 1,
      fontSize: scale(18),
      fontFamily: FONTS.medium,
      color: colors.textPrimary,
      textAlign: "center",
      marginHorizontal: scale(12),
    },
    center: {
      flex: 1,
      marginHorizontal: scale(8),
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: scale(12),
      gap: scale(10),
    },
    menuText: {
      fontSize: scale(14),
      fontFamily: FONTS.medium,
      color: colors.textPrimary,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.background,
      marginVertical: scale(4),
    },
  });
