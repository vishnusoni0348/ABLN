import { EVENTS } from "@/data/events";
import { INDUSTRIES, MEMBERS } from "@/data/members";
import { OPPORTUNITIES } from "@/data/opportunities";
import { PARTNERS } from "@/data/partners";
import type { ImageSourcePropType } from "react-native";

export type SearchCategory = "members" | "opportunities" | "events" | "partners";

export const CATEGORY_LABEL: Record<SearchCategory, string> = {
  members: "Members",
  opportunities: "Opportunities",
  events: "Events",
  partners: "Partners",
};
export const CATEGORIES: SearchCategory[] = ["members", "opportunities", "events", "partners"];

export type GlobalSort = "relevance" | "recent" | "az" | "za";
export const GLOBAL_SORTS: { key: GlobalSort; label: string }[] = [
  { key: "relevance", label: "Most Relevant" },
  { key: "recent", label: "Recently Added" },
  { key: "az", label: "Name (A - Z)" },
  { key: "za", label: "Name (Z - A)" },
];

export const DATE_OPTIONS: { key: number; label: string }[] = [
  { key: 0, label: "Any Time" },
  { key: 7, label: "Within 7 days" },
  { key: 30, label: "Within 30 days" },
  { key: 90, label: "Within 90 days" },
];

export const SEARCH_LOCATIONS = ["Jaipur", "Delhi", "Mumbai", "Bangalore", "Chennai", "Pune"];
export const SEARCH_INDUSTRIES = INDUSTRIES;

export type GlobalFilters = { location: string; industry: string; days: number; verifiedOnly: boolean };
export const EMPTY_GLOBAL_FILTERS: GlobalFilters = { location: "", industry: "", days: 0, verifiedOnly: false };

export const activeGlobalFilterCount = (f: GlobalFilters) => [f.location, f.industry, f.days, f.verifiedOnly].filter(Boolean).length;

export type SearchItem = {
  kind: SearchCategory;
  id: string;
  title: string;
  line1: string;
  line2?: string;
  place?: string;
  meta?: string;
  badge?: string;
  verified?: boolean;
  photo?: ImageSourcePropType;
  mark?: string;
  color?: string;
  // Sorting only; not shown.
  ageDays: number;
  score: number;
};

const DAY_MS = 86_400_000;
const daysFromToday = (iso: string) => Math.round((new Date(`${iso}T00:00:00`).getTime() - Date.now()) / DAY_MS);

const has = (hay: string[], q: string) => hay.join(" ").toLowerCase().includes(q);
const rank = (title: string, q: string) => (!q ? 0 : title.toLowerCase().startsWith(q) ? 3 : title.toLowerCase().includes(q) ? 2 : 1);
const inPlace = (text: string, city: string) => !city || text.toLowerCase().includes(city.toLowerCase());

function memberItems(q: string, f: GlobalFilters): SearchItem[] {
  return MEMBERS.filter(
    (m) =>
      (!q || has([m.name, m.role, m.company, m.location, m.industry, ...m.tags, ...m.expertise], q)) &&
      inPlace(m.location, f.location) &&
      (!f.industry || m.industry === f.industry) &&
      (!f.days || m.joinedDaysAgo <= f.days) &&
      (!f.verifiedOnly || m.verified),
  ).map((m) => ({
    kind: "members",
    id: m.name,
    title: m.name,
    line1: m.role,
    line2: m.company,
    place: m.location,
    verified: m.verified,
    photo: m.photo,
    ageDays: m.joinedDaysAgo,
    score: rank(m.name, q),
  }));
}

function opportunityItems(q: string, f: GlobalFilters): SearchItem[] {
  return OPPORTUNITIES.filter(
    (o) =>
      (!q || has([o.title, o.category, o.industry, o.location, o.about], q)) &&
      inPlace(o.location, f.location) &&
      (!f.industry || o.industry === f.industry) &&
      (!f.days || o.postedDaysAgo <= f.days) &&
      (!f.verifiedOnly || o.postedBy === "Verified Companies"),
  ).map((o) => ({
    kind: "opportunities",
    id: o.id,
    title: o.title,
    line1: o.about,
    place: o.location,
    meta: `Posted ${o.postedDaysAgo === 0 ? "today" : `${o.postedDaysAgo} day${o.postedDaysAgo === 1 ? "" : "s"} ago`}`,
    badge: "Opportunity",
    ageDays: o.postedDaysAgo,
    score: rank(o.title, q),
  }));
}

