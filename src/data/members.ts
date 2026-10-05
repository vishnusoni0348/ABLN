import type { ImageSourcePropType } from "react-native";

// Sample directory until the members API is wired up.
export type MemberType = "Individual" | "Business";

export type Member = {
  name: string;
  role: string;
  company: string;
  city: string;
  country: string;
  location: string;
  industry: string;
  tags: string[];
  expertise: string[];
  lookingFor: string[];
  canOffer: string[];
  type: MemberType;
  verified: boolean;
  joinedDaysAgo: number;
  photo?: ImageSourcePropType;
  about?: string;
  markets?: string[];
  // Limited visibility: only basic info is shown until the viewer connects.
  restricted?: boolean;
};

export type Filters = {
  city: string;
  country: string;
  industry: string;
  expertise: string;
  lookingFor: string[];
  canOffer: string[];
  memberType: MemberType | "Both";
  verifiedOnly: boolean;
};

export const EMPTY_FILTERS: Filters = {
  city: "",
  country: "",
  industry: "",
  expertise: "",
  lookingFor: [],
  canOffer: [],
  memberType: "Both",
  verifiedOnly: false,
};

export type SortKey = "relevance" | "recent" | "name" | "industry" | "nearest";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "recent", label: "Recently Joined" },
  { key: "name", label: "Name A - Z" },
  { key: "industry", label: "Industry" },
  { key: "nearest", label: "Location (Nearest)" },
];

export const PAGE_SIZE = 20;

const PLACES: Record<string, { region: string; country: string; km: number }> = {
  Jaipur: { region: "Rajasthan", country: "India", km: 0 },
  Delhi: { region: "India", country: "India", km: 280 },
  Mumbai: { region: "India", country: "India", km: 1150 },
  Bangalore: { region: "India", country: "India", km: 1850 },
  Dubai: { region: "UAE", country: "UAE", km: 2700 },
  Singapore: { region: "Singapore", country: "Singapore", km: 5000 },
  "New York": { region: "USA", country: "USA", km: 12000 },
};

export const CITIES = Object.keys(PLACES);
export const COUNTRIES = ["India", "UAE", "Singapore", "USA"];
export const INDUSTRIES = ["Technology", "Healthcare", "Manufacturing", "E-commerce", "Finance", "Real Estate", "Sustainability", "Education"];
export const EXPERTISE = ["Strategy", "Marketing", "Operations", "Fundraising", "Sales", "Supply Chain", "Product", "Legal & Compliance"];
export const LOOKING_FOR = ["Partners", "Customers", "Investors", "Suppliers", "Mentorship", "Other"];
export const CAN_OFFER = ["Products", "Services", "Expertise", "Investment", "Partnership", "Other"];

const TAGS_BY_INDUSTRY: Record<string, string[]> = {
  Technology: ["AI", "SaaS", "Business Growth", "Cloud"],
  Healthcare: ["HealthTech", "Pharma", "Wellness"],
  Manufacturing: ["Supply Chain", "Exports", "Automation"],
  "E-commerce": ["Marketing", "Retail", "D2C"],
  Finance: ["Venture Capital", "Wealth", "Fintech"],
  "Real Estate": ["Investment", "Construction", "Leasing"],
  Sustainability: ["Cleantech", "Partnerships", "Solar"],
  Education: ["EdTech", "Training", "Skilling"],
};

const COMPANY_SUFFIX: Record<string, string> = {
  Technology: "Technologies",
  Healthcare: "Healthcare",
  Manufacturing: "Industries",
  "E-commerce": "Commerce",
  Finance: "Capital",
  "Real Estate": "Realty",
  Sustainability: "Green Energy",
  Education: "Learning",
};

function place(city: string) {
  const p = PLACES[city];
  return { country: p.country, location: `${city}, ${p.region}` };
}

type Seed = Pick<Member, "name" | "role" | "company" | "city" | "industry" | "joinedDaysAgo"> &
  Partial<Pick<Member, "tags" | "verified" | "photo" | "type" | "expertise" | "lookingFor" | "canOffer" | "about" | "markets" | "restricted">>;

function make(s: Seed, i: number): Member {
  const extras = TAGS_BY_INDUSTRY[s.industry];
  return {
    ...s,
    ...place(s.city),
    tags: s.tags ?? [s.industry, extras[i % extras.length]],
    expertise: s.expertise ?? [EXPERTISE[i % 8], EXPERTISE[(i + 3) % 8]],
    lookingFor: s.lookingFor ?? [LOOKING_FOR[i % 6], LOOKING_FOR[(i + 2) % 6]],
    canOffer: s.canOffer ?? [CAN_OFFER[(i + 1) % 6], CAN_OFFER[(i + 3) % 6]],
    type: s.type ?? (i % 5 === 0 ? "Business" : "Individual"),
    verified: s.verified ?? i % 3 !== 1,
  };
}

