import { type Answer, type Reply, seedAnswers, seedReplies } from "@/data/answers";
import { catsOf, EMPTY_Q, MAX_CATEGORIES, QUESTIONS, type QCategory, type QFilters, type Question } from "@/data/questions";
import { CURRENT_USER } from "@/lib/introduction-store";
import { useSyncExternalStore } from "react";

// Ask Network state shared by the feed, filter and results screens.
export type QTab = "Latest" | "Trending" | "Unanswered";
export type Draft = { title: string; body: string; categories: QCategory[]; tags: string[]; expert?: string; editingId?: string };
export const EMPTY_DRAFT: Draft = { title: "", body: "", categories: [], tags: [] };
type State = { filters: QFilters; tab: QTab; saved: string[]; helpful: string[]; posted: Question[]; draft: Draft; answers: Answer[]; replies: Reply[] };

let state: State = { filters: EMPTY_Q, tab: "Latest", saved: [], helpful: [], posted: [], draft: EMPTY_DRAFT, answers: [], replies: [] };
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
// Adds or removes a category, keeping at most MAX_CATEGORIES.
export function toggleDraftCategory(c: QCategory) {
  const cur = state.draft.categories;
  if (cur.includes(c)) setDraft({ categories: cur.filter((x) => x !== c) });
  else if (cur.length < MAX_CATEGORIES) setDraft({ categories: [...cur, c] });
}
export const resetDraft = () => set({ draft: EMPTY_DRAFT });

// Loads an existing question into the draft so the ask flow can edit it.
export function startEdit(q: Question) {
  set({ draft: { title: q.title, body: q.body ?? "", categories: catsOf(q), tags: q.tags.length === catsOf(q).length && q.tags.every((t) => catsOf(q).includes(t as QCategory)) ? [] : q.tags, expert: q.expertName, editingId: q.id } });
}

// Publishes the current draft (or saves it over the question being edited) and clears it.
export function postDraft() {
  const d = state.draft;
  if (!d.categories.length) return null;
  const fields = { title: d.title.trim(), body: d.body.trim(), tags: d.tags.length ? d.tags : d.categories, category: d.categories[0], categories: d.categories, expertName: d.expert };
  if (d.editingId) {
    set({ posted: state.posted.map((q) => (q.id === d.editingId ? { ...q, ...fields } : q)), draft: EMPTY_DRAFT });
    return d.editingId;
  }
  const q: Question = { id: `qp${Date.now()}`, author: CURRENT_USER, hoursAgo: 0, answers: 0, helpful: 0, ...fields };
  set({ posted: [q, ...state.posted], draft: EMPTY_DRAFT });
  return q.id;
}

export const deleteQuestion = (id: string) => set({ posted: state.posted.filter((q) => q.id !== id), saved: state.saved.filter((x) => x !== id), helpful: state.helpful.filter((x) => x !== id) });

// Answers and replies the current user has written, merged with the sample ones.
export function postAnswer(qid: string, body: string) {
  const a: Answer = { id: `ax-${qid}-${Date.now()}`, qid, author: CURRENT_USER, expert: false, hoursAgo: 0, body: body.trim(), helpful: 0, replyCount: 0 };
  set({ answers: [a, ...state.answers] });
  return a.id;
}

export function postReply(aid: string, body: string) {
  set({ replies: [...state.replies, { id: `rx-${Date.now()}`, aid, author: CURRENT_USER, hoursAgo: 0, body: body.trim() }] });
}

export const deleteAnswer = (id: string) =>
  set({ answers: state.answers.filter((a) => a.id !== id), replies: state.replies.filter((r) => r.aid !== id), helpful: state.helpful.filter((x) => x !== id) });
export const deleteReply = (id: string) => set({ replies: state.replies.filter((r) => r.id !== id) });

export function answersFor(q: Pick<Question, "id" | "answers" | "helpful">, own: Answer[]) {
  return [...own.filter((a) => a.qid === q.id), ...seedAnswers(q)];
}

export function repliesFor(a: Answer, own: Reply[]) {
  return [...seedReplies(a.id, a.replyCount), ...own.filter((r) => r.aid === a.id)];
}

export function useQuestions() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export function useQuestion(id?: string) {
  const { posted } = useQuestions();
  return posted.find((q) => q.id === id) ?? QUESTIONS.find((q) => q.id === id);
}

export function useAnswer(id?: string) {
  const { answers } = useQuestions();
  const own = answers.find((a) => a.id === id);
  if (own) return own;
  const qid = id?.split("-")[1];
  const q = QUESTIONS.find((x) => x.id === qid);
  return q ? seedAnswers(q).find((a) => a.id === id) : undefined;
}
