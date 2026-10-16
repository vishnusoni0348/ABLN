import { useSyncExternalStore } from "react";
import type { ImageSourcePropType } from "react-native";

export type Profile = {
  memberId: string;
  name: string;
  designation: string;
  company: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  dialCode: string;
  city: string;
  country: string;
  about: string;
  industry: string;
  website: string;
  bizType: string;
  employees: string;
  turnover: string;
  pocName: string;
  pocEmail: string;
  pocDialCode: string;
  pocMobile: string;
  bizAddress: string;
  bizState: string;
  bizCity: string;
  region: string;
  chapter: string;
  expertise: string[];
  lookingFor: string[];
  canOffer: string[];
  productLink: string;
  serviceLink: string;
  countries: string[];
  plan: string;
  validTill: string;
  photo?: ImageSourcePropType;
  cover?: ImageSourcePropType;
};

export type ProfileVisibility = "public" | "members" | "connections" | "private";

export type PrivacySettings = {
  visibility: ProfileVisibility;
  postVisibility: ProfileVisibility;
  showInSearch: boolean;
  hideProfilePicture: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showCompany: boolean;
  showJobTitle: boolean;
  showWebsite: boolean;
  showLocation: boolean;
  dbcShowMobile: boolean;
  dbcShowEmail: boolean;
  dbcShowChapter: boolean;
};

export type NotificationPrefs = {
  newConnections: boolean;
  messages: boolean;
  eventUpdates: boolean;
  partnerOffers: boolean;
  announcements: boolean;
  weeklyDigest: boolean;
  eventInvitations: boolean;
  emailPartnerOffers: boolean;
  productUpdates: boolean;
};

export type BlockedMember = { name: string; blockedAt: Date };

type State = {
  profile: Profile;
  privacy: PrivacySettings;
  notifications: NotificationPrefs;
  language: string;
  blocked: BlockedMember[];
};

// Sample member until the profile API is wired up.
let state: State = {
  profile: {
    memberId: "ABLN256789",
    name: "Vishnu Soni",
    designation: "Director",
    company: "True Value Infosoft Pvt. Ltd.",
    email: "vishnu@truevalueinfosoft.com",
    mobile: "98765 43210",
    dob: "1992-03-15",
    gender: "Male",
    dialCode: "+91",
    city: "Jaipur",
    country: "India",
    about: "Passionate about technology, business growth and building meaningful connections within the community.",
    industry: "IT Services & Consulting",
    website: "www.truevalueinfosoft.com",
    bizType: "Private Limited",
    employees: "11-50",
    turnover: "₹1 Cr - ₹5 Cr",
    pocName: "Rahul Sharma",
    pocEmail: "rahul@truevalueinfosoft.com",
    pocDialCode: "+91",
    pocMobile: "98290 12345",
    bizAddress: "Plot 24, Malviya Nagar",
    bizState: "Rajasthan",
    bizCity: "Jaipur",
    region: "Jaipur, Rajasthan",
    chapter: "Jaipur Chapter",
    expertise: ["Web Development", "Mobile Apps", "AI Solutions", "Digital Transformation"],
    lookingFor: ["Business Partnerships", "IT Projects", "Investment Opportunities"],
    canOffer: ["Software Development", "AI & Automation", "IT Consulting"],
    productLink: "",
    serviceLink: "",
    countries: ["India", "USA", "UAE", "UK", "Singapore", "Germany"],
    plan: "Premium Member",
    validTill: "10 Oct 2026",
    photo: require("../../assets/images/avatar-user.png"),
  },
  privacy: { visibility: "members", postVisibility: "members", showInSearch: true, hideProfilePicture: false, showEmail: true, showPhone: false, showCompany: true, showJobTitle: true, showWebsite: true, showLocation: true, dbcShowMobile: true, dbcShowEmail: true, dbcShowChapter: true },
  notifications: {
    newConnections: true,
    messages: true,
    eventUpdates: true,
    partnerOffers: true,
    announcements: true,
    weeklyDigest: true,
    eventInvitations: true,
    emailPartnerOffers: true,
    productUpdates: false,
  },
  language: "English (India)",
  blocked: [],
};
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const updateProfile = (patch: Partial<Profile>) => set({ profile: { ...state.profile, ...patch } });
export const updatePrivacy = (patch: Partial<PrivacySettings>) => set({ privacy: { ...state.privacy, ...patch } });
export const updateNotifications = (patch: Partial<NotificationPrefs>) => set({ notifications: { ...state.notifications, ...patch } });
export const setLanguage = (language: string) => set({ language });

export function blockMember(name: string) {
  if (state.blocked.some((b) => b.name === name)) return;
  set({ blocked: [{ name, blockedAt: new Date() }, ...state.blocked] });
}

export function unblockMember(name: string) {
  set({ blocked: state.blocked.filter((b) => b.name !== name) });
}

export function useSettings() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export const LANGUAGES = ["English (India)", "English (US)", "हिन्दी (Hindi)", "ગુજરાતી (Gujarati)", "मराठी (Marathi)"];
export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
export const DIAL_CODES = ["+91", "+971", "+65", "+1", "+44"];
