export const FEEDBACK_CATEGORIES = [
  { key: "experience", label: "Overall Experience", icon: "star" },
  { key: "features", label: "Features", icon: "settings-outline" },
  { key: "content", label: "Content", icon: "document-text-outline" },
  { key: "community", label: "Community", icon: "people-outline" },
  { key: "suggestions", label: "Suggestions", icon: "bulb-outline" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["key"];

export const FEEDBACK_MAX = 500;

export type Feedback = { rating: number; category: FeedbackCategory; comment: string; date: string };

const submitted: Feedback[] = [];

// Kept in memory until the feedback API is wired up.
export function submitFeedback(input: Omit<Feedback, "date">) {
  submitted.unshift({ ...input, date: new Date().toISOString() });
}
