import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type FaqCategory = { key: string; title: string; sub: string; icon: IconName };

export type Faq = {
  id: string;
  category: string;
  q: string;
  /** Intro paragraph shown under the question. */
  a: string;
  steps?: string[];
  note?: string;
  updated: string;
  popular?: boolean;
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  { key: "Account & Profile", title: "Account & Profile", sub: "Profile settings, visibility, update information", icon: "person-circle-outline" },
  { key: "Membership & Plans", title: "Membership & Plans", sub: "Plans, benefits, renewal, payments", icon: "ribbon-outline" },
  { key: "Networking", title: "Networking", sub: "Connections, messages, community", icon: "people-outline" },
  { key: "Partner Directory", title: "Partner Directory", sub: "Partner offers, redemption, benefits", icon: "business-outline" },
  { key: "Events", title: "Events", sub: "Event registration, participation, access", icon: "calendar-outline" },
  { key: "Privacy & Security", title: "Privacy & Security", sub: "Data privacy, account security", icon: "shield-checkmark-outline" },
  { key: "Technical Support", title: "Technical Support", sub: "App issues, login, features", icon: "settings-outline" },
  { key: "General", title: "General", sub: "Other common questions", icon: "chatbubble-ellipses-outline" },
];

export const FAQS: Faq[] = [
  {
    id: "upgrade-membership",
    category: "Membership & Plans",
    q: "How do I upgrade my membership?",
    a: "You can upgrade your membership at any time from the Membership section in the app.",
    steps: ["Go to More > Membership", "View available plans and compare benefits", "Select the plan you want to upgrade to", "Complete the payment process", "Your membership will be upgraded instantly after successful payment"],
    note: "Your existing plan benefits will remain active until the new plan is activated.",
    updated: "10 Oct 2026",
  },
  {
    id: "renew-membership",
    category: "Membership & Plans",
    q: "How do I renew my membership?",
    a: "You can renew from the Membership tab once your renewal window opens, or any time before it expires.",
    steps: ["Open the Membership tab", "Tap Renew Membership", "Review the plan and amount", "Complete the payment"],
    note: "Renewing early adds the new term to the end of your current one.",
    updated: "10 Oct 2026",
    popular: true,
  },
  {
    id: "premium-benefits",
    category: "Membership & Plans",
    q: "What are the benefits of Premium membership?",
    a: "Premium members get priority access to events, expanded partner offers, advanced member search and a verified badge on their profile.",
    steps: ["Open Membership > Compare Plans", "Review the benefits listed under Premium"],
    updated: "08 Oct 2026",
  },
  {
    id: "change-plan",
    category: "Membership & Plans",
    q: "Can I change my membership plan?",
    a: "Yes. You can move to a higher plan at any time. Downgrades take effect when your current term ends.",
    updated: "05 Oct 2026",
  },
  {
    id: "membership-expiry",
    category: "Membership & Plans",
    q: "How will I know when my membership expires?",
    a: "We send reminders before your membership expires, and the expiry date is always shown in Membership Status.",
    updated: "05 Oct 2026",
  },
  {
    id: "refund",
    category: "Payments & Billing",
    q: "Is there a refund for membership payments?",
    a: "Membership fees are non-refundable once the plan is activated. If you were charged incorrectly, raise a support request and we will review it.",
    updated: "03 Oct 2026",
  },
  {
    id: "founding-member",
    category: "Membership & Plans",
    q: "What is a Founding Member plan?",
    a: "The Founding Member plan is a limited, long-term plan for early supporters of ABLN with the highest tier of benefits.",
    updated: "01 Oct 2026",
  },
  {
    id: "partner-offers",
    category: "Partner Directory",
    q: "How do I access partner offers with my membership?",
    a: "Partner offers are listed in the Partners tab. Open an offer and tap Redeem to get your code or QR.",
    steps: ["Open the Partners tab", "Choose a partner and an offer", "Tap Redeem Offer", "Show the code or QR to the partner"],
    updated: "02 Oct 2026",
    popular: true,
  },
  {
    id: "update-profile",
    category: "Account & Profile",
    q: "How do I update my profile?",
    a: "Open My Profile and tap Edit Profile to change your personal, business or expertise details.",
    steps: ["Open More > My Profile", "Tap Edit Profile", "Update your details", "Tap Save Changes"],
    updated: "09 Oct 2026",
    popular: true,
  },
  {
    id: "profile-visibility",
    category: "Account & Profile",
    q: "Who can see my profile?",
    a: "You control this in Settings > Privacy Settings, where you can limit what members and non-members can see.",
    updated: "06 Oct 2026",
  },
  {
    id: "connect-members",
    category: "Networking",
    q: "How do I connect with members?",
    a: "Find a member in the Network tab and tap Connect. They are notified, and you can start networking once they accept.",
    updated: "07 Oct 2026",
    popular: true,
  },
  {
    id: "request-intro",
    category: "Networking",
    q: "How do I request an introduction?",
    a: "Open a member profile and tap Request Introduction. Choose a mutual connection and add a short message.",
    updated: "07 Oct 2026",
  },
  {
    id: "event-register",
    category: "Events",
    q: "How do I register for an event?",
    a: "Open the event from the Events tab and tap Register. You will receive a confirmation and a ticket in My Events.",
    updated: "04 Oct 2026",
  },
  {
    id: "data-privacy",
    category: "Privacy & Security",
    q: "How is my data protected?",
    a: "Your data is encrypted in transit and stored securely. We never share your personal details with other members without your consent.",
    updated: "02 Oct 2026",
  },
  {
    id: "deactivate",
    category: "Privacy & Security",
    q: "How do I deactivate my account?",
    a: "Go to Settings > Account Settings > Deactivate Account. You can reactivate by logging in again.",
    updated: "02 Oct 2026",
  },
  {
    id: "login-issue",
    category: "Technical Support",
    q: "I cannot log in to my account",
    a: "Check that you are using the registered mobile number or email, then request a new OTP. If it still fails, contact support.",
    updated: "01 Oct 2026",
  },
  {
    id: "what-is-abln",
    category: "General",
    q: "What is ABLN?",
    a: "ABLN is the Agarwal Business Leaders Network, a members-only community for business networking, opportunities and partner benefits.",
    updated: "01 Oct 2026",
  },
];

export const POPULAR_FAQS = FAQS.filter((f) => f.popular);

export const ISSUE_TYPES = ["Login Issue", "Payment Problem", "App Crash / Bug", "Profile / Account", "Membership", "Events", "Other"];

export const SUPPORT_SUBJECTS = ["Membership & Plans", "Payments & Billing", "Account & Profile", "Networking", "Partner Offers", "Events", "Technical Issue", "Other"];

export const findFaq = (id?: string) => FAQS.find((f) => f.id === id);

export function searchFaqs(query: string, category?: string): Faq[] {
  const q = query.trim().toLowerCase();
  return FAQS.filter((f) => {
    if (category && f.category !== category) return false;
    if (!q) return true;
    return [f.q, f.a, f.category, ...(f.steps ?? [])].some((t) => t.toLowerCase().includes(q));
  });
}
