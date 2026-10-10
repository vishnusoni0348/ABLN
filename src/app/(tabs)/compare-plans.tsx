import { ScreenHeader } from "@/components/member-ui";
import { Crown } from "@/components/membership-ui";
import { Colors, Fonts } from "@/constants/theme";
import { type Availability, COMPARISON, PLANS, type PlanKey, inr } from "@/data/membership";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Column order matches COMPARISON values.
const COLUMNS: { key: PlanKey; label: string }[] = [
  { key: "regular", label: "Regular" },
  { key: "premium", label: "Premium" },
  { key: "founding", label: "Founding" },
];

function ColumnIcon({ k }: { k: PlanKey }) {
  if (k === "regular") return <Ionicons name="person-outline" size={22} color={Colors.navy} />;
  if (k === "premium") return <Crown size={22} />;
  return <Ionicons name="diamond" size={20} color={Colors.navy} />;
}

function Cell({ v }: { v: Availability }) {
  if (v === "yes") return <Ionicons name="checkmark-circle" size={22} color={Colors.success} />;
  if (v === "limited") return <Text style={styles.limited}>Limited</Text>;
  return <Text style={styles.dash}>–</Text>;
}

export default function ComparePlans() {
  const insets = useSafeAreaInsets();
  const select = (plan: PlanKey) => router.push({ pathname: "/renew-membership", params: { plan, billing: "yearly" } });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Compare Plans" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <Text style={[styles.head, styles.benefitCol]}>Benefits</Text>
          {COLUMNS.map((c) => (
            <View key={c.key} style={[styles.col, c.key === "premium" && styles.hl, styles.headCol]}>
              <ColumnIcon k={c.key} />
              <Text style={styles.colLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {COMPARISON.map((r) => (
          <View key={r.benefit} style={styles.row}>
            <Text style={[styles.benefit, styles.benefitCol]}>{r.benefit}</Text>
            {r.values.map((v, i) => (
              <View key={COLUMNS[i].key} style={[styles.col, COLUMNS[i].key === "premium" && styles.hl, styles.cell]}>
                <Cell v={v} />
              </View>
            ))}
          </View>
        ))}

        <View style={[styles.row, styles.footRow]}>
          <View style={styles.benefitCol} />
          {COLUMNS.map((c) => {
            const plan = PLANS.find((p) => p.key === c.key)!;
            return (
              <View key={c.key} style={[styles.col, c.key === "premium" && styles.hl, styles.foot]}>
                <Text style={styles.price}>{inr(plan.yearly)}</Text>
                <Pressable
                  onPress={() => select(c.key)}
                  style={({ pressed }) => [styles.btn, c.key === "premium" && styles.btnGold, c.key === "founding" && styles.btnNavy, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${c.label}`}
                >
                  <Text style={[styles.btnText, c.key === "founding" && { color: Colors.white }]}>Select</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  scroll: { paddingTop: 8 },
  row: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E4E9F0" },
  benefitCol: { flex: 1, paddingLeft: 16, paddingRight: 6, justifyContent: "center" },
  head: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  benefit: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  col: { width: 62, alignItems: "center", justifyContent: "center" },
  hl: { backgroundColor: "#FDF6E3" },
  headCol: { paddingVertical: 14, gap: 4 },
  colLabel: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 10 },
  cell: { height: 52 },
  limited: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  dash: { color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 16 },
  footRow: { borderBottomWidth: 0 },
  foot: { paddingVertical: 14, gap: 8 },
  price: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 11 },
  btn: { width: 54, height: 32, borderRadius: 6, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  btnGold: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  btnNavy: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  btnText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 11 },
});
