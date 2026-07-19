import type { SettlementParty } from "../SettlementSuggestions/types";

/**
 * The Group Activity Timeline's domain model.
 *
 * One chronological stream, three kinds of content — each with its own
 * interaction model:
 *
 *   financial events → rich, expandable, full-width cards
 *   messages         → chat bubbles (never expand)
 *   group events     → quiet centered system lines
 *
 * Everything shares `TimelineActor` with the settlement components so the
 * same person renders identically across the whole group screen.
 */

/** A person appearing anywhere in the timeline. Same shape as SettlementParty. */
export type TimelineActor = SettlementParty;

interface TimelineEventBase {
  /** Stable identity — list key, expansion key, recycling key. */
  id: string;
  /** Epoch millis. The single ordering axis of the timeline. */
  createdAt: number;
}

/* ------------------------------------------------------------------ *
 * Financial events (highest priority)
 * ------------------------------------------------------------------ */

/**
 * An expense is money *spent*, not money *moved* — so it deliberately has
 * no direction and no arrows. What matters is who paid and who took part.
 */
export interface ExpenseEvent extends TimelineEventBase {
  kind: "expense";
  /** Whether this card announces creation or a later edit. */
  action: "created" | "updated";
  title: string;
  /** Always positive. */
  amount: number;
  /** ISO 4217, e.g. "INR". */
  currency: string;
  paidBy: TimelineActor;
  participants: TimelineActor[];
  notes?: string;
  receiptUrl?: string;
  attachmentCount?: number;
  /** Who performed the action (creator, or editor for "updated"). */
  actor?: TimelineActor;
}

/**
 * A settlement *is* a transfer — the one financial event where direction
 * (debtor → creditor) is part of the meaning, rendered via PairAvatars.
 */
export interface SettlementEvent extends TimelineEventBase {
  kind: "settlement";
  status: "proposed" | "completed";
  fromUser: TimelineActor;
  toUser: TimelineActor;
  /** Always positive — direction lives in fromUser/toUser. */
  amount: number;
  currency: string;
  notes?: string;
  /** Payment proof (screenshot, receipt). */
  proofUrl?: string;
}

export type FinancialEvent = ExpenseEvent | SettlementEvent;

/* ------------------------------------------------------------------ *
 * Conversation
 * ------------------------------------------------------------------ */

export interface MessageEvent extends TimelineEventBase {
  kind: "message";
  sender: TimelineActor;
  text: string;
}

/* ------------------------------------------------------------------ *
 * Group events (lowest priority)
 * ------------------------------------------------------------------ */

export type GroupEventType =
  | "member_joined"
  | "member_left"
  | "group_renamed"
  | "icon_changed"
  | "description_changed";

export interface GroupEvent extends TimelineEventBase {
  kind: "groupEvent";
  type: GroupEventType;
  actor: TimelineActor;
  /** New name for renames, etc. Optional flavour for the system line. */
  detail?: string;
}

/** Any item that can appear in the unified timeline. */
export type TimelineItem =
  | ExpenseEvent
  | SettlementEvent
  | MessageEvent
  | GroupEvent;

/* ------------------------------------------------------------------ *
 * Render rows — what the FlashList actually draws.
 * Built by timelineUtils.buildTimelineRows(); includes injected day
 * separators and per-message run metadata.
 * ------------------------------------------------------------------ */

/** How a message sits within a run of consecutive bubbles from one sender. */
export interface MessageRunMeta {
  /** First bubble of a run — shows the sender name, gets the tail corner. */
  firstInRun: boolean;
  /** Last bubble of a run — carries the timestamp. */
  lastInRun: boolean;
}

/**
 * A card calls this just before it expands, handing over its root native
 * node and how much taller it is about to get. The list — the only thing
 * that knows where the viewport is and can scroll — decides whether a
 * corrective scroll is needed to keep the card fully visible.
 */
export type EnsureCardVisibleFn = (
  cardNode: import("react-native").View | null,
  growBy: number,
) => void;

export type TimelineRow =
  | { type: "day"; key: string; label: string }
  | { type: "expense"; key: string; event: ExpenseEvent }
  | { type: "settlement"; key: string; event: SettlementEvent }
  | { type: "message"; key: string; event: MessageEvent; run: MessageRunMeta }
  | { type: "groupEvent"; key: string; event: GroupEvent };
