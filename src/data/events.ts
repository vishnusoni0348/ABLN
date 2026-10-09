// Sample events until the events API is wired up.
export const EVENT_CATEGORIES = ["Networking", "Workshop", "Conference", "Webinar", "Meetup", "Panel Discussion", "Business Dinner", "Training", "Other"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_TYPES = ["Online", "Offline"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_LOCATIONS = ["Jaipur, Rajasthan", "Mumbai, Maharashtra", "Delhi, India", "Bangalore, Karnataka", "Online (Zoom)"];

export type When = "Upcoming" | "Past";
export const WHEN: readonly When[] = ["Upcoming", "Past"];

// What the user sees as "Event Status": the timeline plus whether seats can still be booked.
export const EVENT_STATUSES = ["Upcoming", "Past", "Registration Open", "Registration Closed"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export type Availability = "Seats Available" | "Almost Full" | "Full" | "Closed";

export type AppEvent = {
  id: string;
  title: string;
  category: EventCategory;
  type: EventType;
  date: string; // ISO date
  time: string;
  location: string;
  seats: number;
  registered: number;
  going: number;
  when: When;
  featured?: boolean;
  registrationClosed?: boolean;
};

export const EVENTS: AppEvent[] = [
  { id: "e1", title: "Jaipur Business Networking Meet 2026", category: "Networking", type: "Offline", date: "2026-11-15", time: "10:00 AM – 01:00 PM", location: "Taj Hotel, Jaipur", seats: 120, registered: 120, going: 120, when: "Upcoming", featured: true },
  { id: "e2", title: "Business Growth Strategies for 2026", category: "Workshop", type: "Online", date: "2026-11-22", time: "04:00 PM – 06:00 PM", location: "Online (Zoom)", seats: 100, registered: 95, going: 85, when: "Upcoming" },
  { id: "e3", title: "ABLN Annual Business Summit 2026", category: "Conference", type: "Offline", date: "2026-12-05", time: "10:00 AM – 05:00 PM", location: "Jaipur, Rajasthan", seats: 200, registered: 200, going: 200, when: "Upcoming", registrationClosed: true },
  { id: "e4", title: "Scaling Your Business with AI", category: "Webinar", type: "Online", date: "2026-11-12", time: "04:00 PM – 05:00 PM", location: "Online (Zoom)", seats: 300, registered: 140, going: 120, when: "Upcoming" },
  { id: "e5", title: "Founder's Circle Meetup", category: "Meetup", type: "Offline", date: "2026-12-12", time: "06:00 PM – 08:00 PM", location: "Jaipur, Rajasthan", seats: 50, registered: 38, going: 60, when: "Upcoming" },
  { id: "e6", title: "Startup Funding & Investment Workshop", category: "Workshop", type: "Online", date: "2026-11-28", time: "04:00 PM – 06:00 PM", location: "Online (Zoom)", seats: 120, registered: 75, going: 75, when: "Upcoming" },
  { id: "e7", title: "Future of Retail Panel", category: "Panel Discussion", type: "Offline", date: "2026-12-18", time: "05:00 PM – 07:00 PM", location: "Mumbai, Maharashtra", seats: 80, registered: 30, going: 30, when: "Upcoming" },
  { id: "e8", title: "Design Thinking for Business Leaders", category: "Training", type: "Online", date: "2026-09-18", time: "11:00 AM – 01:00 PM", location: "Online (Zoom)", seats: 60, registered: 54, going: 54, when: "Past" },
  { id: "e9", title: "Leaders' Dinner Delhi", category: "Business Dinner", type: "Offline", date: "2026-09-02", time: "07:30 PM – 10:00 PM", location: "Delhi, India", seats: 40, registered: 40, going: 40, when: "Past" },
  { id: "e10", title: "Export Readiness Bootcamp", category: "Training", type: "Offline", date: "2026-08-14", time: "10:00 AM – 04:00 PM", location: "Bangalore, Karnataka", seats: 70, registered: 61, going: 61, when: "Past" },
  { id: "e11", title: "Monsoon Founders Meetup", category: "Meetup", type: "Offline", date: "2026-07-26", time: "06:00 PM – 08:00 PM", location: "Jaipur, Rajasthan", seats: 50, registered: 47, going: 47, when: "Past" },
];

export function formatEventDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

export const isRegistrationOpen = (e: AppEvent) => e.when === "Upcoming" && !e.registrationClosed && e.registered < e.seats;

export function availability(e: AppEvent): Availability {
  if (e.when === "Past" || e.registrationClosed) return "Closed";
  if (e.registered >= e.seats) return "Full";
  return e.registered / e.seats >= 0.9 ? "Almost Full" : "Seats Available";
}

export type EventFilters = {
  category: EventCategory | "All";
  dateFrom: string; // ISO date, "" = any
  dateTo: string;
  location: string; // "" = all
  type: EventType | "All";
  status: EventStatus | "All";
};

export const EMPTY_EVENT_FILTERS: EventFilters = { category: "All", dateFrom: "", dateTo: "", location: "", type: "All", status: "All" };

export function activeEventFilterCount(f: EventFilters) {
  return [f.category !== "All", !!f.dateFrom || !!f.dateTo, !!f.location, f.type !== "All", f.status !== "All"].filter(Boolean).length;
}

function matchesStatus(e: AppEvent, s: EventStatus | "All") {
  if (s === "All") return true;
  if (s === "Upcoming" || s === "Past") return e.when === s;
  return s === "Registration Open" ? isRegistrationOpen(e) : e.when === "Upcoming" && !isRegistrationOpen(e);
}

// `when` is the Upcoming/Past tab; undefined means all.
export function searchEvents(query: string, f: EventFilters, when?: When): AppEvent[] {
  const q = query.trim().toLowerCase();
  return EVENTS.filter((e) => {
    if (q && ![e.title, e.category, e.location, e.type].some((s) => s.toLowerCase().includes(q))) return false;
    if (when && e.when !== when) return false;
    if (f.category !== "All" && e.category !== f.category) return false;
    if (f.type !== "All" && e.type !== f.type) return false;
    if (f.location && e.location !== f.location) return false;
    if (f.dateFrom && e.date < f.dateFrom) return false;
    if (f.dateTo && e.date > f.dateTo) return false;
    return matchesStatus(e, f.status);
  }).sort((a, b) => (a.when === "Past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shift = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

// Quick ranges standing in for a calendar picker; each resolves to concrete dates when chosen.
export const DATE_PRESETS: { key: string; label: string; range: () => { from: string; to: string } }[] = [
  { key: "any", label: "Any date", range: () => ({ from: "", to: "" }) },
  { key: "7d", label: "Next 7 days", range: () => ({ from: iso(new Date()), to: iso(shift(7)) }) },
  { key: "30d", label: "Next 30 days", range: () => ({ from: iso(new Date()), to: iso(shift(30)) }) },
  { key: "90d", label: "Next 3 months", range: () => ({ from: iso(new Date()), to: iso(shift(90)) }) },
  { key: "past30", label: "Past 30 days", range: () => ({ from: iso(shift(-30)), to: iso(new Date()) }) },
];

export function dateRangeLabel(f: Pick<EventFilters, "dateFrom" | "dateTo">) {
  if (!f.dateFrom && !f.dateTo) return "";
  return `${f.dateFrom ? formatEventDate(f.dateFrom) : "Any"} – ${f.dateTo ? formatEventDate(f.dateTo) : "Any"}`;
}
