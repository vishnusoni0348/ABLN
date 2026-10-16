import { HeaderSave, InfoBanner, RadioCard, SectionHeading, SettingsScreen, ToggleRow } from "@/components/settings-ui";
import { ProfileVisibility, updatePrivacy, useSettings } from "@/lib/profile-store";
import type { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Alert, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const VISIBILITY_CHOICES: { key: ProfileVisibility; icon: IconName; title: string; sub: string }[] = [
  { key: "public", icon: "globe-outline", title: "Public", sub: "Anyone on ABLN can view this." },
  { key: "members", icon: "people-outline", title: "Members Only", sub: "Only ABLN members can view this." },
  { key: "connections", icon: "business-outline", title: "My Connections Only", sub: "Only your direct connections can view this." },
  { key: "private", icon: "lock-closed-outline", title: "Private", sub: "Only you can view this." },
];

export default function ProfileVisibilityScreen() {
  const { privacy } = useSettings();
  const [visibility, setVisibility] = useState(privacy.visibility);
  const [showInSearch, setShowInSearch] = useState(privacy.showInSearch);

  const save = () => {
    updatePrivacy({ visibility, showInSearch });
    Alert.alert("Privacy updated", "Your profile visibility has been saved.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SettingsScreen title="Profile Visibility" right={<HeaderSave onPress={save} />}>
      <SectionHeading title="Who can see your profile?" sub="Choose who can view your profile on ABLN." />
      {VISIBILITY_CHOICES.map((o) => (
        <RadioCard key={o.key} icon={o.icon} title={o.title} sub={o.sub} on={visibility === o.key} onPress={() => setVisibility(o.key)} />
      ))}

      <View style={{ marginTop: 10 }}>
        <SectionHeading title="Search Visibility" sub="Allow your profile to appear in search results on ABLN." />
      </View>
      <ToggleRow icon="search-outline" title="Show in Search Results" sub="Let members find you by name or company" value={showInSearch} onChange={setShowInSearch} />
      <InfoBanner>Even when your profile is limited, your name may still appear in places like event attendees, comments, or mutual connections.</InfoBanner>
    </SettingsScreen>
  );
}
