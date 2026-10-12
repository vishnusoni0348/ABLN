import { EmptyState } from "@/components/empty-state";
import { ScreenHeader } from "@/components/member-ui";
import { ChipRow, OutlineButton } from "@/components/opportunity-ui";
import { STATUS_STYLE, StatusChip } from "@/components/payment-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { type Payment, formatDate, formatInr, receiptText, usePayments } from "@/lib/payment-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTERS = ["All", "Successful", "Pending", "Failed"] as const;
type Filter = (typeof FILTERS)[number];

const ROUTES = { Successful: "/payment-success", Pending: "/payment-pending", Failed: "/payment-failed" } as const;

function PaymentRow({ p }: { p: Payment }) {
  const s = STATUS_STYLE[p.status];
  return (
    <Pressable
      onPress={() => router.push({ pathname: ROUTES[p.status], params: { id: p.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${p.planName}, ${p.status}`}
    >
      <View style={[styles.icon, { backgroundColor: s.bg }]}>
        <Ionicons name={s.icon} size={22} color={s.fg} />
      </View>
      <View style={styles.info}>
        <Text style={styles.plan} numberOfLines={1}>
          {p.planName}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {p.duration}
        </Text>
        <Text style={styles.sub}>{formatDate(p.at)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatInr(p.total)}</Text>
        <StatusChip status={p.status} />
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.navy} />
    </Pressable>
  );
}

export default function PaymentHistory() {
  const insets = useSafeAreaInsets();
  const payments = usePayments();
  const [filter, setFilter] = useState<Filter>("All");

  const list = filter === "All" ? payments : payments.filter((p) => p.status === filter);
  const receipts = payments.filter((p) => p.status === "Successful");

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Payment History" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]} showsVerticalScrollIndicator={false}>
        <ChipRow options={FILTERS} selected={filter} onSelect={setFilter} />

        {list.length ? (
          list.map((p) => <PaymentRow key={p.id} p={p} />)
        ) : (
          <EmptyState inline icon="receipt-outline" title="No Payments Found" text={filter === "All" ? "Your membership and event payments will appear here." : `You have no ${filter.toLowerCase()} payments.`} />
        )}

        <Pressable onPress={() => router.push("/contact-support")} style={({ pressed }) => [styles.help, pressed && styles.pressed]} accessibilityRole="button">
          <View style={styles.helpIcon}>
            <Ionicons name="headset-outline" size={22} color={Colors.navy} />
          </View>
          <View style={styles.info}>
            <Text style={styles.plan}>Need Help with Payments?</Text>
            <Text style={styles.sub}>Contact our support team for any payment related queries.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.navy} />
        </Pressable>

        {receipts.length ? (
          <OutlineButton label="Download All Receipts" onPress={() => Share.share({ message: receipts.map(receiptText).join("\n\n") })} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  pressed: { opacity: 0.85 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, minWidth: 0 },
  plan: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  empty: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", paddingVertical: 32 },
  help: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: "#EEF2FA" },
  helpIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
});
