import { InvoiceItems } from "@/components/invoice-ui";
import { CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { buildInvoice, shareInvoicePdf } from "@/lib/invoice";
import { usePayment } from "@/lib/payment-store";
import { useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InvoicePreview() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const payment = usePayment(id);
  const { profile } = useSettings();
  const [busy, setBusy] = useState(false);

  if (!payment) return null;
  const inv = buildInvoice(payment, profile);

  const send = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await shareInvoicePdf(inv);
    } catch {
      Alert.alert("Couldn't create invoice", "Something went wrong while generating the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Invoice Preview" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.paper, CARD_SHADOW]}>
          <LinearGradient colors={[Colors.deepNavy, Colors.navy, Colors.royalNavy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
            <View style={styles.flex}>
              <Text style={styles.logo}>ABLN</Text>
              <Text style={styles.org}>{"Agarwal Business\nLeaders Network"}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.invoiceWord}>INVOICE</Text>
              <Text style={styles.invoiceNo}>#{inv.number}</Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            <View style={styles.meta}>
              <View style={styles.flex}>
                <Text style={styles.muted}>Bill To</Text>
                <Text style={styles.name}>{inv.billTo.name}</Text>
                <Text style={styles.addr}>{inv.billTo.company}</Text>
                <Text style={styles.addr}>{inv.billTo.address}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.muted}>Invoice Date</Text>
                <Text style={styles.metaValue}>{inv.date}</Text>
              </View>
            </View>

            <InvoiceItems inv={inv} totalLabel="Total Amount" />

            <View style={styles.notes}>
              <Ionicons name="information-circle" size={20} color={Colors.navy} />
              <View style={styles.flex}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>Thank you for being a valued member of Agarwal Business Leaders Network (ABLN). This is a system generated invoice.</Text>
              </View>
            </View>
          </View>

          <LinearGradient colors={[Colors.deepNavy, Colors.royalNavy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.foot}>
            <Text style={styles.footText}>{"Building Businesses\nStrengthening Communities"}</Text>
            <Text style={styles.footText}>www.abln.in</Text>
          </LinearGradient>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={send} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.btn, styles.outline, pressed && styles.pressed]}>
          <Ionicons name="download-outline" size={18} color={Colors.goldDark} />
          <Text style={[styles.btnText, { color: Colors.goldDark }]}>Download PDF</Text>
        </Pressable>
        <Pressable onPress={send} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.btn, styles.solid, pressed && styles.pressed]}>
          {busy ? <ActivityIndicator color={Colors.white} /> : <Ionicons name="share-social-outline" size={18} color={Colors.white} />}
          <Text style={[styles.btnText, { color: Colors.white }]}>Share Invoice</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  right: { alignItems: "flex-end" },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16 },
  scroll: { padding: 16 },
  paper: { backgroundColor: Colors.white, borderRadius: Radius.md, overflow: "hidden" },
  banner: { flexDirection: "row", alignItems: "flex-end", padding: 18, borderBottomWidth: 4, borderBottomColor: Colors.gold },
  logo: { color: Colors.gold, fontFamily: Fonts.bold, fontSize: 32, letterSpacing: 1 },
  org: { color: Colors.white, fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 17 },
  invoiceWord: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 22 },
  invoiceNo: { color: "#C9D4E2", fontFamily: Fonts.medium, fontSize: 12, marginTop: 2 },
  body: { padding: 16, gap: 18 },
  meta: { flexDirection: "row", gap: 12 },
  muted: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 2 },
  addr: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  metaValue: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13, marginTop: 2 },
  notes: { flexDirection: "row", gap: 10, padding: 12, borderRadius: Radius.md, backgroundColor: "#EEF3FA" },
  notesTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  notesText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 2 },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", padding: 14, borderTopWidth: 3, borderTopColor: Colors.gold },
  footText: { color: Colors.white, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 15 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  btn: { flex: 1, height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: Radius.md },
  outline: { borderWidth: 1.5, borderColor: Colors.goldDark, backgroundColor: Colors.white },
  solid: { backgroundColor: Colors.goldDark },
  btnText: { fontFamily: Fonts.bold, fontSize: 14 },
});
