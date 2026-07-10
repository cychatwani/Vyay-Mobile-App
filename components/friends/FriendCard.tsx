import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { getCardDefaults } from "@/constants/Styles";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { scale } from "react-native-size-matters";

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  balance: number; // positive = they owe you, negative = you owe them
}

interface FriendCardProps {
  friend: Friend;
  onPress?: () => void;
}

const FriendCard = ({ friend, onPress }: FriendCardProps) => {
  const colors = useColors();
  const styles = getStyles(colors);

  const fullName = `${friend.firstName} ${friend.lastName}`;
  const initials = `${friend.firstName.charAt(0)}${friend.lastName.charAt(0)}`;
  const isSettled = friend.balance === 0;
  const owesYou = friend.balance > 0;

  return (
    <Pressable 
      style={styles.container} 
      onPress={onPress}
      android_ripple={{ color: colors.rippleColor }}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {friend.photoUrl ? (
          <Image 
            source={{ uri: friend.photoUrl }} 
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
      </View>

      {/* Friend Info */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {fullName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {friend.email}
        </Text>
      </View>

      {/* Balance Info */}
      <View style={styles.balanceContainer}>
        {isSettled ? (
          <View style={styles.settledBadge}>
            <Feather name="check-circle" size={scale(14)} color={colors.textSecondary} />
            <Text style={styles.settledText}>Settled</Text>
          </View>
        ) : (
          <>
            <Text style={[
              styles.balanceAmount,
              owesYou ? styles.positiveBalance : styles.negativeBalance
            ]}>
              {owesYou ? '+' : '-'}₹{Math.abs(friend.balance).toFixed(2)}
            </Text>
            <Text style={styles.balanceLabel}>
              {owesYou ? 'owes you' : 'you owe'}
            </Text>
          </>
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

export default FriendCard;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      ...getCardDefaults(colors),
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: scale(12),
      paddingHorizontal: scale(14),
      gap: scale(12),
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
    avatarPlaceholder: {
      backgroundColor: colors.main + "20",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontSize: scale(18),
      fontFamily: FONTS.bold,
      color: colors.main,
    },
    content: {
      flex: 1,
      gap: scale(3),
    },
    name: {
      fontSize: scale(15),
      fontFamily: FONTS.semibold,
      color: colors.textPrimary,
    },
    email: {
      fontSize: scale(12),
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    balanceContainer: {
      alignItems: "flex-end",
      minWidth: scale(80),
    },
    balanceAmount: {
      fontSize: scale(16),
      fontFamily: FONTS.bold,
      marginBottom: scale(2),
    },
    positiveBalance: {
      color: "#10B981",
    },
    negativeBalance: {
      color: "#EF4444",
    },
    balanceLabel: {
      fontSize: scale(10),
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