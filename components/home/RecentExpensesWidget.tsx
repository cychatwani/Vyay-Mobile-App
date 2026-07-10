import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { getCardDefaults } from "@/constants/Styles";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

const RecentExpensesWidget = () => {
  const colors = useColors();
  const styles = getStyles(colors);

  // Static data for now
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
  const totalExpenses = 8450.75;
  const transactionCount = 12;
  const comparedToLastMonth = 15.5; // percentage increase

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Feather name="calendar" size={scale(18)} color={colors.main} />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.monthLabel}>{currentMonth} Expenses</Text>
            <Text style={styles.transactionCount}>{transactionCount} transactions</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.amount}>
            ₹{totalExpenses.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={styles.comparison}>
            <Feather 
              name="trending-up" 
              size={scale(10)} 
              color="#EF4444" 
            />
            <Text style={styles.comparisonText}>
              +{comparedToLastMonth}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RecentExpensesWidget;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      ...getCardDefaults(colors),
      marginHorizontal: scale(16),
      paddingVertical: scale(5),
      paddingHorizontal: scale(14),
      marginTop: scale(10),
    },
    content: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      flex: 1,
    },
    iconContainer: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.main + "15",
      justifyContent: "center",
      alignItems: "center",
    },
    textSection: {
      flex: 1,
    },
    monthLabel: {
      fontSize: scale(12),
      fontFamily: FONTS.medium,
      color: colors.textPrimary,
      marginBottom: scale(2),
    },
    transactionCount: {
      fontSize: scale(10),
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    rightSection: {
      alignItems: "flex-end",
    },
    amount: {
      fontSize: scale(18),
      fontFamily: FONTS.bold,
      color: colors.textPrimary,
      marginBottom: scale(4),
    },
    comparison: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: colors.background,
      paddingHorizontal: scale(8),
      paddingVertical: scale(4),
      borderRadius: scale(8),
    },
    comparisonText: {
      fontSize: scale(10),
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
  });