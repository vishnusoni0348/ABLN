import { EMPTY_FILTERS, type Filters, type SortKey } from "@/data/members";
import { useSyncExternalStore } from "react";

// Directory state shared by the Network, Search Results and Filter screens.
type State = { query: string; filters: Filters; sort: SortKey; requested: string[] };

let state: State = { query: "", filters: EMPTY_FILTERS, sort: "relevance", requested: [] };
const listeners = new Set<() => void>();

export function setDirectory(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function toggleRequest(name: string) {
  setDirectory({ requested: state.requested.includes(name) ? state.requested.filter((n) => n !== name) : [...state.requested, name] });
}

export function useDirectory() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
