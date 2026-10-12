import { CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { PaymentStatus } from "@/lib/payment-store";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const STATUS_STYLE: Record<PaymentStatus, { fg: string; bg: string; icon: IconName }> = {
  Successful: { fg: Colors.success, bg: "#E3F5EB", icon: "checkmark" },
  Pending: { fg: Colors.goldDark, bg: "#FDF0D2", icon: "time-outline" },
  Failed: { fg: Colors.error, bg: "#FCE9E9", icon: "close" },
};

export function StatusChip({ status }: { status: PaymentStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <Text style={[styles.chipText, { color: s.fg }]}>{status}</Text>
    </View>
  );
}

// Large circular icon + title + message at the top of each payment result screen.
export function StatusHero({ icon, color, bg, title, message }: { icon: IconName; color: string; bg: string; title: string; message: string }) {
  return (
    <View style={styles.hero}>
      <View style={[styles.heroOuter, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={54} color={color} />
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroMsg}>{message}</Text>
    </View>
  );
}

export type DetailRow = { label: string; value?: string; valueColor?: string; chip?: PaymentStatus };

export function DetailsCard({ rows }: { rows: DetailRow[] }) {
  return (
    <View style={[styles.card, CARD_SHADOW]}>
      {rows.map((r, i) => (
        <View key={r.label} style={[styles.row, i > 0 && styles.rowBorder]}>
          <Text style={styles.rowLabel}>{r.label}</Text>
          {r.chip ? (
            <StatusChip status={r.chip} />
          ) : (
            <Text style={[styles.rowValue, r.valueColor ? { color: r.valueColor } : null]}>{r.value}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// Tinted callout with a round icon, used for "may take a few minutes", "what you can do", etc.
export function Callout({ icon, tint, bg, border, children }: { icon: IconName; tint: string; bg: string; border: string; children: ReactNode }) {
  return (
    <View style={[styles.callout, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.calloutIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={16} color={Colors.white} />
      </View>
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  chipText: { fontFamily: Fonts.semiBold, fontSize: 12 },
  hero: { alignItems: "center", paddingTop: 16 },
  heroOuter: { width: 112, height: 112, borderRadius: 56, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24, marginTop: 20, textAlign: "center" },
  heroMsg: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: "center", paddingHorizontal: 16 },
  card: { marginTop: 24, paddingHorizontal: 16, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingVertical: 13 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  rowLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  rowValue: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14, textAlign: "right" },
  callout: { flexDirection: "row", gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1, marginTop: 16 },
  calloutIcon: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 1 },
});
