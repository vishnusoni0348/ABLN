import { IconCircle, MenuRow, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function PrivacySettingsScreen() {
  return (
    <SettingsScreen title="Privacy Settings">
      <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
        <IconCircle icon="shield-checkmark-outline" size={64} color={Colors.navy} />
        <Text style={{ color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, textAlign: "center" }}>
          Control who can see your profile and contact information on ABLN.
        </Text>
      </View>
      <MenuRow icon="people-outline" title="Profile Visibility" sub="Who can see your profile" onPress={() => router.push("/profile-visibility")} />
      <MenuRow icon="image-outline" title="Profile Picture" sub="Show or hide your profile picture" onPress={() => router.push("/profile-picture")} />
      <MenuRow icon="card-outline" title="Contact Information" sub="Manage visibility of your contact details" onPress={() => router.push({ pathname: "/privacy-fields", params: { section: "contact" } })} />
      <MenuRow icon="business-outline" title="Business Information" sub="Control visibility of your business details" onPress={() => router.push({ pathname: "/privacy-fields", params: { section: "business" } })} />
      <MenuRow icon="qr-code-outline" title="Digital Business Card" sub="Control what others can see on your DBC" onPress={() => router.push("/dbc-privacy")} />
      <MenuRow icon="stats-chart-outline" title="Post Visibility" sub="Control who can see your posts" onPress={() => router.push("/post-visibility")} />
    </SettingsScreen>
  );
}
