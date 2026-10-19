import { useSyncExternalStore } from "react";

// Sample conversations until the messaging API is wired up.
export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text?: string;
  file?: { name: string; size: string };
  at: Date;
};

export type Conversation = { name: string; online?: boolean; muted?: boolean; unread: number; messages: ChatMessage[] };
export type MessageRequest = { id: string; name: string; text: string; sentAt: Date };

const ago = (mins: number) => new Date(Date.now() - mins * 60_000);
const today = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

// Requests the user has sent to members outside their network; they wait for the other side to accept.
export type SentRequest = { name: string; text: string; sentAt: Date; deleted?: boolean };

type State = { conversations: Conversation[]; requests: MessageRequest[]; sent: SentRequest[] };

let state: State = {
  sent: [],
  conversations: [
    {
      name: "Amit Goyal",
      online: true,
      unread: 2,
      messages: [
        { id: "a1", from: "them", text: "Hi Vishnu,\nIt was great meeting you at the ABLN event yesterday.", at: today(10, 20) },
        { id: "a2", from: "me", text: "Hi Amit,\nLikewise! It was a pleasure connecting with you.", at: today(10, 22) },
        { id: "a3", from: "them", text: "I'm exploring a partnership opportunity in the tech space. Would you be open for a quick call this week?", at: today(10, 24) },
        { id: "a4", from: "me", text: "Sure, let's connect tomorrow. How about 11 AM?", at: today(10, 26) },
        { id: "a5", from: "them", text: "That works for me. I'll send a calendar invite.", at: today(10, 28) },
        { id: "a6", from: "them", file: { name: "ABLN_Partnership_Deck.pdf", size: "2.4 MB" }, at: today(10, 30) },
        { id: "a7", from: "them", text: "Sure, let's connect tomorrow.", at: today(11, 30) },
      ],
    },
    { name: "Sneha Bansal", online: true, unread: 1, messages: [{ id: "s1", from: "them", text: "Thanks for the information!", at: today(10, 15) }] },
    { name: "Karan Agarwal", unread: 0, messages: [{ id: "k1", from: "them", text: "Can you share the deck?", at: ago(60 * 26) }] },
    { name: "Priya Mittal", online: true, unread: 0, messages: [{ id: "p1", from: "them", text: "Let's discuss this opportunity.", at: ago(60 * 30) }] },
    { name: "Rahul Agarwal", unread: 0, messages: [{ id: "r1", from: "them", text: "I'll share the details soon.", at: ago(60 * 24 * 4) }] },
    { name: "Ritika Jain", unread: 0, messages: [{ id: "j1", from: "them", text: "Great, see you at the event!", at: ago(60 * 24 * 5) }] },
    { name: "Vikram Sethi", unread: 0, messages: [{ id: "v1", from: "them", text: "Thank you for connecting.", at: ago(60 * 24 * 6) }] },
  ],
  requests: [
    { id: "q1", name: "Neha Sharma", text: "Hi, I came across your profile and would love to connect...", sentAt: ago(60 * 48) },
    { id: "q2", name: "Aarav Gupta", text: "We are working on a similar initiative and would like to discuss...", sentAt: ago(60 * 72) },
    { id: "q3", name: "Ishita Singhal", text: "Hi, I'm interested in exploring a potential collaboration...", sentAt: ago(60 * 96) },
  ],
};

const listeners = new Set<() => void>();
function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function useStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export const useConversations = () => useStore().conversations;
export const useMessageRequests = () => useStore().requests;
export const useMessageRequest = (id?: string) => useStore().requests.find((r) => r.id === id);
export const useConversation =(name?: string) => useStore().conversations.find((c) => c.name === name);

export const lastMessage = (c: Conversation) => c.messages[c.messages.length - 1];
export const previewText = (c: Conversation) => {
  const m = lastMessage(c);
  return m?.text?.replace(/\n/g, " ") ?? (m?.file ? `📎 ${m.file.name}` : "");
};

export function sendMessage(name: string, text: string) {
  const msg: ChatMessage = { id: `m${Date.now()}`, from: "me", text, at: new Date() };
  const exists = state.conversations.some((c) => c.name === name);
  const conversations = exists
    ? state.conversations.map((c) => (c.name === name ? { ...c, messages: [...c.messages, msg] } : c))
    : [{ name, unread: 0, messages: [msg] }, ...state.conversations];
  // Latest conversation first.
  conversations.sort((a, b) => lastMessage(b).at.getTime() - lastMessage(a).at.getTime());
  set({ ...state, conversations });
}

export function markRead(name: string) {
  const c = state.conversations.find((x) => x.name === name);
  if (!c || c.unread === 0) return;
  set({ ...state, conversations: state.conversations.map((x) => (x.name === name ? { ...x, unread: 0 } : x)) });
}

export function acceptRequest(id: string) {
  const r = state.requests.find((x) => x.id === id);
  if (!r) return;
  const msg: ChatMessage = { id: `m${id}`, from: "them", text: r.text, at: r.sentAt };
  set({
    ...state,
    requests: state.requests.filter((x) => x.id !== id),
    conversations: [{ name: r.name, unread: 1, messages: [msg] }, ...state.conversations.filter((c) => c.name !== r.name)],
  });
}

export const useSentRequests = () => useStore().sent;

// One request per member: further messages wait until they accept.
export function sendMessageRequest(name: string, text: string) {
  if (state.sent.some((r) => r.name === name)) return;
  set({ ...state, sent: [{ name, text, sentAt: new Date() }, ...state.sent] });
}

export function toggleMute(name: string) {
  set({ ...state, conversations: state.conversations.map((c) => (c.name === name ? { ...c, muted: !c.muted } : c)) });
}

export function deleteConversation(name: string) {
  // A pending request you sent is only hidden, so the one-message limit still holds if you open the chat again.
  set({
    ...state,
    conversations: state.conversations.filter((c) => c.name !== name),
    sent: state.sent.map((r) => (r.name === name ? { ...r, deleted: true } : r)),
  });
}

export function declineRequest(id: string) {
  set({ ...state, requests: state.requests.filter((x) => x.id !== id) });
}

export function useUnreadMessages() {
  return useStore().conversations.reduce((n, c) => n + c.unread, 0);
}

export function formatClock(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Time for today, "Yesterday", weekday within a week, otherwise "Oct 18".
export function formatListTime(d: Date) {
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(d)) / 86_400_000);
  if (days <= 0) return formatClock(d);
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatAgo(d: Date) {
  const days = Math.max(1, Math.round((Date.now() - d.getTime()) / 86_400_000));
  return `${days}d ago`;
}