function eventItems(q: string, f: GlobalFilters): SearchItem[] {
  return EVENTS.filter((e) => {
    const away = daysFromToday(e.date);
    return (
      (!q || has([e.title, e.category, e.location, e.type], q)) &&
      inPlace(e.location, f.location) &&
      (!f.industry || has([e.title, e.category], f.industry.toLowerCase())) &&
      (!f.days || (away >= 0 && away <= f.days)) &&
      !f.verifiedOnly
    );
  }).map((e) => ({
    kind: "events",
    id: e.id,
    title: e.title,
    line1: e.category,
    place: e.location,
    meta: new Date(`${e.date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    badge: "Event",
    ageDays: Math.abs(daysFromToday(e.date)),
    score: rank(e.title, q),
  }));
}

function partnerItems(q: string, f: GlobalFilters): SearchItem[] {
  return PARTNERS.filter(
    (p) =>
      (!q || has([p.name, p.category, p.offer.label, ...p.tags], q)) &&
      (!f.location || p.locations.some((l) => l === "Pan India" || inPlace(l, f.location))) &&
      (!f.industry || p.category.toLowerCase() === f.industry.toLowerCase() || has(p.tags, f.industry.toLowerCase())) &&
      !f.verifiedOnly,
  ).map((p, i) => ({
    kind: "partners",
    id: p.id,
    title: p.name,
    line1: p.category,
    line2: p.offer.label,
    place: p.locations.join(", "),
    badge: p.tier,
    mark: p.mark,
    color: p.color,
    ageDays: i,
    score: rank(p.name, q),
  }));
}

const BUILDERS: Record<SearchCategory, (q: string, f: GlobalFilters) => SearchItem[]> = {
  members: memberItems,
  opportunities: opportunityItems,
  events: eventItems,
  partners: partnerItems,
};

export function searchCategory(cat: SearchCategory, query: string, f: GlobalFilters, sort: GlobalSort): SearchItem[] {
  const out = BUILDERS[cat](query.trim().toLowerCase(), f);
  switch (sort) {
    case "recent":
      return out.sort((a, b) => a.ageDays - b.ageDays);
    case "az":
      return out.sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return out.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return out.sort((a, b) => b.score - a.score);
  }
}

export function countByCategory(query: string, f: GlobalFilters): Record<SearchCategory, number> {
  const q = query.trim().toLowerCase();
  return {
    members: memberItems(q, f).length,
    opportunities: opportunityItems(q, f).length,
    events: eventItems(q, f).length,
    partners: partnerItems(q, f).length,
  };
}

export const POPULAR_SEARCHES = ["technology", "AI solutions", "marketing automation", "healthcare", "jaipur event"];

// Keywords offered while typing: industries, tags and titles drawn from the sample data.
const VOCAB = Array.from(
  new Set([
    ...INDUSTRIES,
    ...MEMBERS.flatMap((m) => [...m.tags, ...m.expertise]),
    ...OPPORTUNITIES.map((o) => o.title),
    ...EVENTS.map((e) => e.title),
    ...PARTNERS.flatMap((p) => [p.name, p.category, ...p.tags]),
  ]),
);

export function suggestKeywords(query: string, limit = 5): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits = VOCAB.filter((w) => w.toLowerCase().includes(q) && w.toLowerCase() !== q);
  hits.sort((a, b) => Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q)) || a.length - b.length);
  const out = hits.slice(0, limit);
  return out.length ? out : [`${q} companies`, `${q} consultants`].slice(0, limit);
}

export const suggestMembers = (query: string, limit = 2) => memberItems(query.trim().toLowerCase(), EMPTY_GLOBAL_FILTERS).slice(0, limit);
