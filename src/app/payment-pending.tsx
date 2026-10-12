import { ScreenHeader } from "@/components/member-ui";
import { Callout, DetailsCard, StatusHero } from "@/components/payment-ui";
import { OutlineButton } from "@/components/opportunity-ui";
import { Colors, Fonts } from "@/constants/theme";
import { formatDateTime, formatInr, updatePayment, usePayment } from "@/lib/payment-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function PaymentPending() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const payment = usePayment(id);

  if (!payment) return null;

  // No payment gateway yet: checking status confirms the pending payment.
  const checkStatus = () => {
    updatePayment(payment.id, { status: "Successful", at: Date.now() });
    router.replace({ pathname: "/payment-success", params: { id: payment.id } });
  };

  const steps: { icon: IconName; title: string; sub: string; done: boolean }[] = [
    { icon: "checkmark", title: "Payment Initiated", sub: formatDateTime(payment.at), done: true },
    { icon: "sync-outline", title: "Payment Verification", sub: "In Progress", done: false },
    { icon: "arrow-down", title: "Membership Activation", sub: "Pending", done: false },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Payment Pending" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StatusHero icon="time-outline" color={Colors.goldDark} bg="#FDF0D2" title="Payment Pending" message={"Your payment is initiated and\ncurrently being processed."} />

        <DetailsCard
          rows={[
            { label: "Transaction ID", value: payment.id },
            { label: "Plan", value: `${payment.planName} (${payment.duration})` },
            { label: "Amount", value: formatInr(payment.total) },
            { label: "Initiated On", value: formatDateTime(payment.at) },
          ]}
        />

        <Callout icon="information" tint={Colors.goldDark} bg="#FFF8E6" border="#F6E3B0">
          <Text style={styles.calloutText}>This may take a few minutes.{"\n"}We will notify you once the payment is confirmed.</Text>
        </Callout>

        <View style={styles.timeline}>
          {steps.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.rail}>
                <View style={[styles.dot, s.done ? styles.dotDone : styles.dotTodo]}>
                  <Ionicons name={s.icon} size={16} color={s.done ? Colors.goldDark : Colors.textMuted} />
                </View>
                {i < steps.length - 1 ? <View style={styles.connector} /> : null}
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, !s.done && styles.stepTitleTodo]}>{s.title}</Text>
                <Text style={styles.stepSub}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <OutlineButton label="Check Status" onPress={checkStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  calloutText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  timeline: { marginTop: 22, paddingHorizontal: 4 },
  step: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center" },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  dotDone: { borderColor: Colors.gold, backgroundColor: "#FDF0D2" },
  dotTodo: { borderColor: "#E4E9F0", backgroundColor: "#F3F5F9" },
  connector: { width: 1.5, flex: 1, minHeight: 22, backgroundColor: "#E4E9F0", marginVertical: 2 },
  stepText: { flex: 1, paddingBottom: 18 },
  stepTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  stepTitleTodo: { color: Colors.textSecondary },
  stepSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