const FEATURED: Seed[] = [
  { name: "Rahul Agarwal", role: "CEO", company: "TechVision Pvt Ltd", city: "Jaipur", industry: "Technology", tags: ["Technology", "AI", "Business Growth"], verified: true, joinedDaysAgo: 40, photo: require("../../assets/images/member-rahul.png"), about: "Passionate about building technology solutions that create real business impact. Open to collaborations, partnerships and mentorship opportunities.", expertise: ["AI & ML", "Product Development", "Digital Transformation", "Business Strategy"], lookingFor: ["Partners", "Investors", "Customers", "Mentorship"], canOffer: ["Technology", "Services", "Expertise", "Partnership"], markets: ["India", "UAE", "USA", "Singapore"] },
  { name: "Sneha Bansal", role: "Founder", company: "GreenNest Solutions", city: "Delhi", industry: "Sustainability", tags: ["Sustainability", "Cleantech", "Partnerships"], verified: true, joinedDaysAgo: 35, photo: require("../../assets/images/member-sneha.png") },
  { name: "Amit Goyal", role: "Director", company: "Goyal Enterprises", city: "Mumbai", industry: "Manufacturing", tags: ["Manufacturing", "Supply Chain"], verified: true, joinedDaysAgo: 50, photo: require("../../assets/images/member-amit.png") },
  { name: "Priya Mittal", role: "Co-Founder", company: "Kraftly Innovations", city: "Bangalore", industry: "E-commerce", tags: ["E-commerce", "Marketing"], verified: true, joinedDaysAgo: 28, photo: require("../../assets/images/member-priya.png") },
  { name: "Vikram Sethi", role: "Founder", company: "Sethi Group", city: "Jaipur", industry: "Real Estate", tags: ["Real Estate", "Investment"], verified: true, joinedDaysAgo: 2 },
  { name: "Neha Sharma", role: "Business Head", company: "InnovaTech", city: "Delhi", industry: "Technology", tags: ["Technology", "Product", "Strategy"], verified: true, joinedDaysAgo: 3 },
  { name: "Karan Agarwal", role: "Investor", company: "Agarwal Capital", city: "Mumbai", industry: "Finance", tags: ["Finance", "Venture Capital"], verified: false, joinedDaysAgo: 5 },
  { name: "Ritika Jain", role: "Co-Founder", company: "MediCare Plus", city: "Bangalore", industry: "Healthcare", tags: ["Healthcare", "HealthTech"], verified: false, joinedDaysAgo: 7 },
];

FEATURED.push({ name: "Ankit Sharma", role: "Senior Director", company: "Confidential Company", city: "Mumbai", industry: "Technology", tags: ["Technology"], verified: true, joinedDaysAgo: 12, restricted: true });

const FIRST = ["Aarav", "Ishita", "Rohan", "Ananya", "Manish", "Pooja", "Sanjay", "Kavita", "Deepak", "Meera", "Arjun", "Divya", "Nikhil", "Shreya", "Harsh", "Simran"];
const LAST = ["Gupta", "Khandelwal", "Maheshwari", "Singhal", "Jindal", "Mittal", "Bansal", "Goel", "Agrawal", "Poddar", "Kedia", "Bhartia"];
const ROLES = ["Founder", "CEO", "Director", "Co-Founder", "Managing Director", "Business Head"];
const CITY_POOL = ["Jaipur", "Delhi", "Mumbai", "Bangalore", "Jaipur", "Delhi", "Mumbai", "Dubai", "Bangalore", "Singapore", "Jaipur", "New York"];

const GENERATED: Seed[] = Array.from({ length: 56 }, (_, i) => {
  const industry = INDUSTRIES[(i * 3 + 1) % INDUSTRIES.length];
  const last = LAST[(i + Math.floor(i / 12)) % LAST.length];
  return {
    name: `${FIRST[i % FIRST.length]} ${last}`,
    role: ROLES[i % ROLES.length],
    company: `${last} ${COMPANY_SUFFIX[industry]}`,
    city: CITY_POOL[i % CITY_POOL.length],
    industry,
    joinedDaysAgo: 10 + ((i * 7) % 80),
  };
});

export const MEMBERS: Member[] = [...FEATURED, ...GENERATED].map(make);

function includesAny(have: string[], want: string[]) {
  return !want.length || want.some((w) => have.includes(w));
}

export function findMember(name?: string) {
  return MEMBERS.find((m) => m.name === name);
}

export function searchMembers(query: string, f: Filters, sort: SortKey): Member[] {
  const q = query.trim().toLowerCase();
  const text = (m: Member) => [m.name, m.role, m.company, m.location, m.industry, ...m.tags, ...m.expertise].join(" ").toLowerCase();
  const score = (m: Member) => (m.name.toLowerCase().startsWith(q) ? 3 : m.industry.toLowerCase() === q ? 2 : 1);

  const out = MEMBERS.filter(
    (m) =>
      (!q || text(m).includes(q)) &&
      (!f.city || m.city === f.city) &&
      (!f.country || m.country === f.country) &&
      (!f.industry || m.industry === f.industry) &&
      (!f.expertise || m.expertise.includes(f.expertise)) &&
      includesAny(m.lookingFor, f.lookingFor) &&
      includesAny(m.canOffer, f.canOffer) &&
      (f.memberType === "Both" || m.type === f.memberType) &&
      (!f.verifiedOnly || m.verified),
  );

  // Array.prototype.sort is stable, so ties keep the directory order.
  switch (sort) {
    case "recent":
      return out.sort((a, b) => a.joinedDaysAgo - b.joinedDaysAgo);
    case "name":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case "industry":
      return out.sort((a, b) => a.industry.localeCompare(b.industry));
    case "nearest":
      return out.sort((a, b) => PLACES[a.city].km - PLACES[b.city].km);
    default:
      return q ? out.sort((a, b) => score(b) - score(a)) : out;
  }
}

export function activeFilterCount(f: Filters) {
  return (
    [f.city, f.country, f.industry, f.expertise].filter(Boolean).length +
    f.lookingFor.length +
    f.canOffer.length +
    (f.memberType !== "Both" ? 1 : 0) +
    (f.verifiedOnly ? 1 : 0)
  );
}
