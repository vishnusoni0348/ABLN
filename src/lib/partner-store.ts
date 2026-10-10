import { EMPTY_PARTNER_FILTERS, type PartnerFilters } from "@/data/partners";
import { useSyncExternalStore } from "react";

// Partner state shared by the directory, filter, results and detail screens.
export type RedeemMethod = "Offer Code" | "QR Code" | "Manual Verification";
export type Redemption = { partnerId: string; method: RedeemMethod; code: string; redeemedAt: number };
type State = { query: string; filters: PartnerFilters; favourites: string[]; redemptions: Redemption[] };

let state: State = { query: "", filters: EMPTY_PARTNER_FILTERS, favourites: [], redemptions: [] };
const listeners = new Set<() => void>();

export function setPartners(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function toggleFavourite(id: string) {
  setPartners({ favourites: state.favourites.includes(id) ? state.favourites.filter((x) => x !== id) : [...state.favourites, id] });
}

// Each offer can be redeemed once; a repeat call keeps the original record.
export function addRedemption(r: Omit<Redemption, "redeemedAt">) {
  if (state.redemptions.some((x) => x.partnerId === r.partnerId)) return;
  setPartners({ redemptions: [{ ...r, redeemedAt: Date.now() }, ...state.redemptions] });
}

export function usePartners() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
