import { useSyncExternalStore } from "react";

export type Connection = { name: string; addedAt: Date };
export type IncomingRequest = { id: string; name: string; message: string; sentAt: Date };

// Sample connections until the connections API is wired up.
const SEED_CONNECTIONS: Connection[] = [
  { name: "Rahul Agarwal", addedAt: new Date(2026, 9, 5, 9, 0) },
  { name: "Amit Goyal", addedAt: new Date(2026, 9, 1, 16, 10) },
  { name: "Priya Mittal", addedAt: new Date(2026, 8, 27, 10, 45) },
  { name: "Vikram Sethi", addedAt: new Date(2026, 8, 20, 18, 5) },
];

const SEED_INCOMING: IncomingRequest[] = [
  {
    id: "c1",
    name: "Neha Sharma",
    message: "Hi, I'd love to connect with you. I'm impressed by your work in the technology space and would like to explore potential collaboration opportunities. 🤝",
    sentAt: new Date(2026, 8, 28, 11, 30),
  },
];

type State = { connections: Connection[]; incoming: IncomingRequest[]; sent: Record<string, Date> };

let state: State = { connections: SEED_CONNECTIONS, incoming: SEED_INCOMING, sent: {} };
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function recordSent(name: string) {
  const at = new Date();
  set({ sent: { ...state.sent, [name]: at } });
  return at;
}

export function acceptRequest(id: string) {
  const req = state.incoming.find((r) => r.id === id);
  if (!req) return;
  set({
    incoming: state.incoming.filter((r) => r.id !== id),
    connections: [{ name: req.name, addedAt: new Date() }, ...state.connections.filter((c) => c.name !== req.name)],
  });
}

export function declineRequest(id: string) {
  set({ incoming: state.incoming.filter((r) => r.id !== id) });
}

export function removeConnection(name: string) {
  set({ connections: state.connections.filter((c) => c.name !== name) });
}

export function useConnections() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
