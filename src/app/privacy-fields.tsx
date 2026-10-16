import { HeaderSave, SectionHeading, SettingsScreen, ToggleRow } from "@/components/settings-ui";
import { PrivacySettings, updatePrivacy, useSettings } from "@/lib/profile-store";
import type { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ComponentProps, useState } from "react";
import { Alert } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];
type FieldKey = "showEmail" | "showPhone" | "showCompany" | "showJobTitle" | "showWebsite" | "showLocation";
type Field = { key: FieldKey; icon: IconName; title: string; sub: string };

const SECTIONS: Record<string, { title: string; heading: string; sub: string; fields: Field[] }> = {
  contact: {
    title: "Contact Information",
    heading: "Contact details",
    sub: "Choose what contact details other members can see.",
    fields: [
      { key: "showEmail", icon: "mail-outline", title: "Show Email Address", sub: "Visible to members only" },
      { key: "showPhone", icon: "call-outline", title: "Show Phone Number", sub: "Visible to members only" },
      { key: "showLocation", icon: "location-outline", title: "Location", sub: "Visible to members only" },
    ],
  },
  business: {
    title: "Business Information",
    heading: "Business details",
    sub: "Choose what business details other members can see.",
    fields: [
      { key: "showCompany", icon: "business-outline", title: "Show Company Name", sub: "Visible to everyone" },
      { key: "showJobTitle", icon: "briefcase-outline", title: "Show Job Title", sub: "Visible to everyone" },
      { key: "showWebsite", icon: "link-outline", title: "Website", sub: "Visible to everyone" },
    ],
  },
};

export default function PrivacyFieldsScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const cfg = SECTIONS[section ?? ""] ?? SECTIONS.contact;
  const { privacy } = useSettings();
  const [draft, setDraft] = useState<Pick<PrivacySettings, FieldKey>>(privacy);

  const save = () => {
    updatePrivacy(draft);
    Alert.alert("Privacy updated", "Your settings have been saved.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SettingsScreen title={cfg.title} right={<HeaderSave onPress={save} />}>
      <SectionHeading title={cfg.heading} sub={cfg.sub} />
      {cfg.fields.map((f) => (
        <ToggleRow key={f.key} icon={f.icon} title={f.title} sub={f.sub} value={draft[f.key]} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
      ))}
    </SettingsScreen>
  );
}
