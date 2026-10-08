import { findMember, type Member } from "@/data/members";

// Sample expert details layered on top of the member directory until the experts API is wired up.
export type Expert = {
  member: Member;
  yearsExp: number;
  answers: number;
  rating: number;
  available: boolean;
  freeAdvice: boolean;
  paidPrice?: number;
  paidMinutes: number;
  tagline: string;
  about: string;
  areas: string[];
  experience: { title: string; org: string; period: string }[];
  reviews: { by: string; rating: number; text: string }[];
};

export const SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

type Extra = Partial<Omit<Expert, "member">>;

const EXTRAS: Record<string, Extra> = {
  "Rahul Agarwal": {
    yearsExp: 15,
    answers: 320,
    rating: 4.8,
    paidPrice: 499,
    tagline: "Helping businesses scale with practical insights and real-world experience.",
    about:
      "Passionate about helping businesses grow through technology, innovation and strategic consulting. I have worked with startups and established enterprises to build scalable solutions and solve complex business challenges.",
    areas: ["Business Strategy", "Technology", "Startup Growth", "AI & Digital Transformation", "Market Expansion", "Product Development"],
    experience: [
      { title: "CEO & Founder", org: "TechVision Pvt Ltd", period: "2014 - Present" },
      { title: "Head of Product", org: "Nexa Systems", period: "2010 - 2014" },
    ],
    reviews: [
      { by: "Sneha Bansal", rating: 5, text: "Clear, practical guidance on our go-to-market plan." },
      { by: "Amit Goyal", rating: 5, text: "Saved us months of trial and error. Highly recommended." },
      { by: "Priya Mittal", rating: 4, text: "Great session on scaling our product team." },
    ],
  },
};

export function findExpert(name?: string): Expert | undefined {
  const member = findMember(name);
  if (!member) return undefined;
  const extra = EXTRAS[member.name] ?? {};
  return {
    member,
    yearsExp: 10,
    answers: 0,
    rating: 0,
    available: true,
    freeAdvice: true,
    paidMinutes: 30,
    tagline: `${member.role} at ${member.company}, sharing practical advice on ${member.industry.toLowerCase()}.`,
    about: member.about ?? `${member.role} at ${member.company}, working in ${member.industry}. Open to sharing advice with fellow ABLN members.`,
    areas: member.expertise.length ? member.expertise : member.tags,
    experience: [{ title: member.role, org: member.company, period: "Present" }],
    reviews: [],
    ...extra,
  };
}

export const rupees = (n: number) => `₹${n}`;
