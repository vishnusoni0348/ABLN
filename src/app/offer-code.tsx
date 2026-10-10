import { ScreenHeader } from "@/components/member-ui";
import { Cta, OfferSummary, completeRedemption } from "@/components/partner-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PARTNERS } from "@/data/partners";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = ["Copy the offer code above", "Apply the code while booking on partner website or at hotel", "Show your ABLN Membership ID if required"];

export default function OfferCode() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const p = PARTNERS.find((x) => x.id === id);
  if (!p) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <StatusBar style="dark" />
        <ScreenHeader title="Your Offer Code" />
        <Text style={styles.none}>This offer is no longer available.</Text>
      </View>
    );
  }

  const copy = async () => {
    await Clipboard.setStringAsync(p.offer.code);
    setCopied(true);
  };
  const done = () => {
    completeRedemption(p, "Offer Code");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Your Offer Code" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <OfferSummary p={p} />

        <View style={styles.codeBox}>
          <View style={styles.flex}>
            <Text style={styles.codeLabel}>Your Partner Offer Code</Text>
            <Text style={styles.code} selectable>
              {p.offer.code}
            </Text>
          </View>
          <Pressable onPress={copy} hitSlop={10} style={styles.copy} accessibilityRole="button" accessibilityLabel="Copy code">
            <Ionicons name="copy-outline" size={22} color={Colors.navy} />
          </Pressable>
        </View>

        {copied ? (
          <View style={styles.copied} accessibilityLiveRegion="polite">
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.copiedText}>Code copied to clipboard!</Text>
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>How to Use</Text>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={styles.stepNo}>
                <Text style={styles.stepNoText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.panel, styles.help]}>
          <View style={styles.helpIcon}>
            <Ionicons name="headset-outline" size={22} color={Colors.navy} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.panelTitle}>Need Help?</Text>
            <Text style={styles.stepText}>Contact partner support or reach out to ABLN team for assistance.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Cta label="I've Used This Offer" onPress={done} variant="outline" />
        <Cta label="View Partner Details" onPress={() => router.push({ pathname: "/partner-details", params: { id: p.id } })} variant="navy" />
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

  codeBox: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginTop: 10 },
  codeLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, textAlign: "center" },
  code: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, letterSpacing: 1, textAlign: "center", marginTop: 4 },
  copy: { padding: 4 },
  copied: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, borderRadius: Radius.md, backgroundColor: "#E8F7EF" },
  copiedText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },

  panel: { padding: 16, borderRadius: Radius.md, backgroundColor: "#F5F7FC", gap: 12 },
  panelTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  step: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNo: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.goldDark, alignItems: "center", justifyContent: "center" },
  stepNoText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 11 },
  stepText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  help: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5" },
  helpIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF2FA", alignItems: "center", justifyContent: "center" },

  footer: { paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
