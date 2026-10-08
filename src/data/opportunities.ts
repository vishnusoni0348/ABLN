// Sample opportunities until the opportunities API is wired up.
export const CATEGORIES = ["Partnership", "Investment", "Distribution", "Collaboration", "Services"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["Open", "Closing Soon", "Featured"] as const;
export type OppStatus = (typeof STATUSES)[number] | "Closed";

export const POSTED_BY = ["ABLN Members", "Verified Companies"] as const;
export type PostedBy = (typeof POSTED_BY)[number];

export const OPP_INDUSTRIES = ["Technology", "FMCG", "Manufacturing", "Education", "Energy", "Healthcare", "Real Estate", "Services"];
export const OPP_LOCATIONS = ["Mumbai, Maharashtra", "Delhi, India", "Bangalore, Karnataka", "Jaipur, Rajasthan", "Pune, Maharashtra", "Chennai, Tamil Nadu"];

// Value ranges are in lakhs (100 lakh = 1 Cr); `max: Infinity` is open-ended.
export const VALUE_RANGES = [
  { key: "lt10l", label: "< 10L", min: 0, max: 10 },
  { key: "10l-50l", label: "10L – 50L", min: 10, max: 50 },
  { key: "50l-2cr", label: "50L – 2 Cr", min: 50, max: 200 },
  { key: "2cr-10cr", label: "2 Cr – 10 Cr", min: 200, max: 1000 },
  { key: "10cr+", label: "10 Cr+", min: 1000, max: Infinity },
] as const;

export const SORT_OPTIONS = [
  { key: "recent", label: "Most Recent" },
  { key: "deadline", label: "Deadline (Soonest)" },
  { key: "value", label: "Value (High to Low)" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export type Opportunity = {
  id: string;
  title: string;
  category: Category;
  industry: string;
  location: string;
  valueLabel: string;
  minL: number;
  maxL: number;
  deadline: string; // ISO date
  deadlineLabel: string;
  status: OppStatus;
  postedBy: PostedBy;
  postedDaysAgo: number;
  about: string;
  interested?: number; // members who expressed interest
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1",
    title: "Strategic Distribution Partnership for FMCG Products",
    category: "Distribution",
    industry: "FMCG",
    location: "Mumbai, Maharashtra",
    valueLabel: "₹50L – 2 Cr",
    minL: 50,
    maxL: 200,
    deadline: "2026-11-30",
    deadlineLabel: "30 Nov 2026",
    status: "Featured",
    postedBy: "Verified Companies",
    postedDaysAgo: 2,
    about: "A fast-growing FMCG brand is looking for regional distribution partners across western India with cold-chain and retail reach.",
  },
  {
    id: "o2",
    title: "Technology Partnership for AI-based Solutions",
    category: "Partnership",
    industry: "Technology",
    location: "Bangalore, Karnataka",
    valueLabel: "₹1 Cr – 5 Cr",
    minL: 100,
    maxL: 500,
    deadline: "2026-12-15",
    deadlineLabel: "15 Dec 2026",
    status: "Open",
    postedBy: "ABLN Members",
    postedDaysAgo: 4,
    about: "Co-develop and resell AI-based workflow automation for mid-size enterprises. Looking for an implementation and sales partner.",
  },
  {
    id: "o3",
    title: "AI Solution Partnership for Enterprises",
    category: "Partnership",
    industry: "Technology",
    location: "Bangalore, Karnataka",
    valueLabel: "₹1 Cr – 5 Cr",
    minL: 100,
    maxL: 500,
    deadline: "2026-11-20",
    deadlineLabel: "20 Nov 2026",
    status: "Featured",
    postedBy: "Verified Companies",
    postedDaysAgo: 1,
    about: "Enterprise AI platform seeking channel partners to deliver pilots and roll-outs for large corporates.",
  },
  {
    id: "o4",
    title: "Export Partnership for Handicraft Products",
    category: "Distribution",
    industry: "Manufacturing",
    location: "Jaipur, Rajasthan",
    valueLabel: "₹50L – 1 Cr",
    minL: 50,
    maxL: 100,
    deadline: "2026-11-10",
    deadlineLabel: "10 Nov 2026",
    status: "Closing Soon",
    postedBy: "ABLN Members",
    postedDaysAgo: 9,
    about: "Established handicraft manufacturer seeking export and distribution partners for the EU and Middle East markets.",
  },
  {
    id: "o5",
    title: "Investment Opportunity in EdTech Platform",
    category: "Investment",
    industry: "Education",
    location: "Delhi, India",
    valueLabel: "₹2 Cr – 10 Cr",
    minL: 200,
    maxL: 1000,
    deadline: "2026-12-05",
    deadlineLabel: "05 Dec 2026",
    status: "Open",
    postedBy: "Verified Companies",
    postedDaysAgo: 6,
    about: "Seed-stage EdTech platform with 40k active learners raising a growth round to expand into vernacular content.",
  },
  {
    id: "o6",
    title: "Collaboration for Renewable Energy Projects",
    category: "Collaboration",
    industry: "Energy",
    location: "Pune, Maharashtra",
    valueLabel: "₹5 Cr – 20 Cr",
    minL: 500,
    maxL: 2000,
    deadline: "2026-12-28",
    deadlineLabel: "28 Dec 2026",
    status: "Open",
    postedBy: "ABLN Members",
    postedDaysAgo: 12,
    about: "Joint development of rooftop and utility-scale solar projects. Seeking EPC, financing and land partners.",
  },
  {
    id: "o7",
    title: "Managed IT Services for Growing SMEs",
    category: "Services",
    industry: "Services",
    location: "Chennai, Tamil Nadu",
    valueLabel: "₹10L – 50L",
    minL: 10,
    maxL: 50,
    deadline: "2026-10-25",
    deadlineLabel: "25 Oct 2026",
    status: "Closing Soon",
    postedBy: "ABLN Members",
    postedDaysAgo: 15,
    about: "Looking for an IT services firm to provide managed infrastructure and support to a network of SME clients.",
  },
  {
    id: "o8",
    title: "Joint Venture for Real Estate Project",
    category: "Investment",
    industry: "Real Estate",
    location: "Mumbai, Maharashtra",
    valueLabel: "₹10 Cr+",
    minL: 1000,
    maxL: Infinity,
    deadline: "2027-01-15",
    deadlineLabel: "15 Jan 2027",
    status: "Open",
    postedBy: "Verified Companies",
    postedDaysAgo: 20,
    about: "Premium residential project in Mumbai seeking a co-investor and development partner.",
  },
  {
    id: "o9",
    title: "Logistics Tie-up for E-commerce Delivery",
    category: "Services",
    industry: "Services",
    location: "Mumbai, Maharashtra",
    valueLabel: "₹50L – 2 Cr",
    minL: 50,
    maxL: 200,
    deadline: "2026-09-30",
    deadlineLabel: "30 Sep 2026",
    status: "Closed",
    postedBy: "ABLN Members",
    postedDaysAgo: 40,
    about: "Last-mile logistics partnership for a growing e-commerce brand across metro cities.",
    interested: 24,
  },
  {
    id: "o10",
    title: "Looking for Technology Partners for Expansion",
    category: "Partnership",
    industry: "Technology",
    location: "India (Multiple Cities)",
    valueLabel: "₹50L – 2 Cr",
    minL: 50,
    maxL: 200,
    deadline: "2026-12-31",
    deadlineLabel: "31 Dec 2026",
    status: "Open",
    postedBy: "ABLN Members",
    postedDaysAgo: 3,
    about: "Seeking technology partners to expand our business across multiple cities in India through joint solutions and shared go-to-market.",
  },
];

export type Filters = {
  category: Category | "All";
  industry: string;
  location: string;
  value: string; // VALUE_RANGES key, "" = all
  status: OppStatus | "All";
  postedBy: PostedBy | "All";
};

export const EMPTY_FILTERS: Filters = { category: "All", industry: "", location: "", value: "", status: "All", postedBy: "All" };

// Every non-default filter counts, including the quick category chip.
export function activeFilterCount(f: Filters) {
  return [f.category !== "All", !!f.industry, !!f.location, !!f.value, f.status !== "All", f.postedBy !== "All"].filter(Boolean).length;
}

export function searchOpportunities(query: string, f: Filters, sort: SortKey): Opportunity[] {
  const q = query.trim().toLowerCase();
  const range = VALUE_RANGES.find((r) => r.key === f.value);
  const list = OPPORTUNITIES.filter((o) => {
    if (q && ![o.title, o.category, o.industry, o.location, o.about].some((s) => s.toLowerCase().includes(q))) return false;
    if (f.category !== "All" && o.category !== f.category) return false;
    if (f.industry && o.industry !== f.industry) return false;
    if (f.location && o.location !== f.location) return false;
    if (range && !(o.minL < range.max && o.maxL >= range.min)) return false;
    if (f.status !== "All" && o.status !== f.status) return false;
    if (f.postedBy !== "All" && o.postedBy !== f.postedBy) return false;
    return true;
  });
  return list.sort((a, b) => {
    if (sort === "deadline") return a.deadline.localeCompare(b.deadline);
    if (sort === "value") return b.maxL - a.maxL || b.minL - a.minL;
    return a.postedDaysAgo - b.postedDaysAgo;
  });
}

export type MineStatus = "Active" | "Pending" | "Closed";
export type MyOpportunity = { id: string; title: string; category: Category; industry: string; location: string; valueLabel: string; postedLabel: string; status: MineStatus; cover?: string };

export const MY_OPPORTUNITIES: MyOpportunity[] = [
  { id: "m1", title: "IT Consulting Partnership for SMEs", category: "Partnership", industry: "Services", location: "Delhi, India", valueLabel: "₹50L – 2 Cr", postedLabel: "10 Oct 2026", status: "Active" },
  { id: "m2", title: "Manufacturing Tie-up for Export Markets", category: "Distribution", industry: "Manufacturing", location: "Jaipur, Rajasthan", valueLabel: "₹1 Cr – 5 Cr", postedLabel: "05 Oct 2026", status: "Pending" },
  { id: "m3", title: "Investment Opportunity in Real Estate Project", category: "Investment", industry: "Real Estate", location: "Mumbai, Maharashtra", valueLabel: "₹5 Cr – 20 Cr", postedLabel: "28 Sep 2026", status: "Active" },
  { id: "m4", title: "Joint Venture for AI Healthcare Platform", category: "Collaboration", industry: "Healthcare", location: "Bangalore, Karnataka", valueLabel: "₹2 Cr – 10 Cr", postedLabel: "12 Sep 2026", status: "Closed" },
  { id: "m5", title: "Regional Distribution for Packaged Foods", category: "Distribution", industry: "FMCG", location: "Pune, Maharashtra", valueLabel: "₹10L – 50L", postedLabel: "02 Oct 2026", status: "Active" },
  { id: "m6", title: "Cloud Services Reseller Program", category: "Services", industry: "Technology", location: "Chennai, Tamil Nadu", valueLabel: "₹50L – 1 Cr", postedLabel: "01 Oct 2026", status: "Pending" },
  { id: "m7", title: "Solar Rooftop Collaboration", category: "Collaboration", industry: "Energy", location: "Jaipur, Rajasthan", valueLabel: "₹2 Cr – 10 Cr", postedLabel: "15 Sep 2026", status: "Active" },
];
