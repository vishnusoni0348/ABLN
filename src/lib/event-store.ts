import { EMPTY_EVENT_FILTERS, type EventFilters } from "@/data/events";
import { useSyncExternalStore } from "react";

// Events state shared by the listing, filter and results screens.
type State = { query: string; filters: EventFilters };

let state: State = { query: "", filters: EMPTY_EVENT_FILTERS };
const listeners = new Set<() => void>();

export function setEvents(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useEvents() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
