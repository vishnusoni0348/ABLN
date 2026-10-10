import { PillTabs } from "@/components/event-ui";
import { ScreenHeader } from "@/components/member-ui";
import { GoldButton, SearchBar } from "@/components/opportunity-ui";
import { PartnerCard, PartnerSkeleton } from "@/components/partner-ui";
import { Colors, Fonts } from "@/constants/theme";
import { EMPTY_PARTNER_FILTERS, type PartnerTab, activePartnerFilterCount, searchPartners } from "@/data/partners";
import { setPartners, usePartners } from "@/lib/partner-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: readonly PartnerTab[] = ["All", "Featured", "Nearby"];

export default function PartnerResults() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { query, filters } = usePartners();
  const [tab, setTab] = useState<PartnerTab>(TABS.find((t) => t === params.tab) ?? "All");
  const [loading, setLoading] = useState(true);

  // Stand-in for the request latency of the partners API.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const all = useMemo(() => searchPartners(query, filters), [query, filters]);
  const count = (t: PartnerTab) => (t === "All" ? all.length : all.filter((p) => (t === "Featured" ? p.featured : p.nearby)).length);
  const shown = useMemo(() => searchPartners(query, filters, tab), [query, filters, tab]);
  const labels = { All: `All (${count("All")})`, Featured: `Featured (${count("Featured")})`, Nearby: `Nearby (${count("Nearby")})` };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Partners" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SearchBar
          value={query}
          onChangeText={(q) => setPartners({ query: q })}
          onClear={() => setPartners({ query: "" })}
          placeholder="Search partners, categories..."
          onFilter={() => router.navigate("/filter-partners")}
          filterCount={activePartnerFilterCount(filters)}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.bleedContent}>
          <PillTabs options={TABS} selected={tab} onSelect={setTab} labels={labels} />
        </ScrollView>

        {loading ? (
          <>
            <PartnerSkeleton />
            <View style={styles.loadingRow}>
              <Ionicons name="reload" size={16} color={Colors.goldDark} />
              <Text style={styles.loadingText}>Loading partners...</Text>
            </View>
          </>
        ) : shown.length > 0 ? (
          shown.map((p) => <PartnerCard key={p.id} p={p} />)
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyArt}>
              <Ionicons name="storefront-outline" size={64} color={Colors.goldDark} />
              <View style={styles.lens}>
                <Ionicons name="search" size={30} color={Colors.white} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No Partners Found</Text>
            <Text style={styles.emptyText}>We couldn&apos;t find any partners matching your search and filters.</Text>
            <GoldButton label="Clear Filters" onPress={() => setPartners({ query: "", filters: EMPTY_PARTNER_FILTERS })} style={styles.fullBtn} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  bleed: { flexGrow: 0, marginHorizontal: -16 },
  bleedContent: { paddingHorizontal: 16 },

  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 8 },
  loadingText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },

  empty: { alignItems: "center", gap: 12, paddingTop: 16 },
  emptyArt: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#FBEBCB", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 12 },
  lens: { position: "absolute", right: 26, bottom: 28, width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.goldDark, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center", marginBottom: 8, paddingHorizontal: 8 },
  fullBtn: { alignSelf: "stretch" },
});
