import type { Feather } from "@expo/vector-icons";

/**
 * The activity types the composer can start. Today there are two; the
 * sheet renders whatever list it's given, so future entries (scan receipt,
 * attach file, reminder…) are one array element each — no layout changes.
 */
export type ActivityActionId = "expense" | "settlement";

export interface ActivityAction {
  id: ActivityActionId;
  /** Feather glyph shown in the row's icon chip. */
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description: string;
}
