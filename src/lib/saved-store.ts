import { useSyncExternalStore } from "react";

// Bookmarked members plus a save timestamp per item ("opp:<id>", "event:<id>", "member:<name>") for "Recently Saved".
// Opportunities and events keep their own `saved` ids in their stores; they only call `stampSaved` here.
type State = { members: string[]; stamps: Record<string, number> };

let state: State = { members: [], stamps: {} };
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const stampSaved = (key: string) => set({ stamps: { ...state.stamps, [key]: Date.now() } });

export function toggleSavedMember(name: string) {
  const on = state.members.includes(name);
  set({ members: on ? state.members.filter((n) => n !== name) : [...state.members, name] });
  if (!on) stampSaved(`member:${name}`);
}

export function useSavedMembers() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export const savedAgo = (t: number | undefined) => {
  if (!t) return "";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days < 1) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
};
