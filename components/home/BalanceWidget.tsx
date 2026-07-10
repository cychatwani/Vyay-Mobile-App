import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { getCardDefaults } from "@/constants/Styles";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

const BalanceWidget = () => {
  const colors = useColors();
  const styles = getStyles(colors);
  
  // Static values for now
  const youOwe = 12450.50;
  const youAreOwed = 3680.75;
  const netBalance = youAreOwed - youOwe;
  const isPositive = netBalance > 0;
  
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={[styles.innerCard, styles.owedCard]}>
          <View style={styles.iconContainer}>
            <View style={[styles.icon, styles.owedIcon]}>
              <Feather name="arrow-down-right" size={scale(16)} color="#10B981" />
            </View>
          </View>
          <Text style={styles.label}>You're Owed</Text>
          <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
            ₹{youAreOwed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, styles.owedDot]} />
            <Text style={styles.badgeText}>Receivable</Text>
          </View>
        </View>

        <View style={[styles.innerCard, styles.oweCard]}>
          <View style={styles.iconContainer}>
            <View style={[styles.icon, styles.oweIcon]}>
              <Feather name="arrow-up-right" size={scale(16)} color="#EF4444" />
            </View>
          </View>
          <Text style={styles.label}>You Owe</Text>
          <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
            ₹{youOwe.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, styles.oweDot]} />
            <Text style={styles.badgeText}>Payable</Text>
          </View>
        </View>
      </View>

      {/* Net Balance Card */}
      <View style={styles.netBalanceCard}>
        <View style={styles.netBalanceContent}>
          <Text style={styles.netBalanceLabel}>Net Balance</Text>
          <Text style={[styles.netBalanceAmount, isPositive ? styles.positiveAmount : styles.negativeAmount]}>
            {isPositive ? '+' : '-'}₹{Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={[styles.netBadge, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
          <View style={[styles.badgeDot, isPositive ? styles.owedDot : styles.oweDot]} />
          <Text style={styles.netBadgeText}>{isPositive ? 'You get back' : 'You pay'}</Text>
        </View>
      </View>
    </View>
  );
};

export default BalanceWidget;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    wrapper: {
      gap: scale(10),
    },
    container: {
      flexDirection: "row",
      paddingHorizontal: scale(16),
      gap: scale(12),
    },
    innerCard: {
      ...getCardDefaults(colors),
      flex: 1,
      width: 0, // Force equal width distribution
      paddingVertical: scale(12),
      paddingHorizontal: scale(8),
      alignItems: "center",
      marginHorizontal: 0,
    },
    oweCard: {
      borderLeftWidth: scale(3),
      borderLeftColor: "#EF4444",
    },
    owedCard: {
      borderLeftWidth: scale(3),
      borderLeftColor: "#10B981",
    },
    iconContainer: {
      marginBottom: scale(8),
    },
    icon: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      justifyContent: "center",
      alignItems: "center",
    },
    oweIcon: {
      backgroundColor: "#FEE2E2",
    },
    owedIcon: {
      backgroundColor: "#D1FAE5",
    },
    label: {
      fontSize: scale(11),
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginBottom: scale(6),
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    amount: {
      fontSize: scale(16),
      fontFamily: FONTS.bold,
      color: colors.textPrimary,
      marginBottom: scale(8),
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.badgeBackgorund,
      paddingHorizontal: scale(8),
      paddingVertical: scale(5),
      borderRadius: scale(10),
      gap: scale(5),
    },
    badgeDot: {
      width: scale(5),
      height: scale(5),
      borderRadius: scale(2.5),
    },
    oweDot: {
      backgroundColor: "#EF4444",
    },
    owedDot: {
      backgroundColor: "#10B981",
    },
    badgeText: {
      fontSize: scale(9),
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    // Net Balance Card Styles
    netBalanceCard: {
      ...getCardDefaults(colors),
      marginHorizontal: scale(16),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: scale(8),
      paddingHorizontal: scale(14),
    },
    netBalanceContent: {
      flex: 1,
    },
    netBalanceLabel: {
      fontSize: scale(11),
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: scale(2),
    },
    netBalanceAmount: {
      fontSize: scale(16),
      fontFamily: FONTS.bold,
    },
    positiveAmount: {   
      color: "#10B981",
    },
    negativeAmount: {
      color: "#EF4444",
    },
    netBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(10),
      paddingVertical: scale(5),
      borderRadius: scale(12),
      gap: scale(5),
    },
    positiveBadge: {
      backgroundColor: "#D1FAE5",
    },
    negativeBadge: {
      backgroundColor: "#FEE2E2",
    },
    netBadgeText: {
      fontSize: scale(10),
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
  });