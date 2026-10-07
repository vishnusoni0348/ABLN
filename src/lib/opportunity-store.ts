import { EMPTY_FILTERS, type Filters, MY_OPPORTUNITIES, type MineStatus, type MyOpportunity, type SortKey } from "@/data/opportunities";
import { useSyncExternalStore } from "react";

export const OFFERS = ["Partnership", "Investment", "Distribution", "Expertise", "Customers", "Other"] as const;

// An expression of interest the user sent to someone else's opportunity.
export type InterestStatus = "Pending" | "Discussion" | "Accepted" | "Declined";
export type Interest = { id: string; oppId: string; why: string; offers: string[]; extra: string; submittedAt: number; updatedAt?: number; status: InterestStatus };

// A request another member sent to one of the user's opportunities.
export type Decision = "Accepted" | "Discussing" | "Declined";
export type Incoming = { id: string; oppId: string; name: string; role: string; company: string; location: string; why: string; offers: string[]; submittedAt: number; decision?: Decision };

// Opportunities state shared by the feed, filter, results, interest and My Opportunities screens.
type State = { query: string; filters: Filters; sort: SortKey; saved: string[]; mine: MyOpportunity[]; interests: Interest[]; incoming: Incoming[] };

// Sample inbound request until the API is wired up.
const SAMPLE_INCOMING: Incoming[] = [
  {
    id: "r1",
    oppId: "m1",
    name: "Rahul Agarwal",
    role: "CEO & Founder",
    company: "TechVision Pvt Ltd",
    location: "Jaipur, Rajasthan, India",
    why: "We are interested in expanding our FMCG distribution portfolio in Maharashtra. We have a strong retail network and experience in fast-moving consumer products.",
    offers: ["Partnership", "Distribution", "Expertise"],
    submittedAt: new Date("2026-10-06T10:30:00").getTime(),
  },
];

let state: State = { query: "", filters: EMPTY_FILTERS, sort: "recent", saved: [], mine: MY_OPPORTUNITIES, interests: [], incoming: SAMPLE_INCOMING };
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

export function addMine(item: MyOpportunity) {
  setOpportunities({ mine: [item, ...state.mine] });
}

export function addInterest(i: Omit<Interest, "id" | "submittedAt" | "status">) {
  const interest: Interest = { ...i, id: `i${Date.now()}`, submittedAt: Date.now(), status: "Pending" };
  setOpportunities({ interests: [interest, ...state.interests] });
  return interest.id;
}

export function decideIncoming(id: string, decision: Decision) {
  setOpportunities({ incoming: state.incoming.map((r) => (r.id === id ? { ...r, decision } : r)) });
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
