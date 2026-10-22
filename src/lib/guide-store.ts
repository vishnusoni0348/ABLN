import { useSyncExternalStore } from "react";

export type GuideSectionKey = "network" | "opportunities" | "ask" | "privileges";

export const GUIDE_SECTIONS: { key: GuideSectionKey; icon: "people" | "calendar" | "chatbubbles" | "ribbon"; title: string; sub: string }[] = [
  { key: "network", icon: "people", title: "Discover Network", sub: "Find and connect with members" },
  { key: "opportunities", icon: "calendar", title: "Opportunities & Events", sub: "Explore business deals and events" },
  { key: "ask", icon: "chatbubbles", title: "Ask Network", sub: "Get insights and expert advice" },
  { key: "privileges", icon: "ribbon", title: "Privileges", sub: "Access exclusive partner benefits" },
];

// Guide sections the member has finished; drives the "App Guide Progress" bar.
let completed: GuideSectionKey[] = [];
const listeners = new Set<() => void>();

export function completeGuideSection(key: GuideSectionKey) {
  if (completed.includes(key)) return;
  completed = [...completed, key];
  listeners.forEach((l) => l());
}

export function useGuideProgress() {
  const done = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => completed,
  );
  const total = GUIDE_SECTIONS.length;
  return { done, count: done.length, total, percent: Math.round((done.length / total) * 100) };
}
