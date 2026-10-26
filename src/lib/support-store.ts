import { useSyncExternalStore } from "react";

export const TICKET_STATUSES = ["Open", "In Progress", "Resolved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type TicketPriority = "Low" | "Normal" | "High";

export type TicketMessage = {
  id: string;
  from: "me" | "support";
  text: string;
  at: number;
  file?: { name: string; size: string; uri?: string };
};

/** Progress steps in the order a ticket moves through them. */
export const TICKET_STEPS = ["submitted", "assigned", "progress", "resolved"] as const;
export type TicketStep = (typeof TICKET_STEPS)[number];

export type Ticket = {
  id: string;
  title: string;
  summary: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  /** Formatted creation date, e.g. "12 Oct 2026". */
  date: string;
  createdAt: number;
  /** When each progress step was reached. */
  reached: Partial<Record<TicketStep, number>>;
  messages: TicketMessage[];
};

const at = (day: number, h: number, m: number, month = 9) => new Date(2026, month, day, h, m).getTime();

// Sample tickets until the support API is wired up. Newest first.
let tickets: Ticket[] = [
  {
    id: "ABLN-1048",
    title: "Unable to update business profile",
    summary: "I'm unable to update my business profile. The changes are not saving. Please help me with this issue.",
    category: "Account & Profile",
    priority: "Normal",
    status: "In Progress",
    date: "12 Oct 2026",
    createdAt: at(12, 10, 30),
    reached: { submitted: at(12, 10, 30), assigned: at(12, 11, 0), progress: at(12, 11, 15) },
    messages: [
      { id: "m1", from: "me", text: "I'm unable to update my business profile. The changes are not saving. Please help me with this issue.", at: at(12, 10, 30) },
      { id: "m2", from: "support", text: "Hi, thank you for reaching out. We're checking this issue and will get back to you shortly.", at: at(12, 11, 15) },
      { id: "m3", from: "me", text: "Thanks! Attaching a screenshot for reference.", at: at(12, 12, 5), file: { name: "screenshot.png", size: "124 KB" } },
      { id: "m4", from: "support", text: "We've identified the issue and are working on a fix. We'll update you soon.", at: at(12, 12, 20) },
    ],
  },
  {
    id: "ABLN-1047",
    title: "Event registration payment",
    summary: "Payment was deducted but my event registration still shows as pending.",
    category: "Events & Registration",
    priority: "High",
    status: "Open",
    date: "10 Oct 2026",
    createdAt: at(10, 9, 15),
    reached: { submitted: at(10, 9, 15) },
    messages: [{ id: "m1", from: "me", text: "Payment was deducted but my event registration still shows as pending.", at: at(10, 9, 15) }],
  },
  {
    id: "ABLN-1046",
    title: "Digital business card QR issue",
    summary: "The QR code on my digital business card is not scanning.",
    category: "Digital Business Card",
    priority: "Normal",
    status: "Resolved",
    date: "08 Oct 2026",
    createdAt: at(8, 14, 0),
    reached: { submitted: at(8, 14, 0), assigned: at(8, 14, 30), progress: at(8, 15, 0), resolved: at(9, 11, 0) },
    messages: [
      { id: "m1", from: "me", text: "The QR code on my digital business card is not scanning.", at: at(8, 14, 0) },
      { id: "m2", from: "support", text: "Fixed! Please refresh your card and try again.", at: at(9, 11, 0) },
    ],
  },
];
let counter = 1048;
let messageCounter = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useTickets = () => useSyncExternalStore(subscribe, () => tickets);
export const useTicket = (id?: string) => useTickets().find((t) => t.id === id);

export const formatDate = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const formatStamp = (ms: number) =>
  `${formatDate(ms)}, ${new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

export function createTicket(input: { title: string; summary: string; category?: string; priority?: TicketPriority }): Ticket {
  counter += 1;
  const now = Date.now();
  const ticket: Ticket = {
    id: `ABLN-${counter}`,
    title: input.title,
    summary: input.summary,
    category: input.category ?? input.title,
    priority: input.priority ?? "Normal",
    status: "Open",
    date: formatDate(now),
    createdAt: now,
    reached: { submitted: now },
    messages: [{ id: "m1", from: "me", text: input.summary, at: now }],
  };
  tickets = [ticket, ...tickets];
  emit();
  return ticket;
}

export function replyToTicket(id: string, reply: { text: string; file?: TicketMessage["file"] }) {
  const text = reply.text.trim();
  if (!text && !reply.file) return;
  messageCounter += 1;
  tickets = tickets.map((t) =>
    t.id === id ? { ...t, messages: [...t.messages, { id: `r${messageCounter}-${Date.now()}`, from: "me", text, at: Date.now(), file: reply.file }] } : t,
  );
  emit();
}
