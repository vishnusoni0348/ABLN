import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import { addNotification } from "@/lib/notification-store";

export type MeetingType = "virtual" | "in-person" | "phone";

export const MEETING_TYPES: { key: MeetingType; title: string; sub: string; label: string; icon: "videocam-outline" | "people-outline" | "call-outline" }[] = [
  { key: "virtual", title: "Virtual Meeting", sub: "Google Meet / Zoom", label: "Virtual Meeting (Google Meet)", icon: "videocam-outline" },
  { key: "in-person", title: "In-Person Meeting", sub: "Meet at a location", label: "In-Person Meeting", icon: "people-outline" },
  { key: "phone", title: "Phone Call", sub: "Schedule a call", label: "Phone Call", icon: "call-outline" },
];

export type Meeting = {
  id: string;
  name: string;
  type: MeetingType;
  start: Date;
  minutes: number;
  topic: string;
  note: string;
};

export const MEETING_MINUTES = 30;

export const PERIODS = [
  { key: "Morning", from: 9, to: 12 },
  { key: "Afternoon", from: 12, to: 16.5 },
  { key: "Evening", from: 16.5, to: 19.5 },
] as const;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const BOOKING_WINDOW_DAYS = 60;

export const monthName = (m: number) => MONTHS[m];
export const dayName = (d: Date) => DAYS[d.getDay()];
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function formatLong(d: Date) {
  return `${dayName(d)}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export function formatClock(d: Date) {
  const h = d.getHours();
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function formatRange(start: Date, minutes: number) {
  return `${formatClock(start)} - ${formatClock(new Date(start.getTime() + minutes * 60000))} (${minutes} mins)`;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const STORAGE_KEY = "abln.meetings";

let meetings: Meeting[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meetings)).catch(() => {});
}

// Restore saved meetings on launch; anything booked before this resolves is kept.
AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    const saved: Meeting[] = (JSON.parse(raw) as (Omit<Meeting, "start"> & { start: string })[]).map((m) => ({ ...m, start: new Date(m.start) }));
    const ids = new Set(meetings.map((m) => m.id));
    meetings = [...meetings, ...saved.filter((m) => !ids.has(m.id))];
    emit();
  })
  .catch(() => {});

/**
 * Slots the member is free on `day`. Until a real availability API exists this is
 * derived deterministically from the member + date: Sundays are off, roughly a third of
 * slots are taken, past slots on today are hidden and slots you already booked are removed.
 */
export function availableSlots(name: string, day: Date, now = new Date()): Date[] {
  if (day.getDay() === 0) return [];
  const slots: Date[] = [];
  for (let t = 9 * 60; t <= 19 * 60; t += MEETING_MINUTES) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, t);
    if (start.getTime() <= now.getTime() + 30 * 60000) continue;
    if (hash(`${name}|${day.toDateString()}|${t}`) % 3 === 0) continue;
    if (meetings.some((m) => m.start.getTime() === start.getTime())) continue;
    slots.push(start);
  }
  return slots;
}

export function slotPeriod(d: Date) {
  const h = d.getHours() + d.getMinutes() / 60;
  return PERIODS.find((p) => h >= p.from && h < p.to)?.key ?? "Evening";
}

export function scheduleMeeting(m: Omit<Meeting, "id" | "minutes">) {
  const meeting: Meeting = { ...m, id: `m${Date.now()}`, minutes: MEETING_MINUTES };
  meetings = [meeting, ...meetings];
  emit();
  persist();
  addNotification({
    kind: "events",
    icon: "calendar-outline",
    title: "Meeting scheduled",
    body: `with ${meeting.name} on ${formatLong(meeting.start)}, ${formatClock(meeting.start)}.`,
    detail: `Your ${MEETING_TYPES.find((t) => t.key === meeting.type)?.label ?? "meeting"} with ${meeting.name} is set for ${formatLong(meeting.start)}, ${formatRange(meeting.start, meeting.minutes)}.`,
    route: `/meeting-scheduled?id=${meeting.id}`,
  });
  return meeting;
}

export const isUpcoming = (m: Meeting, now = Date.now()) => m.start.getTime() + m.minutes * 60000 > now;

export function cancelMeeting(id: string) {
  meetings = meetings.filter((m) => m.id !== id);
  emit();
  persist();
}

export function findMeeting(id?: string) {
  return meetings.find((m) => m.id === id);
}

export function useMeetings() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => meetings,
  );
}
