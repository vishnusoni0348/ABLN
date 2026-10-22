import { EMPTY_EVENT_FILTERS, type EventFilters } from "@/data/events";
import { stampSaved } from "@/lib/saved-store";
import { useSyncExternalStore } from "react";

export type TicketStatus = "Confirmed" | "Pending" | "Cancelled";
export type Registration = { eventId: string; name: string; email: string; mobile: string; company: string; designation: string; attendees: number; requirements: string; registeredAt: number; ticketId: string; status: TicketStatus };

// Events state shared by the listing, filter, results and registration screens.
export type EventsTab = "Upcoming" | "Past" | "Registered" | "Saved";
type State = { query: string; filters: EventFilters; registrations: Registration[]; cancelled: Registration[]; tab: EventsTab; saved: string[] };

let state: State = { query: "", filters: EMPTY_EVENT_FILTERS, registrations: [], cancelled: [], tab: "Upcoming", saved: [] };
const listeners = new Set<() => void>();

export function setEvents(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

// Sample ticket number until the events API issues real ones; updating a registration keeps its ticket.
const newTicketId = (at: number) => `ABLN${new Date(at).getFullYear()}-${String(at % 1000000).padStart(6, "0")}`;

export function addRegistration(r: Omit<Registration, "registeredAt" | "ticketId" | "status">) {
  const existing = state.registrations.find((x) => x.eventId === r.eventId);
  const now = Date.now();
  const next: Registration = { ...r, registeredAt: existing?.registeredAt ?? now, ticketId: existing?.ticketId ?? newTicketId(now), status: existing?.status ?? "Confirmed" };
  setEvents({ registrations: [next, ...state.registrations.filter((x) => x.eventId !== r.eventId)], cancelled: state.cancelled.filter((x) => x.eventId !== r.eventId) });
}

export function cancelRegistration(eventId: string) {
  const reg = state.registrations.find((r) => r.eventId === eventId);
  setEvents({
    registrations: state.registrations.filter((r) => r.eventId !== eventId),
    cancelled: reg ? [{ ...reg, status: "Cancelled" }, ...state.cancelled] : state.cancelled,
  });
}

export function toggleSavedEvent(eventId: string) {
  if (!state.saved.includes(eventId)) stampSaved(`event:${eventId}`);
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
