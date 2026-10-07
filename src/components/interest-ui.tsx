import { GOLD_BG, Tag } from "@/components/member-ui";
import { OppThumb } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { OppInfo } from "@/lib/opportunity-lookup";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={24} color={Colors.navy} />
      </Pressable>
      <Text style={styles.topTitle}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

const STATUS_COLOR: Record<string, string> = { Open: Colors.success, Closed: Colors.error, Pending: Colors.goldDark, "Closing Soon": Colors.goldDark };

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const c = STATUS_COLOR[status] ?? Colors.success;
  return (
    <View style={[styles.pill, { backgroundColor: c + "22" }]}>
      <Text style={[styles.pillText, { color: c }]}>{label ?? status}</Text>
    </View>
  );
}

// Banner, title and key facts for the opportunity the interest screens are about.
export function OppHero({ o, pill, tags = true, facts = true }: { o: OppInfo; pill?: boolean; tags?: boolean; facts?: boolean }) {
  return (
    <View style={styles.hero}>
      <View>
        <OppThumb category={o.category} uri={o.cover} style={styles.banner} />
        {o.featured || (o.closed && !pill) ? <Text style={[styles.badge, o.closed && styles.badgeClosed]}>{o.closed ? "Closed" : "Featured"}</Text> : null}
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{o.title}</Text>
        {pill ? <StatusPill status={o.status} /> : null}
      </View>
      {tags ? (
        <View style={styles.tags}>
          {[o.category, o.industry].map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </View>
      ) : null}
      <View style={styles.metaRow}>
        <Ionicons name="location" size={14} color={Colors.goldDark} />
        <Text style={styles.meta}>{o.location}</Text>
        {!facts ? (
          <>
            <Ionicons name="cash-outline" size={14} color={Colors.goldDark} style={styles.metaGap} />
            <Text style={styles.meta}>{o.valueLabel}</Text>
          </>
        ) : null}
      </View>
      {facts ? (
        <View style={styles.facts}>
          <View style={styles.fact}>
            <Ionicons name="cash-outline" size={20} color={Colors.goldDark} />
            <View>
              <Text style={styles.factValue}>{o.valueLabel}</Text>
              <Text style={styles.factLabel}>Value Range</Text>
            </View>
          </View>
          <View style={styles.factSep} />
          <View style={styles.fact}>
            <Ionicons name="calendar-outline" size={20} color={Colors.goldDark} />
            <View>
              <Text style={styles.factValue}>{o.deadlineLabel}</Text>
              <Text style={styles.factLabel}>Deadline</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function InfoRow({ icon, children }: { icon: keyof typeof Ionicons.glyphMap; children: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={Colors.goldDark} />
      </View>
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export function OfferPills({ offers }: { offers: string[] }) {
  return (
    <View style={styles.offers}>
      {offers.map((o, i) => (
        <View key={o} style={[styles.offer, i === 0 && styles.offerFirst]}>
          <Text style={[styles.offerText, i === 0 && styles.offerTextFirst]}>{o}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  topTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },

  pill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontFamily: Fonts.semiBold, fontSize: 11 },

  hero: { gap: 10 },
  banner: { height: 120, borderRadius: Radius.md },
  badge: { position: "absolute", top: 8, right: 8, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.goldDark, color: Colors.white, fontFamily: Fonts.bold, fontSize: 10 },
  badgeClosed: { backgroundColor: "#FBDADA", color: Colors.error },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, lineHeight: 22 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaGap: { marginLeft: 10 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  facts: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  fact: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  factSep: { width: 1, height: 32, backgroundColor: Colors.border, marginRight: 14 },
  factValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  factLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },

  offers: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  offer: { borderRadius: Radius.sm, backgroundColor: "#EEF2FA", paddingHorizontal: 14, paddingVertical: 8 },
  offerFirst: { backgroundColor: Colors.goldDark },
  offerText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  offerTextFirst: { color: Colors.white, fontFamily: Fonts.bold },
});
