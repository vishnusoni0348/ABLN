import { type Category, type MyOpportunity, OPPORTUNITIES } from "@/data/opportunities";

// One shape for both feed opportunities and the user's own, so interest screens can show either.
export type OppInfo = {
  id: string;
  title: string;
  category: Category;
  industry: string;
  location: string;
  valueLabel: string;
  deadlineLabel: string;
  status: string;
  featured: boolean;
  closed: boolean;
  interested: number;
  cover?: string;
};

export function findOpp(id: string | undefined, mine: MyOpportunity[]): OppInfo | undefined {
  const o = OPPORTUNITIES.find((x) => x.id === id);
  if (o) {
    return {
      id: o.id,
      title: o.title,
      category: o.category,
      industry: o.industry,
      location: o.location,
      valueLabel: o.valueLabel,
      deadlineLabel: o.deadlineLabel,
      status: o.status === "Featured" ? "Open" : o.status,
      featured: o.status === "Featured",
      closed: o.status === "Closed",
      interested: o.interested ?? 0,
    };
  }
  const m = mine.find((x) => x.id === id);
  if (!m) return undefined;
  return {
    id: m.id,
    title: m.title,
    category: m.category,
    industry: m.industry,
    location: m.location,
    valueLabel: m.valueLabel,
    deadlineLabel: "-",
    status: m.status === "Active" ? "Open" : m.status,
    featured: false,
    closed: m.status === "Closed",
    interested: 0,
    cover: m.cover,
  };
}

export const formatDate = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const formatDateTime = (t: number) => `${formatDate(t)}, ${new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
