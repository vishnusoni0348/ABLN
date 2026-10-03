import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GST_RATE = 0.18;

// Placeholder pricing until the final plan fees are defined.
const PLANS: Record<string, { name: string; duration: string; amount: number }> = {
  founding: { name: "Founding 100", duration: "1 Year", amount: 10000 },
  regular: { name: "Regular Membership", duration: "1 Year", amount: 5000 },
  premium: { name: "Premium Membership", duration: "1 Year", amount: 15000 },
  corporate: { name: "Corporate / Family Business", duration: "1 Year", amount: 25000 },
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PaymentSummary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { plan } = useLocalSearchParams<{ plan?: string }>();

  const selected = PLANS[plan ?? ""] ?? PLANS.regular;
  const gst = selected.amount * GST_RATE;
  const total = selected.amount + gst;

  const rows = [
    { label: "Membership Plan", value: selected.name },
    { label: "Duration", value: selected.duration },
    { label: "Base Amount", value: inr(selected.amount) },
    { label: `GST (${GST_RATE * 100}%)`, value: inr(gst) },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/white-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={Colors.navy} />
          </Pressable>
          <Text style={styles.title}>Payment Summary</Text>
        </View>

        <Text style={styles.subtitle}>Review your membership details{"\n"}before making the payment.</Text>

        <View style={styles.card}>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i > 0 && styles.rowBorder]}>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.value}>{r.value}</Text>
            </View>
          ))}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{inr(total)}</Text>
          </View>
        </View>

        <View style={styles.secure}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.success} />
          <Text style={styles.secureText}>Your payment is secure and encrypted.</Text>
        </View>

        <View style={styles.spacer} />

        <Pressable onPress={() => router.push("/payment-success")} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Pay Now</Text>
            <Ionicons name="arrow-forward" size={24} color={Colors.navy} style={styles.arrow} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  header: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  back: { position: "absolute", left: 0 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    marginTop: 28,
    paddingHorizontal: 18,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
    overflow: "hidden",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, gap: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  label: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15 },
  value: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 16, flexShrink: 1, textAlign: "right" },
  totalRow: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
    backgroundColor: "#FDF4E0",
    borderTopWidth: 1,
    borderTopColor: Colors.champagne,
  },
  totalLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  totalValue: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 22 },
  secure: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  secureText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14 },
  spacer: { flex: 1, minHeight: 32 },
  primaryBtn: {
    height: 58,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  arrow: { position: "absolute", right: 22 },
  pressed: { opacity: 0.85 },
});
