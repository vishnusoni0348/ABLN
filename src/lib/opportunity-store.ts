import { EMPTY_FILTERS, type Filters, MY_OPPORTUNITIES, type MineStatus, type MyOpportunity, type SortKey } from "@/data/opportunities";
import { useSyncExternalStore } from "react";

// Opportunities state shared by the feed, filter, results and My Opportunities screens.
type State = { query: string; filters: Filters; sort: SortKey; saved: string[]; mine: MyOpportunity[] };

let state: State = { query: "", filters: EMPTY_FILTERS, sort: "recent", saved: [], mine: MY_OPPORTUNITIES };
const listeners = new Set<() => void>();

export function setOpportunities(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function toggleSaved(id: string) {
  setOpportunities({ saved: state.saved.includes(id) ? state.saved.filter((s) => s !== id) : [...state.saved, id] });
}

export function setMineStatus(id: string, status: MineStatus) {
  setOpportunities({ mine: state.mine.map((m) => (m.id === id ? { ...m, status } : m)) });
}

export function removeMine(id: string) {
  setOpportunities({ mine: state.mine.filter((m) => m.id !== id) });
}

export function useOpportunities() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
