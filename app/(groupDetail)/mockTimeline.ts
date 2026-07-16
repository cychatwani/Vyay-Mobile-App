import type {
  TimelineActor,
  TimelineItem,
} from "@/components/custom/GroupTimeline/types";

/**
 * Placeholder activity stream until the group events API is wired in.
 * People here are the same demo members as the balances/settlement mocks
 * (Charlotte, u2, is the stand-in viewer), so the whole screen tells one
 * consistent story.
 */

const ANDREW: TimelineActor = {
  id: "u1",
  name: "Andrew Ainsley",
  avatarUrl: "https://i.pravatar.cc/150?img=12",
};
const CHARLOTTE: TimelineActor = {
  id: "u2",
  name: "Charlotte Hanlin",
  avatarUrl: "https://i.pravatar.cc/150?img=47",
};
const KRISTIN: TimelineActor = {
  id: "u4",
  name: "Kristin Watson",
  avatarUrl: "https://i.pravatar.cc/150?img=32",
};
const MARYLAND: TimelineActor = {
  id: "u6",
  name: "Maryland Winkles",
  avatarUrl: "https://i.pravatar.cc/150?img=5",
};
const PRIYA: TimelineActor = {
  id: "u7",
  name: "Priya Sharma",
  avatarUrl: "https://i.pravatar.cc/150?img=45",
};
const RAHUL: TimelineActor = { id: "u8", name: "Rahul Mehta" };
const NEHA: TimelineActor = {
  id: "u9",
  name: "Neha Kapoor",
  avatarUrl: "https://i.pravatar.cc/150?img=25",
};
const HARSH: TimelineActor = { id: "u23", name: "Harsh Mehta" };
const AMAN: TimelineActor = {
  id: "u27",
  name: "Aman Choudhary",
  avatarUrl: "https://i.pravatar.cc/150?img=27",
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const NOW = Date.now();

export const MOCK_TIMELINE: TimelineItem[] = [
  /* ------------------------- three days ago ------------------------- */
  {
    kind: "groupEvent",
    id: "ge1",
    type: "member_joined",
    actor: RAHUL,
    createdAt: NOW - 3 * DAY - 6 * HOUR,
  },
  {
    kind: "message",
    id: "m1",
    sender: ANDREW,
    text: "Everyone landed? Cab from the airport is sorted, meet at gate 3.",
    createdAt: NOW - 3 * DAY - 5 * HOUR,
  },
  {
    kind: "message",
    id: "m2",
    sender: PRIYA,
    text: "Just picked up my bag, 5 mins!",
    createdAt: NOW - 3 * DAY - 5 * HOUR + 3 * MIN,
  },
  {
    kind: "expense",
    id: "e1",
    action: "created",
    title: "Beach shack lunch",
    amount: 2340,
    currency: "INR",
    paidBy: ANDREW,
    participants: [ANDREW, CHARLOTTE, KRISTIN, MARYLAND, PRIYA, NEHA],
    notes: "First meal of the trip — prawns were worth every rupee.",
    receiptUrl: "https://picsum.photos/seed/receipt1/640/360",
    createdAt: NOW - 3 * DAY - 2 * HOUR,
  },
  {
    kind: "message",
    id: "m3",
    sender: MARYLAND,
    text: "Added the lunch bill, check the split once ^",
    createdAt: NOW - 3 * DAY - 2 * HOUR + 6 * MIN,
  },

  /* ---------------------------- yesterday ---------------------------- */
  {
    kind: "message",
    id: "m4",
    sender: NEHA,
    text: "Scuba slots confirmed for 7am tomorrow",
    createdAt: NOW - DAY - 9 * HOUR,
  },
  {
    kind: "message",
    id: "m5",
    sender: NEHA,
    text: "They need the balance paid at the counter, I'll cover it and add it here.",
    createdAt: NOW - DAY - 9 * HOUR + 2 * MIN,
  },
  {
    kind: "expense",
    id: "e2",
    action: "updated",
    title: "Scuba diving \u2014 Grande Island",
    amount: 5600,
    currency: "INR",
    paidBy: NEHA,
    participants: [NEHA, ANDREW, CHARLOTTE, PRIYA, RAHUL, KRISTIN, MARYLAND, AMAN],
    notes: "Updated with the GoPro rental \u2014 split it evenly since we're all in the footage anyway.",
    attachmentCount: 2,
    actor: NEHA,
    createdAt: NOW - DAY - 4 * HOUR,
  },
  {
    kind: "settlement",
    id: "s1",
    status: "proposed",
    fromUser: MARYLAND,
    toUser: AMAN,
    amount: 6420.5,
    currency: "INR",
    notes: "Will transfer after salary hits on the 1st \uD83D\uDE05",
    createdAt: NOW - DAY - 3 * HOUR,
  },
  {
    kind: "groupEvent",
    id: "ge2",
    type: "group_renamed",
    actor: KRISTIN,
    detail: "Goa Trip 2024",
    createdAt: NOW - DAY - 2 * HOUR,
  },
  {
    kind: "message",
    id: "m6",
    sender: CHARLOTTE,
    text: "Renamed it so it stops clashing with the office group \uD83D\uDE05",
    createdAt: NOW - DAY - 2 * HOUR + 4 * MIN,
  },

  /* ------------------------------ today ------------------------------ */
  {
    kind: "expense",
    id: "e3",
    action: "created",
    title: "Cab to airport",
    amount: 980,
    currency: "INR",
    paidBy: CHARLOTTE,
    participants: [CHARLOTTE, ANDREW, PRIYA, NEHA],
    createdAt: NOW - 7 * HOUR,
  },
  {
    kind: "message",
    id: "m7",
    sender: ANDREW,
    text: "That went by too fast. Same crew for Gokarna next time?",
    createdAt: NOW - 6 * HOUR,
  },
  {
    kind: "message",
    id: "m8",
    sender: CHARLOTTE,
    text: "Count me in. Settling my share now so we start clean \uD83D\uDCB8",
    createdAt: NOW - 6 * HOUR + 2 * MIN,
  },
  {
    kind: "settlement",
    id: "s2",
    status: "completed",
    fromUser: CHARLOTTE,
    toUser: HARSH,
    amount: 728.5,
    currency: "INR",
    proofUrl: "https://picsum.photos/seed/upiproof/640/360",
    createdAt: NOW - 5 * HOUR,
  },
  {
    kind: "groupEvent",
    id: "ge3",
    type: "icon_changed",
    actor: PRIYA,
    createdAt: NOW - 3 * HOUR,
  },
  {
    kind: "message",
    id: "m9",
    sender: PRIYA,
    text: "New icon is the sunset from Chapora fort \uD83C\uDF05",
    createdAt: NOW - 3 * HOUR + MIN,
  },
  {
    kind: "message",
    id: "m10",
    sender: PRIYA,
    text: "Full album link coming tonight",
    createdAt: NOW - 3 * HOUR + 3 * MIN,
  },
];
