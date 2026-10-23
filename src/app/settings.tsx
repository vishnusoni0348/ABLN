import { Avatar, CARD_SHADOW } from "@/components/member-ui";
import { MenuRow, OutlineBtn, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function Settings() {
  const { profile: p, blocked } = useSettings();

  const logOut = () =>
    Alert.alert("Log out?", "You will need to sign in again to access your account.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => router.replace("/login") },
    ]);

  return (
    <SettingsScreen title="Settings">
      <Pressable onPress={() => router.push("/my-profile")} accessibilityRole="button" style={styles.profile}>
        <Avatar name={p.name} photo={p.photo} size={64} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{p.name}</Text>
          <View style={styles.plan}>
            <Ionicons name="ribbon" size={13} color={Colors.goldDark} />
            <Text style={styles.planText}>{p.plan}</Text>
          </View>
          <Text style={styles.id}>{p.memberId}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </Pressable>

      <MenuRow icon="people-outline" title="Profile & Visibility" sub="Manage your profile and privacy" onPress={() => router.push("/privacy-settings")} />
      <MenuRow icon="notifications-outline" title="Notification Preferences" sub="Control your notifications" onPress={() => router.push("/notification-preferences")} />
      <MenuRow icon="bookmark-outline" title="Saved" sub="Your saved opportunities, events and members" onPress={() => router.push("/saved")} />
      <MenuRow icon="ban-outline" title="Blocked Members" sub={blocked.length ? `${blocked.length} blocked` : "Manage blocked users"} onPress={() => router.push("/blocked-members")} />
      <MenuRow icon="settings-outline" title="Account Settings" sub="Update email, password etc." onPress={() => router.push("/account-settings")} />

      <Text style={styles.support}>REFER & FEEDBACK</Text>
      <MenuRow icon="person-add-outline" title="Invite Members" sub="Share your invite link and referral code" onPress={() => router.push("/invite-members")} />
      <MenuRow icon="star-outline" title="Rate & Feedback" sub="Tell us about your experience" onPress={() => router.push("/feedback")} />

      <Text style={styles.support}>SUPPORT</Text>
      <MenuRow icon="headset-outline" title="Help & Support" sub="Get help or contact support" onPress={() => router.push("/help-support")} />
      <MenuRow icon="help-circle-outline" title="FAQ" sub="Find answers to common questions" onPress={() => router.push("/faq-categories")} />
      <MenuRow icon="document-text-outline" title="Terms & Conditions" sub="Read our terms of use" onPress={() => router.push("/terms-conditions")} />
      <MenuRow icon="shield-checkmark-outline" title="Privacy Policy" sub="How we protect your data" onPress={() => router.push("/privacy-policy")} />
      <MenuRow icon="information-circle-outline" title="About ABLN" sub="Mission, version and contact" onPress={() => router.push("/about")} />

      <View style={{ marginTop: 6, gap: 10 }}>
        <OutlineBtn label="Log Out" icon="log-out-outline" color={Colors.goldDark} onPress={logOut} />
        <Pressable onPress={() => router.push("/deactivate-account")} hitSlop={8} accessibilityRole="button">
          <Text style={styles.deactivate}>Deactivate Account</Text>
        </Pressable>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, backgroundColor: "#FEF6E6", ...CARD_SHADOW },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  plan: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  planText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  id: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  support: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 12, letterSpacing: 1, marginTop: 8 },
  deactivate: { textAlign: "center", color: Colors.error, fontFamily: Fonts.semiBold, fontSize: 13 },
});
