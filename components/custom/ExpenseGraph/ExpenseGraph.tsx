import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { getCardDefaults } from "@/constants/Styles";
import { useColors } from "@/store/themeStore";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { scale } from "react-native-size-matters";
import Feather from "react-native-vector-icons/Feather";

interface ExpenseEntry {
  name: string;
  amount: number; // positive = they owe you, negative = you owe them
}

interface ExpenseGraphProps {
  expenses: ExpenseEntry[];
}

const MIN_WIDTH = 30; // percent
const MAX_WIDTH = 100; // percent

const ExpenseGraph = ({ expenses }: ExpenseGraphProps) => {
  const colors = useColors();
  const styles = getStyles(colors);

  const [expanded, setExpanded] = useState(true);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  // Max absolute value across all amounts
  const maxAbsValue =
    expenses.length === 0
      ? 1
      : Math.max(...expenses.map((e) => Math.abs(e.amount)));

  // Calculate width percentage in range [MIN_WIDTH, 100]
  const getBarWidth = (amount: number) => {
    if (maxAbsValue === 0) return MIN_WIDTH;

    const ratio = Math.abs(amount) / maxAbsValue; // 0 -> 1
    const width = MIN_WIDTH + ratio * (MAX_WIDTH - MIN_WIDTH); // 30% -> 100%

    return width;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable style={styles.header} onPress={toggleExpand}>
        <Text style={styles.title}>Member Balances</Text>
        <View
          style={{
            transform: [
              {
                rotate: expanded ? "0deg" : "180deg",
              },
            ],
          }}
        >
          <Feather
            name="chevron-up"
            size={scale(20)}
            color={colors.textPrimary}
          />
        </View>
      </Pressable>

      {/* Collapsible content */}
      {expanded && (
        <View style={styles.content}>
          {expenses.map((expense, index) => {
            const isPositive = expense.amount > 0;
            const barWidth = getBarWidth(expense.amount);

            return (
              <View key={index} style={styles.row}>
                {/* Left side - Name OR Bar */}
                <View style={styles.leftContainer}>
                  {isPositive ? (
                    // Show name on left when bar is on right
                    <Text style={styles.leftName} numberOfLines={1}>
                      {expense.name}
                    </Text>
                  ) : (
                    // Show bar on left when negative
                    <View
                      style={[
                        styles.leftBar,
                        { width: `${barWidth}%` },
                      ]}
                    >
                      <Text style={styles.leftAmount}>
                        ₹{Math.abs(expense.amount).toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Center divider */}
                <View style={styles.divider} />

                {/* Right side - Bar OR Name */}
                <View style={styles.rightContainer}>
                  {isPositive ? (
                    // Show bar on right when positive
                    <View
                      style={[
                        styles.rightBar,
                        { width: `${barWidth}%` },
                      ]}
                    >
                      <Text style={styles.rightAmount}>
                        ₹{expense.amount.toFixed(2)}
                      </Text>
                    </View>
                  ) : (
                    // Show name on right when bar is on left
                    <Text style={styles.rightName} numberOfLines={1}>
                      {expense.name}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ExpenseGraph;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      ...getCardDefaults(colors),
      marginHorizontal: scale(2),
      paddingVertical: scale(16),
      paddingHorizontal: scale(5),
      gap: scale(12),
    },

    // NEW: header + title + content wrapper
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(6),
      paddingVertical: scale(2),
    },
    title: {
      fontSize: scale(15),
      fontFamily: FONTS.bold,
      color: colors.textPrimary,
    },
    content: {
      gap: scale(12),
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: scale(40),
    },
    leftContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: scale(8),
    },
    leftName: {
      fontSize: scale(13),
      fontFamily: FONTS.medium,
      color: colors.textPrimary,
      textAlign: "right",
      flex: 1,
    },
    leftBar: {
      backgroundColor: "#FEE2E2",
      borderTopLeftRadius: scale(8),
      borderBottomLeftRadius: scale(8),
      paddingVertical: scale(8),
      paddingHorizontal: scale(10),
      alignItems: "flex-end",
      minWidth: "30%",
    },
    leftAmount: {
      fontSize: scale(13),
      fontFamily: FONTS.bold,
      color: "#EF4444",
    },
    divider: {
      width: scale(2),
      height: "100%",
      backgroundColor: colors.background,
    },
    rightContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingLeft: scale(8),
    },
    rightBar: {
      backgroundColor: "#D1FAE5",
      borderTopRightRadius: scale(8),
      borderBottomRightRadius: scale(8),
      paddingVertical: scale(8),
      paddingHorizontal: scale(10),
      alignItems: "flex-start",
      minWidth: "30%",
    },
    rightAmount: {
      fontSize: scale(13),
      fontFamily: FONTS.bold,
      color: "#10B981",
    },
    rightName: {
      fontSize: scale(13),
      fontFamily: FONTS.medium,
      color: colors.textPrimary,
      textAlign: "left",
      flex: 1,
    },
  });
