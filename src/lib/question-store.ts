import { EMPTY_Q, type QCategory, type QFilters, type Question } from "@/data/questions";
import { CURRENT_USER } from "@/lib/introduction-store";
import { useSyncExternalStore } from "react";

// Ask Network state shared by the feed, filter and results screens.
export type QTab = "Latest" | "Trending" | "Unanswered";
export type Draft = { title: string; body: string; category?: QCategory; tags: string[]; expert?: string; editingId?: string };
export const EMPTY_DRAFT: Draft = { title: "", body: "", tags: [] };
type State = { filters: QFilters; tab: QTab; saved: string[]; helpful: string[]; posted: Question[]; draft: Draft };

let state: State = { filters: EMPTY_Q, tab: "Latest", saved: [], helpful: [], posted: [], draft: EMPTY_DRAFT };
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const setQFilters = (patch: Partial<QFilters>) => set({ filters: { ...state.filters, ...patch } });
export const resetQFilters = () => set({ filters: EMPTY_Q });
export const setQTab = (tab: QTab) => set({ tab });
const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
export const toggleSavedQ = (id: string) => set({ saved: toggle(state.saved, id) });
export const toggleHelpfulQ = (id: string) => set({ helpful: toggle(state.helpful, id) });

export const setDraft = (patch: Partial<Draft>) => set({ draft: { ...state.draft, ...patch } });
export const resetDraft = () => set({ draft: EMPTY_DRAFT });

// Loads an existing question into the draft so the ask flow can edit it.
export function startEdit(q: Question) {
  set({ draft: { title: q.title, body: q.body ?? "", category: q.category, tags: q.tags.length === 1 && q.tags[0] === q.category ? [] : q.tags, expert: q.expertName, editingId: q.id } });
}

// Publishes the current draft (or saves it over the question being edited) and clears it.
export function postDraft() {
  const d = state.draft;
  if (!d.category) return null;
  const fields = { title: d.title.trim(), body: d.body.trim(), tags: d.tags.length ? d.tags : [d.category], category: d.category, expertName: d.expert };
  if (d.editingId) {
    set({ posted: state.posted.map((q) => (q.id === d.editingId ? { ...q, ...fields } : q)), draft: EMPTY_DRAFT });
    return d.editingId;
  }
  const q: Question = { id: `qp${Date.now()}`, author: CURRENT_USER, hoursAgo: 0, answers: 0, helpful: 0, ...fields };
  set({ posted: [q, ...state.posted], draft: EMPTY_DRAFT });
  return q.id;
}

export const deleteQuestion = (id: string) => set({ posted: state.posted.filter((q) => q.id !== id), saved: state.saved.filter((x) => x !== id), helpful: state.helpful.filter((x) => x !== id) });

export function useQuestions() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
