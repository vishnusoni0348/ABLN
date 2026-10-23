import { useSyncExternalStore } from "react";

// Ids of FAQs the member bookmarked, newest first.
let saved: string[] = [];
const listeners = new Set<() => void>();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useSavedFaqs = () => useSyncExternalStore(subscribe, () => saved);

export function toggleSavedFaq(id: string) {
  saved = saved.includes(id) ? saved.filter((i) => i !== id) : [id, ...saved];
  listeners.forEach((l) => l());
}
