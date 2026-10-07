import { BusinessCardView } from "@/components/business-card";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { cardLink, useBusinessCard } from "@/lib/card-store";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Opt = { icon: keyof typeof Ionicons.glyphMap; label: string; bg: string; color?: string; onPress: () => void };

export default function ShareCard() {
  const insets = useSafeAreaInsets();
  const card = useBusinessCard();
  const link = cardLink(card);
  const msg = `Connect with ${card.name} (${card.role}, ${card.company}) on ABLN: ${link}`;

  const openUrl = (url: string) => Linking.openURL(url).catch(() => Alert.alert("Not available", "This app is not installed on your device."));
  const systemShare = () => Share.share({ message: msg });

  const opts: Opt[] = [
    { icon: "logo-whatsapp", label: "WhatsApp", bg: "#25D366", onPress: () => openUrl(`https://wa.me/?text=${encodeURIComponent(msg)}`) },
    { icon: "logo-linkedin", label: "LinkedIn", bg: "#0A66C2", onPress: () => WebBrowser.openBrowserAsync(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`) },
    { icon: "mail-outline", label: "Email", bg: "#EF5350", onPress: () => openUrl(`mailto:?subject=${encodeURIComponent(`${card.name} on ABLN`)}&body=${encodeURIComponent(msg)}`) },
    {
      icon: "link-outline",
      label: "Copy Link",
      bg: "#6B7A90",
      onPress: async () => {
        await Clipboard.setStringAsync(link);
        Alert.alert("Link copied", "Your business card link is copied.");
      },
    },
    { icon: "qr-code-outline", label: "Share QR Code", bg: "#E6ECF8", color: Colors.royalNavy, onPress: () => router.push("/card-qr") },
    { icon: "ellipsis-horizontal", label: "More", bg: "#EEF1F5", color: Colors.navy, onPress: systemShare },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Share Business Card" />
        <BusinessCardView card={card} compact />

        <Text style={styles.h}>Share via</Text>
        <View style={styles.grid}>
          {opts.map((o) => (
            <Pressable key={o.label} onPress={o.onPress} style={styles.opt} accessibilityRole="button">
              <View style={[styles.circle, { backgroundColor: o.bg }]}>
                <Ionicons name={o.icon} size={22} color={o.color ?? Colors.white} />
              </View>
              <Text style={styles.optText}>{o.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <Ionicons name="bulb-outline" size={20} color={Colors.goldDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.benefitTitle}>Share Benefits</Text>
            <Text style={styles.benefitText}>Let others easily view your profile, connect and explore collaboration opportunities.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, gap: 16 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17, marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 18 },
  opt: { width: "33.33%", alignItems: "center", gap: 8 },
  circle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  optText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  benefit: { flexDirection: "row", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: "#EAF1FB" },
  benefitIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  benefitTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  benefitText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 2 },
});
