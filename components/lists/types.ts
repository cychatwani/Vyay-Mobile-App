import type { Feather } from "@expo/vector-icons";
import type React from "react";

/**
 * One row of the friend list. Pure display data — no API shape implied.
 *
 * Conceptually every friend row is a shortcut into the private two-member
 * INDIVIDUAL group shared with that friend — balances never exist directly
 * between two people, only inside groups.
 */
export interface FriendListItemData {
  id: string;
  name: string;
  avatarUrl?: string;
  /**
   * Balance of the private 1:1 INDIVIDUAL group with this friend only:
   * positive → they owe you, negative → you owe them, ~0 → settled.
   * Shared (regular) group balances are NOT part of this number.
   */
  balance: number;
  /**
   * Pre-formatted last activity inside the 1:1 group,
   * e.g. `Added "Cab fare" · 2d ago`.
   */
  lastActivity: string;
}

export type GroupIconName = React.ComponentProps<typeof Feather>["name"];

/** One row of the group list. Pure display data — no API shape implied. */
export interface GroupListItemData {
  id: string;
  name: string;
  /** Group photo. When absent, `icon` renders on a tinted tile. */
  photoUrl?: string;
  /** Fallback tile icon when there is no photo. */
  icon?: GroupIconName;
  memberCount: number;
  /**
   * Your net position in the group: positive → you get back,
   * negative → you owe, ~0 → settled.
   */
  balance: number;
  /** Pre-formatted last-activity line, e.g. `Rahul added "Dinner" · 2h ago`. */
  lastActivity: string;
}
