import { ScreenHeader } from "@/components/member-ui";
import { Crown } from "@/components/membership-ui";
import { GoldButton } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CURRENT_MEMBER, GST_RATE, type Billing, type PlanKey, inr, planByKey, planPrice, taxOf } from "@/data/membership";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RENEW_ORDER: PlanKey[] = ["premium", "regular", "founding"];

function PlanIcon({ k }: { k: PlanKey }) {
  if (k === "regular") return <Ionicons name="person-outline" size={22} color={Colors.navy} />;
  if (k === "founding") return <Ionicons name="diamond" size={20} color={Colors.gold} />;
  return <Crown size={24} />;
}

export default function RenewMembership() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ plan?: string; billing?: string }>();
  const billing: Billing = params.billing === "monthly" ? "monthly" : "yearly";
  const [selected, setSelected] = useState<PlanKey>((planByKey(params.plan) ?? planByKey(CURRENT_MEMBER.plan))!.key);

  const plan = planByKey(selected)!;
  const amount = planPrice(plan, billing);
  const tax = taxOf(amount);
  const total = amount + tax;
  const term = billing === "yearly" ? "1 Year" : "1 Month";

  const pay = () =>
    router.push({
      pathname: "/payment-summary",
      params: { plan: plan.key, name: `${plan.name.replace("Member", "Membership")}`, duration: term, amount: String(amount) },
    });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Renew Membership" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.valid}>
          <View style={styles.validIcon}>
            <Ionicons name="calendar-outline" size={26} color={Colors.navy} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.validSmall}>Your current plan is valid till</Text>
            <Text style={styles.validDate}>{CURRENT_MEMBER.validTill}</Text>
            <Text style={styles.validSmall}>Renew now to continue enjoying uninterrupted benefits.</Text>
          </View>
        </View>

        <Text style={styles.section}>Select Plan for Renewal</Text>
        {RENEW_ORDER.map((k) => planByKey(k)!).map((p) => {
            const on = selected === p.key;
            return (
              <Pressable key={p.key} onPress={() => setSelected(p.key)} style={[styles.plan, on && styles.planOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                <View style={styles.planIcon}>
                  <PlanIcon k={p.key} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.planName}>{p.name}</Text>
                  <Text style={styles.planPrice}>{`${inr(planPrice(p, billing))} / ${billing === "yearly" ? "year" : "month"}`}</Text>
                </View>
                {on ? (
                  <View style={styles.checked}>
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  </View>
                ) : (
                  <View style={styles.radio} />
                )}
              </Pressable>
            );
          })}

        <Text style={[styles.section, styles.summaryTitle]}>Payment Summary</Text>
        <View style={styles.line}>
          <Text style={styles.lineLabel}>{`${plan.name.replace("Member", "Membership")} (${term})`}</Text>
          <Text style={styles.lineValue}>{inr(amount)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.line}>
          <Text style={styles.lineLabel}>Subtotal</Text>
          <Text style={styles.lineSmall}>{inr(amount)}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.lineLabel}>{`Tax (${GST_RATE * 100}%)`}</Text>
          <Text style={styles.lineSmall}>{inr(tax)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.line}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{inr(total)}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <GoldButton label="Proceed to Payment" onPress={pay} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 12 },
  valid: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: Radius.md, backgroundColor: "#F3F5F9" },
  validIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  validSmall: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  validDate: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17, marginVertical: 2 },
  section: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 6 },
  plan: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: "#E4E9F0", backgroundColor: Colors.white },
  planOn: { borderColor: Colors.champagne, borderWidth: 1.5, backgroundColor: "#FFFBF0" },
  planIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  planName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  planPrice: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13, marginTop: 2 },
  checked: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.textMuted },
  summaryTitle: { marginTop: 14 },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  lineLabel: { flexShrink: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  lineValue: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  lineSmall: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  totalLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  totalValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
