import { addNotification } from "@/lib/notification-store";
import { useSyncExternalStore } from "react";

export type AdviceStatus = "pending" | "confirmed" | "cancelled";
export type AdviceType = "free" | "paid";

export type AdviceRequest = {
  id: string;
  expert: string;
  type: AdviceType;
  price?: number;
  date: Date;
  slot: string;
  message: string;
  status: AdviceStatus;
  sentAt: Date;
};

export const ADVICE_STATUS_LABEL: Record<AdviceStatus, string> = {
  pending: "Awaiting Response",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

let state = { items: [] as AdviceRequest[] };
const listeners = new Set<() => void>();

function set(items: AdviceRequest[]) {
  state = { items };
  listeners.forEach((l) => l());
}

export function addAdviceRequest(r: Pick<AdviceRequest, "expert" | "type" | "price" | "date" | "slot" | "message">) {
  const req: AdviceRequest = { ...r, id: `a${Date.now()}`, status: "pending", sentAt: new Date() };
  set([req, ...state.items]);
  addNotification({
    title: "Your advice request",
    body: `to ${r.expert} was sent.`,
    detail: `Your ${r.type} advice request to ${r.expert} for ${r.slot} is awaiting their response. We will notify you of any update.`,
  });
  return req.id;
}

export function cancelAdviceRequest(id: string) {
  const prev = state.items.find((r) => r.id === id);
  if (!prev || prev.status === "cancelled") return;
  set(state.items.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)));
  addNotification({ title: "Your advice request", body: `to ${prev.expert} was cancelled.`, detail: `You cancelled your advice request to ${prev.expert}.` });
}

export function useAdviceRequests() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  ).items;
}

export function useAdviceRequest(id?: string) {
  return useAdviceRequests().find((r) => r.id === id);
}
