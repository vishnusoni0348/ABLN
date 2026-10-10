import { ScreenHeader } from "@/components/member-ui";
import { QrCode } from "@/components/qr-code";
import { Cta, OfferSummary, PartnerLogo, completeRedemption } from "@/components/partner-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { MEMBERSHIP_ID, PARTNERS } from "@/data/partners";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NOTES = ["Valid only for current ABLN members", "One time use per booking", "Show a valid ID if required"];

export default function OfferQr() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const p = PARTNERS.find((x) => x.id === id);
  if (!p) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <StatusBar style="dark" />
        <ScreenHeader title="Show QR Code" />
        <Text style={styles.none}>This offer is no longer available.</Text>
      </View>
    );
  }

  const copy = async () => {
    await Clipboard.setStringAsync(MEMBERSHIP_ID);
    setCopied(true);
  };
  const done = () => {
    completeRedemption(p, "QR Code");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Show QR Code" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <OfferSummary p={p} />

        <View style={styles.qrWrap}>
          <View style={styles.qrFrame}>
            <QrCode value={`ABLN|${MEMBERSHIP_ID}|${p.offer.code}`} size={200} />
            <View style={styles.qrLogo}>
              <PartnerLogo p={p} size={44} />
            </View>
          </View>
        </View>
        <View style={styles.hint}>
          <Text style={styles.hintText}>Show this QR code at the partner location to avail your offer.</Text>
        </View>

        <View style={styles.idRow}>
          <Ionicons name="id-card-outline" size={26} color={Colors.navy} />
          <View style={styles.flex}>
            <Text style={styles.idLabel}>Your Membership ID</Text>
            <Text style={styles.idValue}>{MEMBERSHIP_ID}</Text>
          </View>
          <Pressable onPress={copy} hitSlop={10} accessibilityRole="button" accessibilityLabel="Copy membership ID">
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={22} color={copied ? Colors.success : Colors.navy} />
          </Pressable>
        </View>

        <View style={styles.important}>
          <View style={styles.importantHead}>
            <Ionicons name="help-circle" size={20} color={Colors.goldDark} />
            <Text style={styles.importantTitle}>Important</Text>
          </View>
          {NOTES.map((n) => (
            <Text key={n} style={styles.note}>{`•  ${n}`}</Text>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Cta label="Done" onPress={done} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  top: { paddingHorizontal: 16 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 },

  qrWrap: { alignItems: "center", marginTop: 6 },
  qrFrame: { padding: 16, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.gold, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  qrLogo: { position: "absolute", padding: 4, borderRadius: 10, backgroundColor: Colors.white },
  hint: { padding: 12, borderRadius: Radius.sm, backgroundColor: "#FDF0D2" },
  hintText: { color: Colors.goldDark, fontFamily: Fonts.medium, fontSize: 12, lineHeight: 18, textAlign: "center" },

  idRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: "#F5F7FC" },
  idLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  idValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 2 },

  important: { gap: 6 },
  importantHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  importantTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  note: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },

  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
