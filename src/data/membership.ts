import { MEMBERSHIP_ID } from "@/data/partners";

export type PlanKey = "regular" | "premium" | "founding";
export type Billing = "monthly" | "yearly";

export type Plan = {
  key: PlanKey;
  name: string;
  blurb: string;
  tag?: string;
  yearly: number;
  monthly: number;
};

// Placeholder pricing until the final plan fees come from the API.
export const PLANS: Plan[] = [
  { key: "founding", name: "Founding Member", blurb: "For early supporters & industry leaders", tag: "Most Premium", yearly: 24999, monthly: 2499 },
  { key: "premium", name: "Premium Member", blurb: "For growing businesses", tag: "Most Popular", yearly: 9999, monthly: 999 },
  { key: "regular", name: "Regular Member", blurb: "For individual professionals", yearly: 4999, monthly: 499 },
];

export const GST_RATE = 0.18;

export const planByKey = (key?: string) => PLANS.find((p) => p.key === key);
export const planPrice = (p: Plan, billing: Billing) => (billing === "yearly" ? p.yearly : p.monthly);
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const taxOf = (amount: number) => Math.floor(amount * GST_RATE);

export const CURRENT_MEMBER = {
  name: "Vishnu Soni",
  id: MEMBERSHIP_ID,
  plan: "premium" as PlanKey,
  planName: "Premium Member",
  since: "10 Oct 2025",
  validTill: "10 Oct 2026",
};

export type Availability = "yes" | "limited" | "no";

// One entry per benefit; `values` follows the column order [regular, premium, founding].
export const COMPARISON: { benefit: string; values: [Availability, Availability, Availability] }[] = [
  { benefit: "Partner Discounts", values: ["yes", "yes", "yes"] },
  { benefit: "Event Access", values: ["limited", "yes", "yes"] },
  { benefit: "Priority Networking", values: ["no", "yes", "yes"] },
  { benefit: "Business Visibility", values: ["no", "yes", "yes"] },
  { benefit: "Featured Profile", values: ["no", "yes", "yes"] },
  { benefit: "Exclusive Events", values: ["no", "yes", "yes"] },
  { benefit: "Dedicated Support", values: ["no", "no", "yes"] },
  { benefit: "Early Access Opportunities", values: ["no", "no", "yes"] },
  { benefit: "ABLN Recognition", values: ["no", "no", "yes"] },
];
