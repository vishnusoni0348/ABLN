import { GoldButton, RadioCard, SectionHeading, SettingsScreen, ToggleRow } from "@/components/settings-ui";
import { Visibility } from "@/lib/card-store";
import { PrivacySettings, updatePrivacy, useSettings } from "@/lib/profile-store";
import type { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Alert, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const VISIBILITY: { key: Visibility; icon: IconName; title: string; sub: string }[] = [
  { key: "public", icon: "globe-outline", title: "Public", sub: "Visible to everyone on ABLN" },
  { key: "members", icon: "people-outline", title: "Members Only", sub: "Visible to ABLN members only" },
  { key: "private", icon: "lock-closed-outline", title: "Private", sub: "Only visible to your connections" },
];

type ToggleKey = Exclude<keyof PrivacySettings, "visibility">;
const CONTACT: { key: ToggleKey; icon: IconName; title: string; sub: string }[] = [
  { key: "showEmail", icon: "mail-outline", title: "Show Email Address", sub: "Visible to members only" },
  { key: "showPhone", icon: "call-outline", title: "Show Phone Number", sub: "Visible to members only" },
  { key: "showCompany", icon: "business-outline", title: "Show Company Name", sub: "Visible to everyone" },
  { key: "showJobTitle", icon: "briefcase-outline", title: "Show Job Title", sub: "Visible to everyone" },
  { key: "showWebsite", icon: "link-outline", title: "Website", sub: "Visible to everyone" },
  { key: "showLocation", icon: "location-outline", title: "Location", sub: "Visible to members only" },
];

export default function PrivacySettingsScreen() {
  const { privacy } = useSettings();
  const [draft, setDraft] = useState(privacy);

  const save = () => {
    updatePrivacy(draft);
    Alert.alert("Privacy updated", "Your visibility settings have been saved.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SettingsScreen title="Privacy Settings" footer={<GoldButton label="Save Changes" onPress={save} />}>
      <SectionHeading title="Profile Visibility" sub="Control who can see your profile information on ABLN." />
      {VISIBILITY.map((o) => (
        <RadioCard key={o.key} icon={o.icon} title={o.title} sub={o.sub} on={draft.visibility === o.key} onPress={() => setDraft((d) => ({ ...d, visibility: o.key }))} />
      ))}

      <View style={{ marginTop: 10 }}>
        <SectionHeading title="Contact Information Visibility" sub="Choose what contact details other members can see." />
      </View>
      {CONTACT.map((c) => (
        <ToggleRow key={c.key} icon={c.icon} title={c.title} sub={c.sub} value={draft[c.key]} onChange={(v) => setDraft((d) => ({ ...d, [c.key]: v }))} />
      ))}
    </SettingsScreen>
  );
}
