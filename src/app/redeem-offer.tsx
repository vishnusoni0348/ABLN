import { ScreenHeader } from "@/components/member-ui";
import { Cta, OfferSummary, completeRedemption } from "@/components/partner-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PARTNERS } from "@/data/partners";
import { type RedeemMethod } from "@/lib/partner-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const METHODS: { method: RedeemMethod; icon: IconName; title: string; note: string }[] = [
  { method: "Offer Code", icon: "pricetag", title: "Use Offer Code", note: "Show or copy the code at partner during booking." },
  { method: "QR Code", icon: "qr-code-outline", title: "Show QR Code", note: "Generate QR code to show at partner location." },
  { method: "Manual Verification", icon: "document-text-outline", title: "Manual Verification", note: "Verify using your membership ID at partner location." },
];

export default function RedeemOffer() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [method, setMethod] = useState<RedeemMethod>("Offer Code");

  const p = PARTNERS.find((x) => x.id === id);
  if (!p) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <StatusBar style="dark" />
        <ScreenHeader title="Redeem Offer" />
        <Text style={styles.none}>This offer is no longer available.</Text>
      </View>
    );
  }

  const next = () => {
    if (method === "Offer Code") router.push({ pathname: "/offer-code", params: { id: p.id } });
    else if (method === "QR Code") router.push({ pathname: "/offer-qr", params: { id: p.id } });
    else completeRedemption(p, method);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Redeem Offer" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <OfferSummary p={p} />
        <Text style={styles.heading}>Choose Redemption Method</Text>
        {METHODS.map((m) => {
          const on = m.method === method;
          return (
            <Pressable key={m.method} onPress={() => setMethod(m.method)} style={[styles.option, on && styles.optionOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <View style={[styles.icon, m.method === "Offer Code" && styles.iconDark]}>
                <Ionicons name={m.icon} size={22} color={m.method === "Offer Code" ? Colors.white : Colors.navy} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.title}>{m.title}</Text>
                <Text style={styles.note}>{m.note}</Text>
              </View>
              {on ? (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Cta label="Continue" onPress={next} />
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
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 10 },

  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white },
  optionOn: { borderColor: Colors.gold, backgroundColor: "#FFFBF2" },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF2FA", alignItems: "center", justifyContent: "center" },
  iconDark: { backgroundColor: Colors.navy },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  note: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },

  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
