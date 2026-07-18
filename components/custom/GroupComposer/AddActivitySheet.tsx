import type { ThemePaletteV2 } from "@/constants/ColorsV2";
import { Dimens } from "@/constants/Dimes";
import { getSubtitleV2, getTitleV2 } from "@/constants/Styles";
import { useColorsV2 } from "@/store/themeStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import ActivityActionRow from "./ActivityActionRow";
import type { ActivityAction, ActivityActionId } from "./types";

interface AddActivitySheetProps {
  onSelect: (id: ActivityActionId) => void;
  /** Override to add or reorder actions. Defaults to expense + settlement. */
  actions?: readonly ActivityAction[];
}

/**
 * What "💰 Add Activity" opens: a short, deliberate menu of financial
 * actions, rendered in the app's one global sheet (SheetHost).
 *
 * The list is data, not layout — adding a future action (Scan Receipt,
 * Attach File, Reminder…) is one entry in DEFAULT_ACTIONS plus a branch in
 * whoever handles onSelect. Nothing here needs to change.
 */
const DEFAULT_ACTIONS: readonly ActivityAction[] = [
  {
    id: "expense",
    icon: "shopping-bag", // same glyph the timeline uses for expenses
    title: "Add Expense",
    description: "Record a shared expense.",
  },
  {
    id: "settlement",
    icon: "repeat",
    title: "Record Settlement",
    description: "Record a payment between members.",
  },
];

/** Snap point sized to the sheet's content; exported for the caller. */
export const ADD_ACTIVITY_SHEET_SNAP = verticalScale(250);

const AddActivitySheet = ({
  onSelect,
  actions = DEFAULT_ACTIONS,
}: AddActivitySheetProps) => {
  const colors = useColorsV2();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Activity</Text>
      <Text style={styles.subtitle}>What would you like to record?</Text>

      <View style={styles.list}>
        {actions.map((action) => (
          <ActivityActionRow
            key={action.id}
            action={action}
            onPress={(a) => onSelect(a.id)}
          />
        ))}
      </View>
    </View>
  );
};

const getStyles = (colors: ThemePaletteV2) =>
  StyleSheet.create({
    container: {
      gap: Dimens.xs,
    },
    title: {
      ...getTitleV2(colors),
    },
    subtitle: {
      ...getSubtitleV2(colors),
    },
    list: {
      marginTop: Dimens.sm,
      gap: Dimens.xs,
    },
  });

export default AddActivitySheet;
