import { addNotification } from "@/lib/notification-store";
import { useSyncExternalStore } from "react";

export type IntroStatus = "review" | "accepted" | "declined" | "cancelled" | "withdrawn";

export type IntroRequest = {
  id: string;
  direction: "sent" | "received";
  // Names resolve to directory members via findMember(); External contacts have no profile.
  requester: string;
  introducer: string;
  target: string;
  reason: string;
  message: string;
  status: IntroStatus;
  sentAt: Date;
  external?: boolean;
  remindedAt?: Date;
  resolvedAt?: Date;
  declineReason?: string;
};

export const REMIND_AFTER_DAYS = 3;

export const STATUS_LABEL: Record<IntroStatus, string> = {
  review: "Under Review",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  withdrawn: "Withdrawn",
};

export const CURRENT_USER = "Rahul Agarwal";

// Sample requests until the introductions API is wired up.
const SEED: IntroRequest[] = [
  {
    id: "i1",
    direction: "sent",
    requester: CURRENT_USER,
    introducer: "Sneha Bansal",
    target: "Amit Goyal",
    reason: "I would like to be introduced to explore a strategic partnership between our companies in the supply chain technology space.",
    message: "Both companies are working on similar goals and I believe this connection can create mutual value.",
    status: "review",
    sentAt: new Date(2026, 9, 3, 10, 24),
  },
  {
    id: "i2",
    direction: "sent",
    requester: CURRENT_USER,
    introducer: "Vikram Sethi",
    target: "Neha Sharma",
    reason: "Looking for product advice on scaling InnovaTech's platform.",
    message: "",
    status: "accepted",
    sentAt: new Date(2026, 8, 28, 15, 5),
  },
  {
    id: "i3",
    direction: "sent",
    requester: CURRENT_USER,
    introducer: "Priya Mittal",
    target: "Karan Agarwal",
    reason: "Seeking investment advice for our next funding round.",
    message: "",
    status: "declined",
    sentAt: new Date(2026, 8, 20, 11, 40),
  },
  {
    id: "i4",
    direction: "received",
    requester: "Rahul Agarwal",
    introducer: CURRENT_USER,
    target: "Amit Goyal",
    reason: "I would like to be introduced to explore a strategic partnership between our companies in the supply chain technology space.",
    message: "Both companies are working on similar goals and I believe this connection can create mutual value.",
    status: "review",
    sentAt: new Date(2026, 9, 5, 9, 12),
  },
  {
    id: "i5",
    direction: "received",
    requester: "Ritika Jain",
    introducer: CURRENT_USER,
    target: "Karan Agarwal",
    reason: "Exploring funding options for MediCare Plus.",
    message: "",
    status: "accepted",
    sentAt: new Date(2026, 9, 1, 17, 30),
  },
];

let state = { items: SEED };
const listeners = new Set<() => void>();

function set(items: IntroRequest[]) {
  state = { items };
  listeners.forEach((l) => l());
}

const isLive = (r: IntroRequest) => r.status === "review" || r.status === "accepted";

// Returns null when the same member already has a live request, so callers can't create duplicates.
export function addIntroRequest(r: Pick<IntroRequest, "introducer" | "target" | "reason" | "message" | "external">) {
  if (state.items.some((x) => x.direction === "sent" && isLive(x) && x.target === r.target)) return null;
  const req: IntroRequest = { ...r, id: `i${Date.now()}`, direction: "sent", requester: CURRENT_USER, status: "review", sentAt: new Date() };
  set([req, ...state.items]);
  addNotification({
    title: "Your introduction request",
    body: `to ${r.introducer} for ${r.target} was sent.`,
    detail: `Your request asking ${r.introducer} to introduce you to ${r.target} is under review. We will notify you of any update.`,
  });
  return req.id;
}

const NOTE: Partial<Record<IntroStatus, (r: IntroRequest) => { body: string; detail: string }>> = {
  accepted: (r) => ({ body: `${r.requester} to ${r.target} was accepted.`, detail: `You introduced ${r.requester} and ${r.target}. Both members have been notified.` }),
  declined: (r) => ({ body: `${r.requester} to ${r.target} was declined.`, detail: `You declined the introduction request from ${r.requester}.` }),
  cancelled: (r) => ({ body: `to ${r.introducer} was cancelled.`, detail: `You withdrew your request to be introduced to ${r.target}.` }),
  withdrawn: (r) => ({ body: `${r.requester} to ${r.target} was withdrawn.`, detail: `You withdrew the introduction between ${r.requester} and ${r.target}.` }),
};

export function setIntroStatus(id: string, status: IntroStatus, declineReason?: string) {
  const prev = state.items.find((r) => r.id === id);
  set(state.items.map((r) => (r.id === id ? { ...r, status, resolvedAt: new Date(), ...(declineReason ? { declineReason } : {}) } : r)));
  const make = prev && NOTE[status];
  if (prev && make) addNotification({ title: status === "cancelled" ? "Your introduction request" : "Introduction request", ...make(prev) });
}

export function canRemind(r: IntroRequest, now = Date.now()) {
  return r.direction === "sent" && r.status === "review" && !r.remindedAt && now - r.sentAt.getTime() >= REMIND_AFTER_DAYS * 86_400_000;
}

export function sendReminder(id: string) {
  const r = state.items.find((x) => x.id === id);
  if (!r) return;
  set(state.items.map((x) => (x.id === id ? { ...x, remindedAt: new Date() } : x)));
  addNotification({ title: "Reminder sent", body: `to ${r.introducer} about your introduction request.`, detail: `We reminded ${r.introducer} to review your request to be introduced to ${r.target}.` });
}

// The live (not declined/cancelled) request the current user sent to this target, if any.
// Also used by the form to block duplicate requests to the same target.
export function useLiveIntroTo(target: string | null) {
  return useIntroRequests().find((r) => r.direction === "sent" && isLive(r) && r.target === target);
}

export function useIntroRequests() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  ).items;
}

export function useIntroRequest(id?: string) {
  return useIntroRequests().find((r) => r.id === id);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(d: Date) {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)}, ${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"}`;
}

export function formatTime(d: Date) {
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
