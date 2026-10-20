import { ScreenHeader } from "@/components/member-ui";
import { Crown } from "@/components/membership-ui";
import { GoldButton } from "@/components/opportunity-ui";
import { DetailsCard, StatusHero } from "@/components/payment-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { formatDateTime, formatInr, usePayment, usePayments } from "@/lib/payment-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PaymentSuccess() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const all = usePayments();
  const byId = usePayment(id);
  const payment = byId ?? all.find((p) => p.status === "Successful");

  if (!payment) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Payment Successful" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StatusHero
          icon="checkmark-circle"
          color={Colors.success}
          bg="#E3F5EB"
          title="Payment Successful!"
          message={"Your membership payment has been\ncompleted successfully."}
        />

        <DetailsCard
          rows={[
            { label: "Transaction ID", value: payment.id },
            { label: "Plan", value: `${payment.planName} (${payment.duration})` },
            { label: "Amount Paid", value: formatInr(payment.total) },
            { label: "Payment Method", value: payment.method },
            { label: "Payment Date", value: formatDateTime(payment.at) },
            { label: "Status", chip: payment.status },
          ]}
        />

        <View style={styles.welcome}>
          <View style={styles.crownWrap}>
            <Crown size={30} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.welcomeTitle}>Welcome to{"\n"}{payment.planName}!</Text>
            <Text style={styles.welcomeText}>You now have access to all premium benefits and exclusive opportunities on ABLN.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <GoldButton label="Go to Membership" onPress={() => router.replace("/membership")} />
        <View style={styles.actions}>
          <Pressable onPress={() => router.push({ pathname: "/invoice-detail", params: { id: payment.id } })} style={({ pressed }) => [styles.action, pressed && styles.pressed]} accessibilityRole="button">
            <Ionicons name="document-text-outline" size={18} color={Colors.navy} />
            <Text style={styles.actionText}>Download Receipt</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/compare-plans")} style={({ pressed }) => [styles.action, pressed && styles.pressed]} accessibilityRole="button">
            <Ionicons name="sparkles-outline" size={18} color={Colors.navy} />
            <Text style={styles.actionText}>View Benefits</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  welcome: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 16, padding: 14, borderRadius: Radius.md, backgroundColor: "#EEF8F2", borderWidth: 1, borderColor: "#D5EDDF" },
  crownWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  welcomeTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21 },
  welcomeText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 4 },
  footer: { paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1, height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  actionText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
});
