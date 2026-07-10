import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { getCardDefaults } from "@/constants/Styles";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { scale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";

interface Group {
  id: string;
  name: string;
  memberCount: number;
  coverImage?: string;
  balance: number;
  totalExpenses: number;
}

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
}

const GroupCard = ({ group, onPress }: GroupCardProps) => {
  const colors = useColors();
  const styles = getStyles(colors);

  const isSettled = group.balance === 0;
  const youGetBack = group.balance > 0;

  return (
    <Pressable 
      style={styles.container} 
      onPress={onPress}
      android_ripple={{ color: colors.rippleColor }}
    >
      {/* Group Avatar/Cover */}
      <View style={styles.avatarContainer}>
        {group.coverImage ? (
          <Image 
            source={{ uri: group.coverImage }} 
            style={styles.avatar}
          />
        ) : (
          <LinearGradient
            colors={[colors.main, colors.primaryGradient[1]] as any}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="users" size={scale(24)} color="#FFFFFF" />
          </LinearGradient>
        )}
      </View>

      {/* Group Info */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        <View style={styles.metaRow}>
          <Feather name="user" size={scale(10)} color={colors.textSecondary} />
          <Text style={styles.memberText}>
            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.totalExpenses} numberOfLines={1}>
            ₹{(group.totalExpenses / 1000).toFixed(1)}K spent
          </Text>
        </View>
      </View>

      {/* Balance Info */}
      <View style={styles.balanceSection}>
        {isSettled ? (
          <View style={styles.settledBadge}>
            <Feather name="check-circle" size={scale(14)} color={colors.textSecondary} />
            <Text style={styles.settledText}>Settled</Text>
          </View>
        ) : (
          <View style={styles.balanceContainer}>
            <Text style={[
              styles.balanceAmount,
              youGetBack ? styles.positiveBalance : styles.negativeBalance
            ]} numberOfLines={1}>
              {youGetBack ? '+' : '-'}₹{Math.abs(group.balance).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.balanceLabel}>
              {youGetBack ? 'you get' : 'you owe'}
            </Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <Feather 
        name="chevron-right" 
        size={scale(20)} 
        color={colors.textSecondary} 
      />
    </Pressable>
  );
};

export default GroupCard;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      ...getCardDefaults(colors),
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: scale(12),
      paddingHorizontal: scale(14),
      gap: scale(10),
      marginHorizontal: scale(16),
      marginBottom: scale(10),
    },
    avatarContainer: {
      shadowColor: colors.primaryShadow,
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.1,
      shadowRadius: scale(3),
      elevation: 2,
    },
    avatar: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
    },
    avatarGradient: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
      gap: scale(5),
      minWidth: 0, // Important for text truncation
    },
    name: {
      fontSize: scale(16),
      fontFamily: FONTS.semibold,
      color: colors.textPrimary,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
    },
    memberText: {
      fontSize: scale(11),
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    dot: {
      width: scale(3),
      height: scale(3),
      borderRadius: scale(1.5),
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    totalExpenses: {
      fontSize: scale(11),
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      flex: 1,
    },
    balanceSection: {
      alignItems: "flex-end",
      justifyContent: "center",
    },
    balanceContainer: {
      alignItems: "flex-end",
      gap: scale(2),
      minWidth: scale(85),
    },
    balanceAmount: {
      fontSize: scale(17),
      fontFamily: FONTS.bold,
    },
    positiveBalance: {
      color: "#10B981",
    },
    negativeBalance: {
      color: "#EF4444",
    },
    balanceLabel: {
      fontSize: scale(11),
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    settledBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
      backgroundColor: colors.background,
      paddingHorizontal: scale(10),
      paddingVertical: scale(6),
      borderRadius: scale(12),
    },
    settledText: {
      fontSize: scale(11),
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
  });