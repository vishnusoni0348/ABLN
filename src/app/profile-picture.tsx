import { Avatar } from "@/components/member-ui";
import { HeaderSave, InfoBanner, SectionHeading, SettingsScreen, ToggleRow } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { updatePrivacy, useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

function PreviewCard({ label, tone, hidden }: { label: string; tone: "green" | "gold"; hidden: boolean }) {
  const { profile: p } = useSettings();
  const green = tone === "green";
  return (
    <View style={styles.card}>
      <View style={[styles.tag, { backgroundColor: green ? "#E6F6EF" : "#FBF1D6" }]}>
        <Text style={[styles.tagText, { color: green ? Colors.success : Colors.goldDark }]}>{label}</Text>
      </View>
      <View>
        <Avatar name={p.name} photo={hidden ? undefined : p.photo} size={96} />
        <View style={styles.verified}>
          <Ionicons name="checkmark" size={12} color={Colors.white} />
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
      <Text style={styles.meta} numberOfLines={1}>{p.designation}</Text>
      <Text style={styles.meta} numberOfLines={1}>{p.company}</Text>
    </View>
  );
}

export default function ProfilePictureScreen() {
  const { privacy } = useSettings();
  const [hidden, setHidden] = useState(privacy.hideProfilePicture);

  const save = () => {
    updatePrivacy({ hideProfilePicture: hidden });
    Alert.alert("Privacy updated", "Your profile picture setting has been saved.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SettingsScreen title="Profile Picture" right={<HeaderSave onPress={save} />}>
      <InfoBanner>You can hide your profile picture from other members. Your name and other details will still be visible.</InfoBanner>
      <ToggleRow icon="eye-off-outline" title="Hide Profile Picture" sub="Hidden from other members across ABLN" value={hidden} onChange={setHidden} />

      <View style={{ marginTop: 6 }}>
        <SectionHeading title="Preview" sub="This is how your profile will appear to others." />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <PreviewCard label="Visible" tone="green" hidden={false} />
        <PreviewCard label="Hidden" tone="gold" hidden />
      </View>
      <InfoBanner title="Note">When hidden, other members will see your initials instead of your profile picture.</InfoBanner>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: "center", gap: 6, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: "#EEF1F5" },
  tag: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 6 },
  tagText: { fontFamily: Fonts.semiBold, fontSize: 12 },
  verified: { position: "absolute", right: 0, bottom: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: "#2F6FED", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.white },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 4 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
});
