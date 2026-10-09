import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

// Sample questions until the Ask Network API is wired up.
export type QCategory = "Business Growth" | "Finance & Investment" | "Marketing & Sales" | "Technology" | "Operations" | "Human Resources" | "Legal & Compliance" | "Product Development" | "Other";

export const QCATEGORIES: { key: QCategory; short: string; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { key: "Business Growth", short: "Business Growth", icon: "stats-chart" },
  { key: "Finance & Investment", short: "Finance", icon: "layers-outline" },
  { key: "Marketing & Sales", short: "Marketing", icon: "megaphone-outline" },
  { key: "Technology", short: "Technology", icon: "laptop-outline" },
  { key: "Operations", short: "Operations", icon: "settings-outline" },
  { key: "Human Resources", short: "HR", icon: "people-outline" },
  { key: "Legal & Compliance", short: "Legal", icon: "scale-outline" },
  { key: "Product Development", short: "Product", icon: "cube-outline" },
  { key: "Other", short: "Other", icon: "ellipsis-horizontal" },
];

export type QSort = "latest" | "answers" | "helpful" | "trending";
export const QSORTS: { key: QSort; label: string; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { key: "latest", label: "Latest", icon: "time-outline" },
  { key: "answers", label: "Most Answers", icon: "chatbubble-outline" },
  { key: "helpful", label: "Most Helpful", icon: "thumbs-up-outline" },
  { key: "trending", label: "Trending", icon: "trending-up-outline" },
];

export type QType = "all" | "unanswered" | "expert";
export const QTYPES: { key: QType; label: string }[] = [
  { key: "all", label: "All Questions" },
  { key: "unanswered", label: "Unanswered Questions" },
  { key: "expert", label: "Questions with Expert Answers" },
];

export type Question = {
  id: string;
  author: string;
  expert?: boolean;
  hoursAgo: number;
  title: string;
  tags: string[];
  category: QCategory;
  categories?: QCategory[]; // extra categories when a question spans several
  answers: number;
  helpful: number;
  body?: string;
  expertName?: string;
};

const BASE: Omit<Question, "id" | "hoursAgo">[] = [
  { author: "Vikram Agarwal", title: "What are the key things to consider before expanding to other Indian cities?", tags: ["Business Growth", "Expansion"], category: "Business Growth", answers: 12, helpful: 24 },
  { author: "Priya Jain", title: "Best digital marketing strategies for a service-based business in 2026?", tags: ["Marketing & Sales", "Digital Marketing"], category: "Marketing & Sales", answers: 8, helpful: 15 },
  { author: "Rahul Agarwal", expert: true, title: "How can a retail business expand from Jaipur to Delhi and Mumbai?", tags: ["Business Growth", "Retail"], category: "Business Growth", answers: 28, helpful: 56 },
  { author: "Amit Gupta", title: "What legal structure is best for multi-city expansion in India?", tags: ["Legal & Compliance", "Business Growth"], category: "Legal & Compliance", answers: 6, helpful: 14 },
  { author: "Sandeep Mittal", title: "How to select the right technology partner for government projects?", tags: ["Technology", "Government"], category: "Technology", answers: 10, helpful: 18 },
  { author: "Neha Bansal", title: "What are the best customer retention strategies for D2C brands?", tags: ["Marketing & Sales", "Customer Retention"], category: "Marketing & Sales", answers: 14, helpful: 26 },
  { author: "Karan Agarwal", expert: true, title: "How should an early-stage startup think about its first funding round?", tags: ["Finance & Investment", "Fundraising"], category: "Finance & Investment", answers: 21, helpful: 47 },
  { author: "Sneha Bansal", title: "How do I build a reliable supply chain for a growing manufacturing unit?", tags: ["Operations", "Supply Chain"], category: "Operations", answers: 0, helpful: 2 },
  { author: "Ritika Jain", title: "What is the best way to hire and retain senior talent in a small company?", tags: ["Human Resources", "Hiring"], category: "Human Resources", answers: 9, helpful: 19 },
  { author: "Amit Goyal", title: "How do we validate a new product idea before investing in development?", tags: ["Product Development", "Validation"], category: "Product Development", answers: 0, helpful: 5 },
  { author: "Priya Mittal", expert: true, title: "Which business expansion strategies work best for franchise opportunities?", tags: ["Business Growth", "Franchise"], category: "Business Growth", answers: 17, helpful: 33 },
  { author: "Neha Sharma", title: "How can SaaS companies reduce churn in the first 90 days?", tags: ["Technology", "SaaS"], category: "Technology", answers: 5, helpful: 11 },
];

// Repeats the base set with later timestamps so the feed has enough pages to scroll.
export const QUESTIONS: Question[] = Array.from({ length: 36 }, (_, i) => {
  const b = BASE[i % BASE.length];
  const round = Math.floor(i / BASE.length);
  return {
    ...b,
    id: `q${i + 1}`,
    hoursAgo: 2 + i * 3,
    title: round ? `${b.title} (${round + 1})` : b.title,
    answers: b.answers && b.answers + round,
    helpful: b.helpful + round * 3,
  };
});

export const PAGE = 10;
export const MAX_CATEGORIES = 3;
export const catsOf = (q: Pick<Question, "category" | "categories">) => q.categories ?? [q.category];

export function timeAgo(h: number) {
  if (h < 1) return "Just now";
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export type QFilters = { query: string; categories: QCategory[]; sort: QSort; type: QType };
export const EMPTY_Q: QFilters = { query: "", categories: [], sort: "latest", type: "all" };

export const activeQCount = (f: QFilters) => f.categories.length + (f.sort !== "latest" ? 1 : 0) + (f.type !== "all" ? 1 : 0);

export function searchQuestions(f: QFilters, extra: Question[] = []): Question[] {
  const q = f.query.trim().toLowerCase();
  const list = [...extra, ...QUESTIONS].filter(
    (x) =>
      (!q || [x.title, x.author, ...catsOf(x), ...x.tags].join(" ").toLowerCase().includes(q)) &&
      (!f.categories.length || catsOf(x).some((c) => f.categories.includes(c))) &&
      (f.type === "all" || (f.type === "unanswered" ? x.answers === 0 : !!x.expert)),
  );
  const by: Record<QSort, (a: Question, b: Question) => number> = {
    latest: (a, b) => a.hoursAgo - b.hoursAgo,
    answers: (a, b) => b.answers - a.answers,
    helpful: (a, b) => b.helpful - a.helpful,
    trending: (a, b) => b.helpful / (b.hoursAgo + 12) - a.helpful / (a.hoursAgo + 12),
  };
  return list.sort(by[f.sort]);
}
