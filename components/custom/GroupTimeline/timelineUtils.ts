import type {
  GroupEvent,
  MessageEvent,
  TimelineActor,
  TimelineItem,
  TimelineRow,
} from "./types";

/**
 * Pure helpers behind the Group Activity Timeline.
 *
 * The backend (eventually) owns the event stream; everything here is
 * UI-only — sorting one merged chronology, injecting day separators,
 * detecting message runs, and turning structured events into copy.
 */

/** Two messages from the same sender within this window read as one run. */
const RUN_WINDOW_MS = 5 * 60 * 1000;

/* ------------------------------- time ------------------------------- */

export const formatClockTime = (ts: number): string =>
  new Date(ts)
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** "Today", "Yesterday", "12 July", "12 July 2025". */
export const formatDayLabel = (ts: number, now = new Date()): string => {
  const d = new Date(ts);
  if (isSameDay(d, now)) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Yesterday";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : null),
  });
};

const dayKeyOf = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/* ------------------------------ people ------------------------------ */

const sameId = (a: string | number, b: string | number) =>
  String(a) === String(b);

export const isViewer = (
  actor: TimelineActor | undefined,
  viewerId: string | number,
): boolean => actor != null && sameId(actor.id, viewerId);

/** "You" for the viewer, the person's name otherwise. */
export const displayName = (
  actor: TimelineActor,
  viewerId: string | number,
): string => (isViewer(actor, viewerId) ? "You" : actor.name);

export const firstNameOf = (name: string): string =>
  name.trim().split(/\s+/)[0] ?? name;

/* --------------------------- system copy ---------------------------- */

/** The quiet one-liner a group event renders as. */
export const groupEventText = (
  event: GroupEvent,
  viewerId: string | number,
): string => {
  const who = displayName(event.actor, viewerId);
  switch (event.type) {
    case "member_joined":
      return `${who} joined the group`;
    case "member_left":
      return `${who} left the group`;
    case "group_renamed":
      return event.detail
        ? `${who} renamed the group to \u201C${event.detail}\u201D`
        : `${who} renamed the group`;
    case "icon_changed":
      return `${who} changed the group icon`;
    case "description_changed":
      return `${who} updated the group description`;
  }
};

/* --------------------------- row building --------------------------- */

const isRunPeer = (a: MessageEvent, b: MessageEvent) =>
  sameId(a.sender.id, b.sender.id) &&
  Math.abs(a.createdAt - b.createdAt) <= RUN_WINDOW_MS &&
  isSameDay(new Date(a.createdAt), new Date(b.createdAt));

/**
 * Merge every kind of item into the flat row list the FlashList renders.
 *
 * Works in chronological order (day separators, message runs), then
 * reverses — the list is inverted so the newest activity sits at the
 * bottom, chat-style, ready for the composer that will be pinned there.
 */
export const buildTimelineRows = (
  items: TimelineItem[],
  now = new Date(),
): TimelineRow[] => {
  const sorted = [...items].sort((a, b) => a.createdAt - b.createdAt);
  const rows: TimelineRow[] = [];
  let currentDayKey: string | null = null;

  sorted.forEach((item, i) => {
    const dayKey = dayKeyOf(item.createdAt);
    if (dayKey !== currentDayKey) {
      currentDayKey = dayKey;
      rows.push({
        type: "day",
        key: `day-${dayKey}`,
        label: formatDayLabel(item.createdAt, now),
      });
    }

    switch (item.kind) {
      case "message": {
        const prev = sorted[i - 1];
        const next = sorted[i + 1];
        rows.push({
          type: "message",
          key: item.id,
          event: item,
          run: {
            firstInRun: !(prev?.kind === "message" && isRunPeer(prev, item)),
            lastInRun: !(next?.kind === "message" && isRunPeer(item, next)),
          },
        });
        break;
      }
      case "expense":
        rows.push({ type: "expense", key: item.id, event: item });
        break;
      case "settlement":
        rows.push({ type: "settlement", key: item.id, event: item });
        break;
      case "groupEvent":
        rows.push({ type: "groupEvent", key: item.id, event: item });
        break;
    }
  });

  // Inverted list: index 0 renders at the visual bottom. Reversing puts the
  // newest row first while each day header (pushed before its day's oldest
  // item) lands at a higher index — i.e. visually above its day. Exactly
  // where a separator belongs.
  return rows.reverse();
};
