import { ScreenHeader } from "@/components/member-ui";
import { Crown } from "@/components/membership-ui";
import { GoldButton } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { type Billing, PLANS, type Plan, inr, planPrice } from "@/data/membership";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function PlanIcon({ k }: { k: Plan["key"] }) {
  if (k === "regular") return <Ionicons name="person-outline" size={24} color={Colors.goldDark} />;
  if (k === "founding") return <Ionicons name="diamond" size={22} color={Colors.gold} />;
  return <Crown size={24} />;
}

function PlanCard({ p, billing }: { p: Plan; billing: Billing }) {
  const go = () => router.push({ pathname: "/renew-membership", params: { plan: p.key, billing } });
  const founding = p.key === "founding";
  return (
    <View style={[styles.card, p.tag && styles.cardGold]}>
      {p.tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{p.tag}</Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <PlanIcon k={p.key} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.planName}>{p.name}</Text>
          <Text style={styles.blurb}>{p.blurb}</Text>
        </View>
      </View>
      <Text style={styles.price}>
        {inr(planPrice(p, billing))}
        <Text style={styles.per}>{billing === "yearly" ? " / year" : " / month"}</Text>
      </Text>
      <Pressable onPress={go} style={({ pressed }) => [founding ? styles.navyBtn : styles.outlineBtn, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Select ${p.name}`}>
        <Text style={founding ? styles.navyText : styles.outlineText}>Select Plan</Text>
      </Pressable>
    </View>
  );
}

export default function ChoosePlan() {
  const insets = useSafeAreaInsets();
  const [billing, setBilling] = useState<Billing>("yearly");

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Membership Plans" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{"Choose the Plan That\nFits Your Business Goals"}</Text>
        <Text style={styles.sub}>Unlock exclusive benefits, build valuable connections and grow with ABLN.</Text>

        <View style={styles.toggle}>
          <Pressable onPress={() => setBilling("monthly")} style={[styles.toggleItem, billing === "monthly" && styles.toggleOn]} accessibilityRole="button" accessibilityState={{ selected: billing === "monthly" }}>
            <Text style={[styles.toggleText, billing === "monthly" && styles.toggleTextOn]}>Monthly</Text>
          </Pressable>
          <Pressable onPress={() => setBilling("yearly")} style={[styles.toggleItem, billing === "yearly" && styles.toggleOn]} accessibilityRole="button" accessibilityState={{ selected: billing === "yearly" }}>
            <Text style={[styles.toggleText, billing === "yearly" && styles.toggleTextOn]}>Yearly</Text>
            <View style={styles.save}>
              <Text style={styles.saveText}>Save 20%</Text>
            </View>
          </Pressable>
        </View>

        {PLANS.map((p) => (
          <PlanCard key={p.key} p={p} billing={billing} />
        ))}

        <GoldButton label="Compare Plans" onPress={() => router.push("/compare-plans")} />
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
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, lineHeight: 28 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  toggle: { flexDirection: "row", padding: 3, borderRadius: Radius.md, backgroundColor: "#F3F5F9" },
  toggleItem: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1.5, borderColor: "transparent", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  toggleOn: { backgroundColor: Colors.white, borderColor: Colors.champagne },
  toggleText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 14 },
  toggleTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  save: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: "#FDF0D2" },
  saveText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 11 },
  card: { padding: 16, gap: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: "#E4E9F0", backgroundColor: Colors.white, overflow: "hidden" },
  cardGold: { borderColor: Colors.champagne },
  tag: { position: "absolute", top: 0, right: 0, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 10, backgroundColor: Colors.champagne },
  tagText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 11 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 6 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  planName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  blurb: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  price: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  per: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  navyBtn: { height: 46, borderRadius: Radius.sm, backgroundColor: Colors.navy, alignItems: "center", justifyContent: "center" },
  navyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  outlineBtn: { height: 46, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.navy, alignItems: "center", justifyContent: "center" },
  outlineText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
});
