import { PillTabs } from "@/components/event-ui";
import { ScreenHeader } from "@/components/member-ui";
import { PartnerLogo, PartnerRow } from "@/components/partner-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PARTNERS } from "@/data/partners";
import { usePartners } from "@/lib/partner-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = ["Redeemed", "Saved"] as const;
type Tab = (typeof TABS)[number];

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
};

export default function MyRedemptions() {
  const insets = useSafeAreaInsets();
  const { redemptions, favourites } = usePartners();
  const [tab, setTab] = useState<Tab>("Redeemed");

  const redeemed = redemptions.flatMap((r) => {
    const p = PARTNERS.find((x) => x.id === r.partnerId);
    return p ? [{ r, p }] : [];
  });
  const saved = PARTNERS.filter((p) => favourites.includes(p.id));
  const labels = { Redeemed: `Redeemed (${redeemed.length})`, Saved: `Saved (${saved.length})` };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="My Offers" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]} showsVerticalScrollIndicator={false}>
        <PillTabs options={TABS} selected={tab} onSelect={setTab} labels={labels} />

        {tab === "Redeemed" ? (
          redeemed.length ? (
            redeemed.map(({ r, p }) => (
              <Pressable key={p.id} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/offer-redeemed", params: { id: p.id } })} accessibilityRole="button" accessibilityLabel={p.name}>
                <PartnerLogo p={p} size={48} />
                <View style={styles.flex}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>{`${p.offer.label} ${p.offer.on}`}</Text>
                  <Text style={styles.sub}>{`${r.method} · ${formatDate(r.redeemedAt)}`}</Text>
                </View>
                <View style={styles.status}>
                  <Text style={styles.statusText}>Redeemed</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={styles.none}>You haven&apos;t redeemed any offers yet.</Text>
          )
        ) : saved.length ? (
          <View>
            {saved.map((p) => (
              <PartnerRow key={p.id} p={p} />
            ))}
          </View>
        ) : (
          <Text style={styles.none}>No saved offers. Tap the heart on a partner to save it.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5" },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  status: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: "#D5F0E1" },
  statusText: { color: Colors.success, fontFamily: Fonts.semiBold, fontSize: 10 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 32 },
});
