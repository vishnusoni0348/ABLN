import { useSyncExternalStore } from "react";

// City and industry filters shared by the Members Map and its filter screen.
type State = { city: string; industries: string[] };

let state: State = { city: "Jaipur", industries: [] };
const listeners = new Set<() => void>();

export function setMapFilters(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useMapFilters() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
