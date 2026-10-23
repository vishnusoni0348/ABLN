import { QrCode } from "@/components/qr-code";
import { GoldButton, OutlineBtn, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { shareMore, useCopied, useInviteInfo } from "@/lib/invite-share";
import { StyleSheet, Text, View } from "react-native";

export default function InviteQr() {
  const { code, url, message } = useInviteInfo();
  const { copied, copy } = useCopied<"link">();

  return (
    <SettingsScreen title="Invite QR Code" footer={<GoldButton label="Share Invite" onPress={() => shareMore(message)} />}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Scan to join ABLN</Text>
        <Text style={styles.sub}>Ask them to scan this code with their phone camera.</Text>
      </View>
      <View style={styles.card}>
        <QrCode value={url} size={220} />
        <Text style={styles.code}>{code}</Text>
      </View>
      <OutlineBtn label={copied ? "Link Copied" : "Copy Link"} icon={copied ? "checkmark" : "copy-outline"} onPress={() => copy("link", url)} />
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  titleBlock: { alignItems: "center", gap: 6, paddingHorizontal: 8 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center" },
  card: { alignItems: "center", gap: 14, padding: 24, borderRadius: Radius.xl, backgroundColor: Colors.white, alignSelf: "center" },
  code: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, letterSpacing: 1 },
});
