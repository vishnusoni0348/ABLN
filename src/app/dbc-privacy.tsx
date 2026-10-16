import { HeaderSave, InfoBanner, IconCircle, SectionHeading, SettingsScreen, ToggleRow, Card } from "@/components/settings-ui";
import { Avatar } from "@/components/member-ui";
import { Colors, Fonts } from "@/constants/theme";
import { PrivacySettings, updatePrivacy, useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

type Key = "dbcShowMobile" | "dbcShowEmail" | "dbcShowChapter";

const FIELDS: { key: Key; icon: "call-outline" | "mail-outline" | "people-outline"; title: string; sub: string }[] = [
  { key: "dbcShowMobile", icon: "call-outline", title: "Mobile Number", sub: "Show your mobile number on your Digital Business Card." },
  { key: "dbcShowEmail", icon: "mail-outline", title: "Email Address", sub: "Show your email address on your Digital Business Card." },
  { key: "dbcShowChapter", icon: "people-outline", title: "Chapter Information", sub: "Show your chapter name and details on your Digital Business Card." },
];

export default function DbcPrivacyScreen() {
  const { privacy, profile } = useSettings();
  const [draft, setDraft] = useState<Pick<PrivacySettings, Key>>({
    dbcShowMobile: privacy.dbcShowMobile,
    dbcShowEmail: privacy.dbcShowEmail,
    dbcShowChapter: privacy.dbcShowChapter,
  });

  const save = () => {
    updatePrivacy(draft);
    Alert.alert("Privacy updated", "Your Digital Business Card settings have been saved.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SettingsScreen title="Digital Business Card" right={<HeaderSave onPress={save} />}>
      <View style={{ alignItems: "center", gap: 6, paddingVertical: 8 }}>
        <IconCircle icon="qr-code-outline" size={64} color={Colors.goldDark} />
        <Text style={{ color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginTop: 6 }}>Control What Others Can See</Text>
        <Text style={{ color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
          Choose which information will be visible on your Digital Business Card when shared with other members.
        </Text>
      </View>
      <SectionHeading title="Visible information" />
      {FIELDS.map((f) => (
        <ToggleRow key={f.key} icon={f.icon} title={f.title} sub={f.sub} value={draft[f.key]} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
      ))}
      <InfoBanner>These settings will only control the information visible on your Digital Business Card. Your overall profile visibility settings also apply.</InfoBanner>
      <Pressable onPress={() => router.push("/dbc-preview")} accessibilityRole="button">
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar name={profile.name} photo={profile.photo} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 }}>Preview Your Digital Business Card</Text>
            <Text style={{ color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 }}>See how your card will appear to others.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Card>
      </Pressable>
    </SettingsScreen>
  );
}
