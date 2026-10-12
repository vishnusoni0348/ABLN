import { ScreenHeader } from "@/components/member-ui";
import { OutlineButton, GoldButton } from "@/components/opportunity-ui";
import { Callout, DetailsCard, StatusHero } from "@/components/payment-ui";
import { Colors, Fonts } from "@/constants/theme";
import { formatDateTime, formatInr, usePayment } from "@/lib/payment-store";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TIPS = ["Check your bank balance or card details", "Try a different payment method", "Contact your bank if the issue persists"];

export default function PaymentFailed() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const payment = usePayment(id);

  if (!payment) return null;

  const retry = () =>
    router.replace({
      pathname: "/payment-summary",
      params: { name: payment.planName, duration: payment.duration, amount: String(payment.base) },
    });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Payment Failed" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StatusHero
          icon="alert-circle-outline"
          color={Colors.error}
          bg="#FCE9E9"
          title="Payment Failed"
          message={"We couldn't process your payment.\nPlease try again or use a different\npayment method."}
        />

        <DetailsCard
          rows={[
            { label: "Transaction ID", value: payment.id },
            { label: "Plan", value: `${payment.planName} (${payment.duration})` },
            { label: "Amount", value: formatInr(payment.total) },
            { label: "Failed On", value: formatDateTime(payment.at) },
            { label: "Reason", value: payment.reason ?? "Payment could not be completed.", valueColor: Colors.error },
          ]}
        />

        <Callout icon="alert" tint={Colors.error} bg="#FEF5F5" border="#F7D4D4">
          <Text style={styles.tipsTitle}>What you can do?</Text>
          {TIPS.map((t) => (
            <View key={t} style={styles.tip}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.tipText}>{t}</Text>
            </View>
          ))}
        </Callout>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <GoldButton label="Try Again" onPress={retry} />
        <OutlineButton label="Contact Support" onPress={() => router.push("/contact-support")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  tipsTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, marginBottom: 6 },
  tip: { flexDirection: "row", gap: 8, marginTop: 3 },
  bullet: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  tipText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  footer: { paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
