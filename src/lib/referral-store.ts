import { useSyncExternalStore } from "react";

export type InviteStatus = "Joined" | "Pending" | "Sent" | "Expired";

export type Invite = {
  id: string;
  name: string;
  role: string;
  date: string;
  status: InviteStatus;
};

export const INVITE_BASE_URL = "abln.in/invite";

// Sample invitations until the referral API is wired up.
let invites: Invite[] = [
  { id: "i1", name: "Amit Gupta", role: "Founder, Gupta Industries", date: "12 Oct 2026", status: "Joined" },
  { id: "i2", name: "Neha Agarwal", role: "CEO, TechVision Pvt Ltd", date: "10 Oct 2026", status: "Pending" },
  { id: "i3", name: "Rohit Singhal", role: "Director, Singhal Global", date: "08 Oct 2026", status: "Sent" },
  { id: "i4", name: "Vikram Jalan", role: "Managing Director", date: "05 Oct 2026", status: "Joined" },
  { id: "i5", name: "Pooja Sharma", role: "Founder, Sharma Ventures", date: "02 Oct 2026", status: "Pending" },
  { id: "i6", name: "Karan Mittal", role: "Partner, Mittal & Co.", date: "28 Sep 2026", status: "Joined" },
  { id: "i7", name: "Anjali Bansal", role: "Founder, Bansal Textiles", date: "25 Sep 2026", status: "Pending" },
  { id: "i8", name: "Suresh Goel", role: "Director, Goel Traders", date: "22 Sep 2026", status: "Joined" },
  { id: "i9", name: "Ritu Khandelwal", role: "CEO, Khandelwal Foods", date: "20 Sep 2026", status: "Pending" },
  { id: "i10", name: "Manish Poddar", role: "Founder, Poddar Steel", date: "18 Sep 2026", status: "Sent" },
  { id: "i11", name: "Divya Agrawal", role: "Managing Partner, DA Capital", date: "15 Sep 2026", status: "Joined" },
  { id: "i12", name: "Nitin Ruia", role: "Director, Ruia Exports", date: "12 Sep 2026", status: "Pending" },
  { id: "i13", name: "Sanjay Bajaj", role: "Founder, Bajaj Polymers", date: "20 Aug 2026", status: "Expired" },
  { id: "i14", name: "Meera Todi", role: "Director, Todi Mills", date: "14 Aug 2026", status: "Expired" },
];
let counter = invites.length;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useInvites = () => useSyncExternalStore(subscribe, () => invites);

const today = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** Only invitations still waiting on the invitee can be nudged. */
export const canResend = (s: InviteStatus) => s === "Pending" || s === "Expired";

export function resendInvite(id: string) {
  invites = invites.map((i) => (i.id === id ? { ...i, status: "Pending", date: today() } : i));
  emit();
}

export function removeInvite(id: string) {
  invites = invites.filter((i) => i.id !== id);
  emit();
}

/** Records an invitation sent from the contacts list; ignores people already invited. */
export function addInvite(name: string, phone: string) {
  if (invites.some((i) => i.name === name)) return;
  counter += 1;
  invites = [{ id: `i${counter}`, name, role: phone, date: today(), status: "Sent" }, ...invites];
  emit();
}

export function inviteCounts(list: Invite[]) {
  const n = (s: InviteStatus) => list.filter((i) => i.status === s).length;
  return { sent: list.length, joined: n("Joined"), pending: n("Pending") + n("Sent"), expired: n("Expired") };
}

/** Referral code derived from the member's first name and the tail of their member id. */
export function referralCode(name: string, memberId: string) {
  const first = name.trim().split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z]/g, "") || "ABLN";
  return `${first}${memberId.replace(/\D/g, "").slice(-2) || "25"}`;
}

export const inviteLink = (code: string) => `${INVITE_BASE_URL}/${code}`;
