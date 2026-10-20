import { Colors, Fonts, Radius } from "@/constants/theme";
import { type Invoice, gstLabel } from "@/lib/invoice";
import { formatInr } from "@/lib/payment-store";
import { StyleSheet, Text, View } from "react-native";

/** Itemised table with subtotal, GST and a highlighted grand total. */
export function InvoiceItems({ inv, totalLabel }: { inv: Invoice; totalLabel: string }) {
  return (
    <View>
      <View style={styles.head}>
        <Text style={[styles.th, styles.numCol]}>#</Text>
        <Text style={[styles.th, styles.flex]}>Description</Text>
        <Text style={[styles.th, styles.qtyCol]}>Qty</Text>
        <Text style={[styles.th, styles.amtCol]}>Amount</Text>
      </View>
      {inv.items.map((it, i) => (
        <View key={it.description} style={styles.row}>
          <Text style={[styles.td, styles.numCol]}>{i + 1}</Text>
          <View style={styles.flex}>
            <Text style={styles.itemName}>{it.description}</Text>
            <Text style={styles.itemSub}>{it.detail}</Text>
          </View>
          <Text style={[styles.td, styles.qtyCol]}>{it.qty}</Text>
          <Text style={[styles.td, styles.amtCol]}>{formatInr(it.amount)}</Text>
        </View>
      ))}
      <View style={styles.sum}>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Subtotal</Text>
          <Text style={styles.sumValue}>{formatInr(inv.subtotal)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>{gstLabel(inv)}</Text>
          <Text style={styles.sumValue}>{formatInr(inv.gst)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          <Text style={styles.totalValue}>{formatInr(inv.total)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 8, backgroundColor: "#F1F4F9", borderRadius: 6 },
  th: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  td: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  numCol: { width: 24 },
  qtyCol: { width: 36, textAlign: "center" },
  amtCol: { width: 84, textAlign: "right" },
  itemName: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  itemSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  sum: { alignSelf: "flex-end", width: "70%", marginTop: 10, gap: 6 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 },
  sumLabel: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  sumValue: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: Radius.sm, backgroundColor: "#FDF0D2", marginTop: 2 },
  totalLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  totalValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
});
