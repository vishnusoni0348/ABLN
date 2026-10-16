import { useSyncExternalStore } from "react";

export type AdviserStatus = "none" | "pending" | "approved";
export type SessionMode = "Online" | "In Person" | "Both";

export type AdviserApplication = {
  expertise: string[];
  experience: string;
  designation: string;
  company: string;
  about: string;
  mode: SessionMode | "";
  days: string[];
  slots: string[];
  session: string;
};

export const EXPERTISE_AREAS = [
  "Business Strategy",
  "Sales & Marketing",
  "Finance & Funding",
  "Operations",
  "Technology & AI",
  "HR & Team Building",
  "Legal & Compliance",
  "Export & Global Business",
  "Product Development",
  "Brand Building",
];
export const EXPERIENCE_OPTIONS = ["Less than 1 Year", "1-3 Years", "3-5 Years", "5-10 Years", "10-15 Years", "15+ Years"];
export const MODES: SessionMode[] = ["Online", "In Person", "Both"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const SLOTS = [
  { key: "Morning", time: "9:00 AM – 12:00 PM" },
  { key: "Afternoon", time: "12:00 PM – 5:00 PM" },
  { key: "Evening", time: "5:00 PM – 8:00 PM" },
];
export const SESSIONS = ["30 Minutes", "60 Minutes", "Custom"];
export const ABOUT_MAX = 300;

export const emptyApplication = (): AdviserApplication => ({
  expertise: [],
  experience: "",
  designation: "",
  company: "",
  about: "",
  mode: "",
  days: [],
  slots: [],
  session: "",
});

type State = { status: AdviserStatus; application: AdviserApplication | null };

// In-memory until the adviser API is wired up.
let state: State = { status: "none", application: null };
const listeners = new Set<() => void>();

const set = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useAdviser = () => useSyncExternalStore(subscribe, () => state);

export const submitAdviserApplication = (application: AdviserApplication) =>
  set({ status: state.status === "approved" ? "approved" : "pending", application });

/** Stand-in for the back-office approval until the API exists. */
export const approveAdviser = () => state.application && set({ ...state, status: "approved" });
