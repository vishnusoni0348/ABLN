import type { Question } from "@/data/questions";

// Sample answers and replies until the Ask Network API is wired up.
export type Reply = { id: string; aid: string; author: string; expert?: boolean; hoursAgo: number; body: string };

export type Answer = {
  id: string;
  qid: string;
  author: string;
  expert: boolean;
  hoursAgo: number;
  body: string;
  points?: { title: string; text: string }[];
  closing?: string;
  helpful: number;
  replyCount: number;
};

export const EXPERT_NAMES = ["Rahul Agarwal", "Priya Mittal", "Amit Goyal", "Sneha Bansal"];

const AUTHORS: { name: string; expert: boolean }[] = [
  { name: "Rahul Agarwal", expert: true },
  { name: "Priya Mittal", expert: true },
  { name: "Amit Gupta", expert: false },
  { name: "Neha Bansal", expert: false },
  { name: "Karan Agarwal", expert: true },
  { name: "Sandeep Mittal", expert: false },
];

const POINTS = [
  { title: "Market Research", text: "Understand local demand, competition and customer preferences." },
  { title: "Business Model", text: "Decide between company-owned stores, franchise or partnership." },
  { title: "Location Strategy", text: "Choose high-footfall areas and analyze rental costs." },
  { title: "Local Team", text: "Hire local talent who understand the market." },
  { title: "Supply Chain", text: "Ensure efficient logistics and inventory management." },
];

const BODIES = {
  expertLong: "Expanding to new markets is a great growth strategy. Based on my experience working with multiple businesses, here are the key factors to consider:",
  expertShort: "I have helped multiple businesses scale across India. Focus on demand validation, a strong local team, supply chain and brand positioning before committing capital.",
  member: "We went through something similar last year. My biggest learning was to focus on local market understanding and to hire the right people early.",
};

const REPLY_BODIES = [
  "This is very helpful! Can you share how to find reliable partners in new cities?",
  "Thanks for sharing. Did you face any compliance challenges in the first year?",
  "Great point. How long did it take before the new location became profitable?",
  "Agreed, local hiring made the biggest difference for us as well.",
  "Could you share more about the budget you would recommend to start with?",
];

const cache = new Map<string, Answer[]>();

// Deterministic answers for a question, one per counted answer.
export function seedAnswers(q: Pick<Question, "id" | "answers" | "helpful">): Answer[] {
  const hit = cache.get(q.id);
  if (hit && hit.length === q.answers) return hit;
  const list = Array.from({ length: q.answers }, (_, i): Answer => {
    const a = AUTHORS[i % AUTHORS.length];
    const long = a.expert && i % 2 === 0;
    return {
      id: `a-${q.id}-${i + 1}`,
      qid: q.id,
      author: a.name,
      expert: a.expert,
      hoursAgo: 20 + i * 18,
      body: long ? BODIES.expertLong : a.expert ? BODIES.expertShort : BODIES.member,
      points: long ? POINTS : undefined,
      closing: long ? "Happy to discuss more if you need specific guidance for any city." : undefined,
      helpful: Math.max(2, Math.round(q.helpful / (i + 1))),
      replyCount: (i * 2 + 3) % 6,
    };
  });
  cache.set(q.id, list);
  return list;
}

export function seedReplies(aid: string, count: number): Reply[] {
  return Array.from({ length: count }, (_, i) => {
    const a = AUTHORS[(i + 2) % AUTHORS.length];
    return { id: `r-${aid}-${i + 1}`, aid, author: a.name, expert: a.expert, hoursAgo: 4 + (count - i) * 7, body: REPLY_BODIES[i % REPLY_BODIES.length] };
  });
}
