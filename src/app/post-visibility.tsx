import { HeaderSave, InfoBanner, RadioCard, SectionHeading, SettingsScreen } from "@/components/settings-ui";
import { updatePrivacy, useSettings } from "@/lib/profile-store";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { VISIBILITY_CHOICES } from "./profile-visibility";

export default function PostVisibilityScreen() {
  const { privacy } = useSettings();
  const [choice, setChoice] = useState(privacy.postVisibility);

  const save = () => {
    updatePrivacy({ postVisibility: choice });
    Alert.alert("Privacy updated", "Your post visibility has been saved.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SettingsScreen title="Post Visibility" right={<HeaderSave onPress={save} />}>
      <SectionHeading title="Who can see your posts?" sub="Choose who can view the posts you share on ABLN." />
      {VISIBILITY_CHOICES.map((o) => (
        <RadioCard key={o.key} icon={o.icon} title={o.title} sub={o.sub} on={choice === o.key} onPress={() => setChoice(o.key)} />
      ))}
      <InfoBanner>This applies to new and existing posts.</InfoBanner>
    </SettingsScreen>
  );
}
