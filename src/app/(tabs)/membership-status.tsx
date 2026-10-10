import { ScreenHeader } from "@/components/member-ui";
import { MemberCard } from "@/components/membership-ui";
import { GoldButton } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CURRENT_MEMBER } from "@/data/membership";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Placeholder address until the real support contact is defined.
const SUPPORT_EMAIL = "mailto:support@abln.in";

const TIMELINE: { icon: IconName; bg: string; fg: string; title: string; date?: string; text: string }[] = [
  { icon: "checkmark", bg: Colors.success, fg: Colors.white, title: "Membership Active", date: CURRENT_MEMBER.since, text: "Successfully upgraded to Premium Membership" },
  { icon: "calendar-outline", bg: "#E4EAF6", fg: Colors.navy, title: "Renewal Date", date: CURRENT_MEMBER.validTill, text: "Your membership will be renewed on this date" },
  { icon: "notifications", bg: "#FDF0D2", fg: Colors.goldDark, title: "Reminder", text: "We will notify you 30 days before renewal" },
];

export default function MembershipStatus() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Membership Status" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <MemberCard status />

        <Text style={styles.section}>Membership Timeline</Text>
        <View>
          {TIMELINE.map((t, i) => (
            <View key={t.title} style={styles.item}>
              <View style={styles.rail}>
                <View style={[styles.node, { backgroundColor: t.bg }]}>
                  <Ionicons name={t.icon} size={18} color={t.fg} />
                </View>
                {i < TIMELINE.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={[styles.flex, i < TIMELINE.length - 1 && styles.itemGap]}>
                <Text style={styles.itemTitle}>{t.title}</Text>
                {t.date ? <Text style={styles.itemDate}>{t.date}</Text> : null}
                <Text style={styles.itemText}>{t.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <GoldButton label="Manage Membership" onPress={() => router.push("/renew-membership")} />

        <Pressable onPress={() => Linking.openURL(SUPPORT_EMAIL)} style={({ pressed }) => [styles.help, pressed && { opacity: 0.85 }]} accessibilityRole="button" accessibilityLabel="Contact support">
          <View style={styles.helpIcon}>
            <Ionicons name="headset-outline" size={22} color={Colors.navy} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>Contact our support team for any membership related queries.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.navy} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  section: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17, marginTop: 4 },
  item: { flexDirection: "row", gap: 12 },
  itemGap: { paddingBottom: 18 },
  rail: { alignItems: "center" },
  node: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  line: { flex: 1, width: 1.5, marginVertical: 2, backgroundColor: "#D5DCE6" },
  itemTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  itemDate: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12, marginTop: 2 },
  itemText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
  help: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: "#F3F5F9" },
  helpIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  helpTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  helpText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
