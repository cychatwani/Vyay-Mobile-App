import { ThemePalette } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { getCardDefaults } from "@/constants/Styles";
import { useColors } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import Svg, { Circle, G } from "react-native-svg";

const ExpenseByCategoryWidget = () => {
  const colors = useColors();
  const styles = getStyles(colors);

  // Static data for now
  const categories = [
    { name: "Food", amount: 3250.5, icon: "coffee", color: "#F59E0B" },
    { name: "Transport", amount: 1820.0, icon: "navigation", color: "#3B82F6" },
    { name: "Entertainment", amount: 2180.25, icon: "film", color: "#8B5CF6" },
    { name: "Shopping", amount: 1200.0, icon: "shopping-bag", color: "#EC4899" },
  ];

  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

  // Calculate pie chart segments
  let currentAngle = -90; // Start from top
  const segments = categories.map((category) => {
    const percentage = (category.amount / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...category,
      percentage,
      startAngle,
      angle,
    };
  });

  const size = scale(90);
  const strokeWidth = scale(16);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Category Breakdown</Text>
      </View>

      <View style={styles.content}>
        {/* Pie Chart */}
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            <G rotation={0} origin={`${size / 2}, ${size / 2}`}>
              {segments.map((segment, index) => {
                const dashArray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                const dashOffset = -((segment.startAngle + 90) / 360) * circumference;
                
                return (
                  <Circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </G>
          </Svg>
          <View style={styles.chartCenter}>
            <Text style={styles.totalAmount}>
              ₹{(total / 1000).toFixed(1)}K
            </Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {categories.map((category, index) => {
            const percentage = ((category.amount / total) * 100).toFixed(0);
            return (
              <View key={index} style={styles.legendItem}>
                <View style={styles.legendLeft}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <Text style={styles.legendName}>{category.name}</Text>
                </View>
                <Text style={styles.legendPercentage}>{percentage}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default ExpenseByCategoryWidget;

const getStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      ...getCardDefaults(colors),
      marginHorizontal: scale(16),
      paddingVertical: scale(12),
      paddingHorizontal: scale(14),
      marginTop: scale(10),
    },
    header: {
      marginBottom: scale(10),
    },
    title: {
      fontSize: scale(13),
      fontFamily: FONTS.medium,
      color: colors.textPrimary,
    },
    content: {
      flexDirection: "row",
      gap: scale(14),
      alignItems: "center",
    },
    chartContainer: {
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
    },
    chartCenter: {
      position: "absolute",
      alignItems: "center",
    },
    totalAmount: {
      fontSize: scale(14),
      fontFamily: FONTS.bold,
      color: colors.textPrimary,
    },
    legend: {
      flex: 1,
      gap: scale(6),
    },
    legendItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    legendLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      flex: 1,
    },
    colorDot: {
      width: scale(8),
      height: scale(8),
      borderRadius: scale(4),
    },
    legendName: {
      fontSize: scale(11),
      fontFamily: FONTS.medium,
      color: colors.textPrimary,
    },
    legendPercentage: {
      fontSize: scale(11),
      fontFamily: FONTS.bold,
      color: colors.textPrimary,
    },
  });