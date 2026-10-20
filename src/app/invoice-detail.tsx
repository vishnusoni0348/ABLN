import { InvoiceItems } from "@/components/invoice-ui";
import { CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { StatusChip } from "@/components/payment-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { buildInvoice } from "@/lib/invoice";
import { receiptText, usePayment } from "@/lib/payment-store";
import { useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

function Section({ icon, title, right, children }: { icon: IconName; title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={22} color={Colors.goldDark} />
        <Text style={[styles.sectionTitle, styles.flex]}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}

export default function InvoiceDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const payment = usePayment(id);
  const { profile } = useSettings();

  if (!payment) return null;
  const inv = buildInvoice(payment, profile);
  const paid = payment.status === "Successful";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Invoice / Receipt Detail" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, CARD_SHADOW]}>
          <View style={styles.statusRow}>
            <View style={[styles.tick, { backgroundColor: paid ? Colors.success : Colors.goldDark }]}>
              <Ionicons name={paid ? "checkmark" : "time-outline"} size={26} color={Colors.white} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.statusTitle}>{paid ? "Paid" : payment.status}</Text>
              <Text style={styles.sub}>{paid ? "Payment completed successfully." : "Payment is not completed yet."}</Text>
            </View>
            <StatusChip status={payment.status} />
          </View>
          <View style={styles.kvBox}>
            <KV label="Invoice Number" value={inv.number} />
            <KV label="Payment Date" value={inv.paidAt} />
            <KV label="Payment Method" value={inv.method} />
            <KV label="Transaction ID" value={inv.transactionId} />
            <KV label="Invoice Type" value={inv.type} />
          </View>
        </View>

        <Section icon="business-outline" title="Billing Information">
          <Text style={styles.billName}>{inv.billTo.name}</Text>
          <Text style={styles.sub}>{inv.billTo.company}</Text>
          <Text style={styles.sub}>{inv.billTo.address}</Text>
        </Section>

        <Section icon="document-text-outline" title="Invoice Items">
          <InvoiceItems inv={inv} totalLabel={paid ? "Total Paid" : "Total Due"} />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={() => router.push({ pathname: "/invoice-preview", params: { id: payment.id } })} accessibilityRole="button" style={({ pressed }) => [styles.btn, styles.outline, pressed && styles.pressed]}>
          <Ionicons name="download-outline" size={18} color={Colors.goldDark} />
          <Text style={[styles.btnText, { color: Colors.goldDark }]}>Download Receipt</Text>
        </Pressable>
        <Pressable onPress={() => Share.share({ message: receiptText(payment) })} accessibilityRole="button" style={({ pressed }) => [styles.btn, styles.solid, pressed && styles.pressed]}>
          <Ionicons name="share-social-outline" size={18} color={Colors.white} />
          <Text style={[styles.btnText, { color: Colors.white }]}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16 },
  scroll: { padding: 16, gap: 12 },
  card: { padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, gap: 10 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tick: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  statusTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  kvBox: { padding: 12, borderRadius: Radius.md, backgroundColor: "#F4F7FB", gap: 8 },
  kv: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  kvLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  kvValue: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13, textAlign: "right" },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  billName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  btn: { flex: 1, height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: Radius.md },
  outline: { borderWidth: 1.5, borderColor: Colors.goldDark, backgroundColor: Colors.white },
  solid: { backgroundColor: Colors.goldDark },
  btnText: { fontFamily: Fonts.bold, fontSize: 14 },
});
