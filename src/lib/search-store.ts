import { EMPTY_GLOBAL_FILTERS, type GlobalFilters, type GlobalSort, type SearchCategory } from "@/data/global-search";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

// Global Search state shared by the Search, Results and Filter sheet.
type State = { query: string; category: SearchCategory; filters: GlobalFilters; sort: GlobalSort; recent: string[] };

const STORAGE_KEY = "abln.global-search.recent";
const MAX_RECENT = 8;

let state: State = { query: "", category: "members", filters: EMPTY_GLOBAL_FILTERS, sort: "relevance", recent: [] };
const listeners = new Set<() => void>();

export function setSearch(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const persist = () => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.recent)).catch(() => {});

export function addRecent(term: string) {
  const t = term.trim();
  if (!t) return;
  setSearch({ recent: [t, ...state.recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT) });
  persist();
}

export function removeRecent(term: string) {
  setSearch({ recent: state.recent.filter((r) => r !== term) });
  persist();
}

export function clearRecent() {
  setSearch({ recent: [] });
  persist();
}

// Starts a fresh search for `term` and records it.
export function runSearch(term: string) {
  addRecent(term);
  setSearch({ query: term.trim(), filters: EMPTY_GLOBAL_FILTERS, sort: "relevance" });
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved)) setSearch({ recent: saved.filter((s) => typeof s === "string").slice(0, MAX_RECENT) });
  })
  .catch(() => {});

export function useSearch() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
