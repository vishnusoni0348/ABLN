import { SheetSelect } from "@/components/event-ui";
import { ScreenHeader } from "@/components/member-ui";
import { ChipRow, GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EMPTY_PARTNER_FILTERS, OFFER_TYPES, PARTNER_CATEGORIES, PARTNER_LOCATIONS, PARTNER_TIERS, type PartnerFilters } from "@/data/partners";
import { setPartners, usePartners } from "@/lib/partner-store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ALL = "All";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function FilterPartners() {
  const insets = useSafeAreaInsets();
  const { filters } = usePartners();
  const [draft, setDraft] = useState<PartnerFilters>(filters);
  const set = <K extends keyof PartnerFilters>(key: K, value: PartnerFilters[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const apply = () => {
    setPartners({ filters: draft });
    router.navigate("/partner-results");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="Filters"
          right={
            <Pressable onPress={() => setDraft(EMPTY_PARTNER_FILTERS)} hitSlop={10} accessibilityRole="button">
              <Text style={styles.clearAll}>Clear All</Text>
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Section title="Categories">
          <ChipRow options={[ALL, ...PARTNER_CATEGORIES]} selected={draft.category} onSelect={(c) => set("category", c as PartnerFilters["category"])} />
        </Section>

        <Section title="Offer Type">
          <ChipRow options={[ALL, ...OFFER_TYPES]} selected={draft.offerType} onSelect={(o) => set("offerType", o as PartnerFilters["offerType"])} />
        </Section>

        <Section title="Partner Tier">
          <ChipRow options={[ALL, ...PARTNER_TIERS]} selected={draft.tier} onSelect={(t) => set("tier", t as PartnerFilters["tier"])} />
        </Section>

        <Section title="Location">
          <SheetSelect
            icon="location-outline"
            title="Location"
            placeholder="All Locations"
            value={draft.location}
            options={[{ value: "", label: "All Locations" }, ...PARTNER_LOCATIONS.map((l) => ({ value: l, label: l }))]}
            onChange={(v) => set("location", v)}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={({ pressed }) => [styles.reset, pressed && styles.pressed]} onPress={() => setDraft(EMPTY_PARTNER_FILTERS)} accessibilityRole="button">
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.applyWrap, pressed && styles.pressed]} onPress={apply} accessibilityRole="button">
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.apply}>
            <Text style={styles.applyText}>Apply Filters</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16 },
  clearAll: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 20 },
  section: { gap: 10 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  reset: { flex: 1, height: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  resetText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
  applyWrap: { flex: 1.4 },
  apply: { height: 46, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
});
