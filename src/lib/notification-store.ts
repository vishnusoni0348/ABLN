import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";
import type { ImageSourcePropType } from "react-native";
import type { Ionicons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type NotificationKind = "connections" | "introductions" | "opportunities" | "events" | "membership";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  // Bold part and the rest of the sentence are split so the list can emphasise the subject.
  title: string;
  body: string;
  time: string;
  group: "Today" | "Yesterday";
  read: boolean;
  icon: IconName;
  // Set for notifications about a person; shown as an avatar instead of the icon.
  person?: { name: string; role: string; company: string; location: string; tags: string[]; verified?: boolean; photo?: ImageSourcePropType };
  detail: string;
};

export const KIND_LABEL: Record<NotificationKind, string> = {
  connections: "Connections",
  introductions: "Introductions",
  opportunities: "Opportunities",
  events: "Events",
  membership: "Membership",
};

// Sample content until the notifications API is wired up.
const SEED: AppNotification[] = [
  {
    id: "n1",
    kind: "connections",
    title: "Rahul Agarwal",
    body: "accepted your connection request.",
    time: "2 minutes ago",
    group: "Today",
    read: false,
    icon: "person-add-outline",
    person: {
      name: "Rahul Agarwal",
      role: "CEO",
      company: "TechVision Pvt Ltd",
      location: "Jaipur, Rajasthan",
      tags: ["Technology", "AI", "Business Growth"],
      verified: true,
      photo: require("../../assets/images/member-rahul.png"),
    },
    detail: "You are now connected with Rahul Agarwal. You can message, collaborate and explore opportunities together.",
  },
  {
    id: "n2",
    kind: "introductions",
    title: "Your introduction request",
    body: "to Sneha Bansal is under review.",
    time: "15 minutes ago",
    group: "Today",
    read: false,
    icon: "hand-left-outline",
    person: {
      name: "Sneha Bansal",
      role: "Founder",
      company: "GreenNest Solutions",
      location: "Delhi, India",
      tags: ["Sustainability", "Cleantech"],
      photo: require("../../assets/images/member-sneha.png"),
    },
    detail: "Your introduction request to Sneha Bansal is being reviewed by the ABLN team. We will notify you once it is approved.",
  },
  {
    id: "n3",
    kind: "events",
    title: "ABLN Annual Summit 2026",
    body: "is now open for registration.",
    time: "1 hour ago",
    group: "Today",
    read: false,
    icon: "calendar-outline",
    detail: "Registration for the ABLN Annual Summit 2026 is now open. Reserve your seat early to meet members from across the network.",
  },
  {
    id: "n4",
    kind: "opportunities",
    title: "New business opportunity",
    body: "in Technology sector.",
    time: "2 hours ago",
    group: "Today",
    read: true,
    icon: "briefcase-outline",
    detail: "A new business opportunity matching your interests has been posted in the Technology sector.",
  },
  {
    id: "n5",
    kind: "membership",
    title: "Your ABLN membership",
    body: "has been approved.",
    time: "3 hours ago",
    group: "Today",
    read: true,
    icon: "ribbon-outline",
    detail: "Congratulations! Your ABLN membership has been approved. You now have full access to the network.",
  },
  {
    id: "n6",
    kind: "connections",
    title: "Neha Sharma",
    body: "sent you a connection request.",
    time: "1 day ago",
    group: "Yesterday",
    read: true,
    icon: "person-add-outline",
    person: {
      name: "Neha Sharma",
      role: "Business Head",
      company: "InnovaTech",
      location: "Delhi, India",
      tags: ["Technology", "Product"],
    },
    detail: "Neha Sharma wants to connect with you. Review their profile to accept the request.",
  },
];

type State = { items: AppNotification[] };

let state: State = { items: SEED };
const listeners = new Set<() => void>();

function set(items: AppNotification[]) {
  state = { items };
  listeners.forEach((l) => l());
}

export function markRead(id: string, read = true) {
  set(state.items.map((n) => (n.id === id ? { ...n, read } : n)));
}

export function markAllRead() {
  set(state.items.map((n) => ({ ...n, read: true })));
}

export function removeNotification(id: string) {
  set(state.items.filter((n) => n.id !== id));
}

export function useNotifications() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  ).items;
}

export function useUnreadCount() {
  return useNotifications().filter((n) => !n.read).length;
}
