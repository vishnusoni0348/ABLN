import { useSyncExternalStore } from "react";
import type { ImageSourcePropType } from "react-native";

export type Visibility = "public" | "members" | "private";

export type BusinessCard = {
  name: string;
  role: string;
  company: string;
  location: string;
  tags: string[];
  about: string;
  visibility: Visibility;
  photo?: ImageSourcePropType;
};

// Sample card until the profile API is wired up.
let state: BusinessCard = {
  name: "Rahul Agarwal",
  role: "CEO & Founder",
  company: "TechVision Pvt Ltd",
  location: "Jaipur, Rajasthan, India",
  tags: ["Technology", "AI", "Business Growth"],
  about: "Building technology solutions that create real business impact through innovation and collaboration.",
  visibility: "members",
  photo: require("../../assets/images/member-rahul.png"),
};
const listeners = new Set<() => void>();

export function setCard(patch: Partial<BusinessCard>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useBusinessCard() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export const cardLink = (c: BusinessCard) => `https://abln.in/m/${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export const VISIBILITY_OPTIONS: { key: Visibility; icon: "globe-outline" | "people" | "lock-closed"; title: string; desc: string }[] = [
  { key: "public", icon: "globe-outline", title: "Public", desc: "Visible to everyone on the internet.\nAnyone can view your profile." },
  { key: "members", icon: "people", title: "ABLN Members Only", desc: "Visible only to ABLN members.\nRecommended for better networking." },
  { key: "private", icon: "lock-closed", title: "Private", desc: "Only people you share the link with\ncan view your profile." },
];
