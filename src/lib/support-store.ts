import { useSyncExternalStore } from "react";

export type TicketStatus = "Open" | "Resolved";

export type Ticket = {
  id: string;
  title: string;
  summary: string;
  status: TicketStatus;
  date: string;
};

// Sample tickets until the support API is wired up.
let tickets: Ticket[] = [
  { id: "SUP-2026-002", title: "Payment Problem", summary: "Payment failed but amount debited", status: "Resolved", date: "08 Oct 2026" },
  { id: "SUP-2026-001", title: "Login Issue", summary: "Unable to login to my account", status: "Open", date: "12 Oct 2026" },
];
let counter = tickets.length;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useTickets = () => useSyncExternalStore(subscribe, () => tickets);

const today = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function createTicket(input: { title: string; summary: string }): Ticket {
  counter += 1;
  const ticket: Ticket = { id: `SUP-${new Date().getFullYear()}-${String(counter).padStart(3, "0")}`, status: "Open", date: today(), ...input };
  tickets = [ticket, ...tickets];
  emit();
  return ticket;
}
