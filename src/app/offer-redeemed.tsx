import { ScreenHeader } from "@/components/member-ui";
import { Cta, OfferSummary } from "@/components/partner-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PARTNERS } from "@/data/partners";
import { usePartners } from "@/lib/partner-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const CONFETTI = [
  { top: 18, left: 18, color: "#F08A1C" }, { top: 52, left: 52, color: "#22A06B" }, { top: 10, left: 96, color: "#D4A72C" }, { top: 70, left: 12, color: "#2F6FDE" },
  { top: 18, right: 18, color: "#F08A1C" }, { top: 52, right: 52, color: "#22A06B" }, { top: 10, right: 96, color: "#6D4BD8" }, { top: 70, right: 12, color: "#D4A72C" },
];

function formatWhen(ts: number) {
  const d = new Date(ts);
  const date = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
  return `${date}, ${d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
}

function Row({ icon, label, children }: { icon: IconName; label: string; children: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={Colors.navy} />
      <View style={styles.flex}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{children}</Text>
      </View>
    </View>
  );
}

export default function OfferRedeemed() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { redemptions } = usePartners();

  const p = PARTNERS.find((x) => x.id === id);
  const r = redemptions.find((x) => x.partnerId === id);
  if (!p || !r) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <StatusBar style="dark" />
        <ScreenHeader title="Offer Redeemed" />
        <Text style={styles.none}>No redeemed offer found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Offer Redeemed" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.celebrate}>
          {CONFETTI.map((c, i) => (
            <View key={i} style={[styles.dot, c, { backgroundColor: c.color }]} />
          ))}
          <View style={styles.tick}>
            <Ionicons name="checkmark" size={48} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.title}>Offer Successfully Redeemed!</Text>
        <Text style={styles.sub}>{`You have successfully redeemed the offer from ${p.name}.`}</Text>

        <View style={styles.card}>
          <OfferSummary p={p} />
        </View>

        <View style={styles.details}>
          <Row icon="calendar-outline" label="Redeemed On">
            {formatWhen(r.redeemedAt)}
          </Row>
          <Row icon="pricetag-outline" label="Redemption Method">
            {r.method}
          </Row>
          <Row icon="barcode-outline" label="Offer Code">
            {r.code}
          </Row>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <View style={styles.flex}>
              <Text style={styles.rowLabel}>Status</Text>
              <View style={styles.status}>
                <Text style={styles.statusText}>Redeemed</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Cta label="View Partner Details" onPress={() => router.navigate({ pathname: "/partner-details", params: { id: p.id } })} variant="outline" />
        <Cta label="Explore More Offers" onPress={() => router.navigate("/partners")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  top: { paddingHorizontal: 16 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 12 },

  celebrate: { height: 130, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", width: 7, height: 7, borderRadius: 2 },
  tick: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center", borderWidth: 6, borderColor: "#BFE9D3" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, textAlign: "center" },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center", paddingHorizontal: 24 },

  card: { padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", marginTop: 6 },
  details: { padding: 14, gap: 16, borderRadius: Radius.md, backgroundColor: "#F1FAF5" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  rowValue: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13, marginTop: 2 },
  status: { alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: "#D5F0E1" },
  statusText: { color: Colors.success, fontFamily: Fonts.semiBold, fontSize: 11 },

  footer: { paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
