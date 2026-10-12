import { ScreenHeader } from "@/components/member-ui";
import { Crown } from "@/components/membership-ui";
import { GoldButton } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { GST_RATE, planByKey, taxOf } from "@/data/membership";
import { type PaymentMethod, createPayment, formatInr } from "@/lib/payment-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Placeholder pricing until the final plan fees are defined.
const PLANS: Record<string, { name: string; blurb: string; duration: string; amount: number }> = {
  founding: { name: "Founding 100", blurb: "For early supporters & industry leaders", duration: "1 Year", amount: 10000 },
  regular: { name: "Regular Membership", blurb: "For individual professionals", duration: "1 Year", amount: 5000 },
  premium: { name: "Premium Membership", blurb: "For growing businesses", duration: "1 Year", amount: 15000 },
  corporate: { name: "Corporate / Family Business", blurb: "For companies and family-run businesses", duration: "1 Year", amount: 25000 },
};

const BENEFITS: { icon: IconName; label: string; basic: boolean }[] = [
  { icon: "gift-outline", label: "Exclusive Partner Offers", basic: true },
  { icon: "calendar-outline", label: "Priority Event Access", basic: true },
  { icon: "people-outline", label: "Business Networking", basic: true },
  { icon: "id-card-outline", label: "Featured Profile", basic: false },
  { icon: "headset-outline", label: "Dedicated Support", basic: false },
];

const METHODS: { method: PaymentMethod; label: string; icon: IconName }[] = [
  { method: "UPI", label: "UPI (Recommended)", icon: "phone-portrait-outline" },
  { method: "Credit / Debit Card", label: "Credit / Debit Card", icon: "card-outline" },
  { method: "Net Banking", label: "Net Banking", icon: "business-outline" },
  { method: "Wallet", label: "Wallet", icon: "wallet-outline" },
];

export default function PaymentSummary() {
  const insets = useSafeAreaInsets();
  const { plan, name, duration, amount } = useLocalSearchParams<{ plan?: string; name?: string; duration?: string; amount?: string }>();
  const [method, setMethod] = useState<PaymentMethod>("UPI");

  // Renewals pass the exact plan being paid for; onboarding only passes the plan key.
  const key = plan ?? "";
  const fallback = PLANS[key] ?? PLANS.regular;
  const override = name && amount && Number(amount) > 0;
  const selected = {
    name: override ? name : fallback.name,
    blurb: planByKey(key)?.blurb ?? fallback.blurb,
    duration: override ? (duration ?? fallback.duration) : fallback.duration,
    amount: override ? Number(amount) : fallback.amount,
  };
  const tax = taxOf(selected.amount);
  const total = selected.amount + tax;
  const benefits = key === "regular" ? BENEFITS.filter((b) => b.basic) : BENEFITS;

  const pay = () => {
    const p = createPayment({ planName: selected.name, duration: selected.duration, base: selected.amount, total, method });
    router.push({ pathname: "/payment-pending", params: { id: p.id } });
  };

  const details = [
    { label: "Plan", value: `${selected.name} (${selected.duration})` },
    { label: "Price", value: formatInr(selected.amount) },
    { label: `Tax (${GST_RATE * 100}%)`, value: formatInr(tax) },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Payment Summary" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.planCard}>
          <View style={styles.planHead}>
            <View style={styles.crownWrap}>
              <Crown size={30} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.planName}>{selected.name}</Text>
              <Text style={styles.planBlurb}>{selected.blurb}</Text>
              <View style={styles.durationTag}>
                <Text style={styles.durationText}>{`${selected.duration} Plan`}</Text>
              </View>
            </View>
          </View>
          {benefits.map((b) => (
            <View key={b.label} style={styles.benefit}>
              <Ionicons name={b.icon} size={18} color={Colors.goldDark} />
              <Text style={styles.benefitText}>{b.label}</Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          ))}
        </View>

        <Text style={styles.section}>Payment Details</Text>
        <View style={styles.detailCard}>
          {details.map((d, i) => (
            <View key={d.label} style={[styles.line, i > 0 && styles.lineBorder]}>
              <Text style={styles.lineLabel}>{d.label}</Text>
              <Text style={styles.lineValue}>{d.value}</Text>
            </View>
          ))}
          <View style={[styles.line, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatInr(total)}</Text>
          </View>
        </View>

        <Text style={styles.section}>Payment Method</Text>
        <View style={styles.methodCard}>
          {METHODS.map((m, i) => {
            const on = method === m.method;
            return (
              <Pressable
                key={m.method}
                onPress={() => setMethod(m.method)}
                style={[styles.method, i > 0 && styles.lineBorder, on && styles.methodOn]}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
              >
                <Ionicons name={m.icon} size={22} color={Colors.navy} />
                <Text style={styles.methodText}>{m.label}</Text>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.secure}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.success} />
          <Text style={styles.secureText}>Your payment is secure and encrypted.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <GoldButton label="Proceed to Pay" onPress={pay} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  planCard: { borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white, overflow: "hidden" },
  planHead: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, backgroundColor: "#FFFBF0" },
  crownWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  planName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  planBlurb: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
  durationTag: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, backgroundColor: "#FDF0D2" },
  durationText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  benefit: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  benefitText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  section: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 22, marginBottom: 10 },
  detailCard: { borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", overflow: "hidden", backgroundColor: Colors.white },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  lineBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  lineLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  lineValue: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14, textAlign: "right" },
  totalRow: { backgroundColor: "#FFFBF0", borderTopWidth: 1, borderTopColor: Colors.champagne },
  totalLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  totalValue: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 22 },
  methodCard: { borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", overflow: "hidden", backgroundColor: Colors.white },
  method: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 15 },
  methodOn: { backgroundColor: "#FFFBF0" },
  methodText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.textMuted, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.gold },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.gold },
  secure: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  secureText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
