import { EMPTY_EVENT_FILTERS, type EventFilters } from "@/data/events";
import { useSyncExternalStore } from "react";

export type Registration = { eventId: string; name: string; email: string; mobile: string; company: string; designation: string; attendees: number; requirements: string; registeredAt: number };

// Events state shared by the listing, filter, results and registration screens.
export type EventsTab = "Upcoming" | "Past" | "Registered" | "Saved";
type State = { query: string; filters: EventFilters; registrations: Registration[]; tab: EventsTab; saved: string[] };

let state: State = { query: "", filters: EMPTY_EVENT_FILTERS, registrations: [], tab: "Upcoming", saved: [] };
const listeners = new Set<() => void>();

export function setEvents(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function addRegistration(r: Omit<Registration, "registeredAt">) {
  setEvents({ registrations: [{ ...r, registeredAt: Date.now() }, ...state.registrations.filter((x) => x.eventId !== r.eventId)] });
}

export function cancelRegistration(eventId: string) {
  setEvents({ registrations: state.registrations.filter((r) => r.eventId !== eventId) });
}

export function toggleSavedEvent(eventId: string) {
  setEvents({ saved: state.saved.includes(eventId) ? state.saved.filter((s) => s !== eventId) : [...state.saved, eventId] });
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
