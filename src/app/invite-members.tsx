import { CARD_SHADOW } from "@/components/member-ui";
import { SettingsScreen, SOFT_GOLD } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { shareEmail, shareMore, shareWhatsApp, useInviteInfo } from "@/lib/invite-share";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function InviteMembers() {
  const { message } = useInviteInfo();

  return (
    <SettingsScreen title="Invite Members">
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Invite Members</Text>
        <Text style={styles.sub}>Grow the ABLN network by inviting business leaders, experts and entrepreneurs.</Text>
      </View>
      <Image source={require("../../assets/images/invite-hero.png")} style={styles.hero} contentFit="contain" accessibilityLabel="Invite business leaders to ABLN" />

      <Option icon="people-outline" gold title="Invite from Contacts" sub="Select and invite from your phone contacts." onPress={() => router.push("/invite-contacts")} />
      <Option icon="link-outline" title="Share Invite Link" sub="Share your unique invite link with anyone." onPress={() => router.push("/share-invite-link")} />

      <Text style={styles.section}>Other Ways to Invite</Text>
      <View style={styles.ways}>
        <Way icon="logo-whatsapp" color="#25D366" label="WhatsApp" onPress={() => shareWhatsApp(message)} />
        <Way icon="mail-outline" label="Email" onPress={() => shareEmail(message)} />
        <Way icon="share-social-outline" label={"More\nOptions"} onPress={() => shareMore(message)} />
        <Way icon="qr-code-outline" label="QR Code" onPress={() => router.push("/invite-qr")} />
      </View>

      <Pressable onPress={() => router.push("/invitation-status")} accessibilityRole="button" style={styles.statusLink}>
        <Text style={styles.statusLinkText}>View Invitation Status</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.goldDark} />
      </Pressable>
    </SettingsScreen>
  );
}

function Option({ icon, title, sub, gold, onPress }: { icon: IconName; title: string; sub: string; gold?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.option, pressed && { opacity: 0.85 }]}>
      <View style={[styles.optionIcon, gold && { backgroundColor: Colors.gold }]}>
        <Ionicons name={icon} size={24} color={gold ? Colors.white : Colors.navy} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.navy} />
    </Pressable>
  );
}

function Way({ icon, label, color = Colors.navy, onPress }: { icon: IconName; label: string; color?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label.replace("\n", " ")} style={({ pressed }) => [styles.way, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={28} color={color} />
      <Text style={styles.wayText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleBlock: { alignItems: "center", gap: 6, paddingHorizontal: 8 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, textAlign: "center" },
  hero: { width: "100%", height: 210 },
  option: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  optionIcon: { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: "#EEF2FA", alignItems: "center", justifyContent: "center" },
  optionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  optionSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
  section: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 4 },
  ways: { flexDirection: "row", gap: 10 },
  way: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, minHeight: 92, paddingHorizontal: 4, borderRadius: Radius.md, backgroundColor: Colors.white, ...CARD_SHADOW },
  wayText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12, textAlign: "center", lineHeight: 16 },
  statusLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 16, backgroundColor: SOFT_GOLD, borderRadius: Radius.md },
  statusLinkText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
});
