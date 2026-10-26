import { useSyncExternalStore } from "react";

export const FEEDBACK_CATEGORIES = [
  { key: "experience", label: "Overall Experience", icon: "star" },
  { key: "features", label: "Features", icon: "settings-outline" },
  { key: "content", label: "Content", icon: "document-text-outline" },
  { key: "community", label: "Community", icon: "people-outline" },
  { key: "suggestions", label: "Suggestions", icon: "bulb-outline" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["key"];

export const FEEDBACK_MAX = 500;

export type Feedback = { id: string; rating: number; category: FeedbackCategory; comment: string; date: string };

// Kept in memory until the feedback API is wired up. Newest first.
let submitted: Feedback[] = [];
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useFeedbackList = () => useSyncExternalStore(subscribe, () => submitted);

export const categoryOf = (key: FeedbackCategory) => FEEDBACK_CATEGORIES.find((c) => c.key === key) ?? FEEDBACK_CATEGORIES[0];

export function submitFeedback(input: Pick<Feedback, "rating" | "category" | "comment">) {
  const entry: Feedback = { ...input, id: `fb-${Date.now()}`, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) };
  submitted = [entry, ...submitted];
  listeners.forEach((l) => l());
}
