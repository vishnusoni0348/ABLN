import { CARD_SHADOW } from "@/components/member-ui";
import { GoldButton, SettingsScreen, SOFT_GOLD } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { shareEmail, shareMore, shareWhatsApp, useCopied, useInviteInfo } from "@/lib/invite-share";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function ShareInviteLink() {
  const { code, link, url, message } = useInviteInfo();
  const { copied, copy } = useCopied<"link" | "code">();

  return (
    <SettingsScreen title="Share Invite Link" footer={<GoldButton label="View Invitation Status" onPress={() => router.push("/invitation-status")} />}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Share Invite Link</Text>
        <Text style={styles.sub}>Share your unique invite link and help grow the ABLN community.</Text>
      </View>

      <Image source={require("../../assets/images/invite-envelope.png")} style={styles.art} contentFit="contain" accessibilityLabel="You're invited to ABLN" />

      <View style={styles.linkCard}>
        <Text style={styles.label}>Your Invite Link</Text>
        <View style={styles.linkBox}>
          <Ionicons name="link" size={20} color={Colors.textSecondary} />
          <Text style={styles.linkText} numberOfLines={1} selectable>
            {link}
          </Text>
          <Pressable onPress={() => copy("link", url)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Copy invite link">
            <Ionicons name={copied === "link" ? "checkmark" : "copy-outline"} size={22} color={copied === "link" ? Colors.success : Colors.navy} />
          </Pressable>
        </View>
      </View>

      <GoldButton label={copied === "link" ? "Link Copied" : "Copy Link"} onPress={() => copy("link", url)} />

      <View style={styles.grid}>
        <Share icon="logo-whatsapp" color="#25D366" label={"Share via\nWhatsApp"} outlined onPress={() => shareWhatsApp(message)} />
        <Share icon="mail-outline" label={"Share via\nEmail"} outlined onPress={() => shareEmail(message)} />
        <Share icon="share-social-outline" label={"More\nOptions"} onPress={() => shareMore(message)} />
        <Share icon="qr-code-outline" label={"Share QR\nCode"} onPress={() => router.push("/invite-qr")} />
      </View>

      <Pressable onPress={() => copy("code", code)} accessibilityRole="button" accessibilityLabel={`Copy referral code ${code}`} style={styles.codeRow}>
        <Text style={styles.codeLabel}>Referral code</Text>
        <Text style={styles.code}>{code}</Text>
        <Ionicons name={copied === "code" ? "checkmark" : "copy-outline"} size={18} color={copied === "code" ? Colors.success : Colors.navy} />
      </Pressable>

      <View style={styles.tip}>
        <Ionicons name="ribbon" size={30} color={Colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Invite the right people</Text>
          <Text style={styles.tipText}>Connect with business leaders, experts and entrepreneurs to make ABLN stronger.</Text>
        </View>
      </View>
    </SettingsScreen>
  );
}

function Share({ icon, label, color = Colors.navy, outlined, onPress }: { icon: IconName; label: string; color?: string; outlined?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label.replace("\n", " ")}
      style={({ pressed }) => [styles.share, outlined ? styles.shareOutlined : styles.shareSoft, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name={icon} size={26} color={color} />
      <Text style={styles.shareText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleBlock: { alignItems: "center", gap: 6, paddingHorizontal: 8 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, textAlign: "center" },
  art: { width: "100%", height: 190 },
  linkCard: { backgroundColor: "#EEF2FA", borderRadius: Radius.lg, padding: 14, gap: 8 },
  label: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  linkBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.white, borderRadius: Radius.md, paddingHorizontal: 14, height: 50 },
  linkText: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  share: { width: "47.5%", flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 58, paddingHorizontal: 10, borderRadius: Radius.md },
  shareOutlined: { borderWidth: 1.5, borderColor: Colors.navy, backgroundColor: Colors.white },
  shareSoft: { backgroundColor: "#EEF2FA" },
  shareText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, lineHeight: 17 },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.white, borderRadius: Radius.md, paddingHorizontal: 14, height: 48, ...CARD_SHADOW },
  codeLabel: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  code: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, letterSpacing: 0.5 },
  tip: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: SOFT_GOLD },
  tipTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  tipText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 2 },
});
