import { FeaturedOppCard, OppCard, SearchBar, ChipRow } from "@/components/opportunity-ui";
import { Colors, Fonts } from "@/constants/theme";
import { CATEGORIES, EMPTY_FILTERS, activeFilterCount, searchOpportunities } from "@/data/opportunities";
import { TabHeader } from "@/components/tab-header";
import { setOpportunities, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const CHIPS = ["All", ...CATEGORIES] as const;

export default function Opportunities() {
  const { filters, sort, interests } = useOpportunities();
  const [text, setText] = useState("");

  // The feed only reacts to the quick category chips; the free-text query opens Results.
  const feed = useMemo(() => searchOpportunities("", { ...EMPTY_FILTERS, category: filters.category }, sort).filter((o) => o.status !== "Closed"), [filters.category, sort]);
  const featured = feed.filter((o) => o.status === "Featured");
  const recommended = featured.length ? featured.slice(0, 1) : feed.slice(0, 1);
  const more = feed.filter((o) => !recommended.includes(o));

  const search = () => {
    setOpportunities({ query: text.trim() });
    router.push("/opportunity-results");
  };
  const openFilters = () => {
    setOpportunities({ query: text.trim() });
    router.push("/filter-opportunities");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TabHeader />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 6, paddingBottom: 24 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Business Opportunities</Text>
          <Text style={styles.heroText}>Discover new partnerships, investments and collaborations within the ABLN network.</Text>
        </View>

        <View style={styles.links}>
          <Pressable style={({ pressed }) => [styles.link, pressed && styles.pressed]} onPress={() => router.push("/my-opportunities")} accessibilityRole="button">
            <Ionicons name="briefcase-outline" size={18} color={Colors.goldDark} />
            <Text style={styles.linkText}>My Opportunities</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.link, pressed && styles.pressed]} onPress={() => router.push("/my-interests")} accessibilityRole="button">
            <Ionicons name="paper-plane-outline" size={18} color={Colors.goldDark} />
            <Text style={styles.linkText}>My Interests</Text>
            {interests.length ? <Text style={styles.linkCount}>{interests.length}</Text> : null}
          </Pressable>
        </View>

        <SearchBar value={text} onChangeText={setText} onSubmit={search} onClear={() => setText("")} placeholder="Search opportunities..." onFilter={openFilters} filterCount={activeFilterCount(filters)} />

        <ChipRow scroll options={CHIPS} selected={filters.category} onSelect={(c) => setOpportunities({ filters: { ...filters, category: c } })} />

        {feed.length === 0 ? (
          <Text style={styles.none}>No opportunities in this category yet.</Text>
        ) : (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <Pressable
                onPress={() => {
                  setOpportunities({ query: "" });
                  router.push("/opportunity-results");
                }}
                hitSlop={8}
                style={styles.viewAll}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.goldDark} />
              </Pressable>
            </View>
            {recommended.map((o) => (
              <FeaturedOppCard key={o.id} o={o} />
            ))}
            {more.map((o) => (
              <OppCard key={o.id} o={o} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 16, gap: 14 },

  hero: { gap: 6 },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32 },
  heroText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },

  links: { flexDirection: "row", gap: 10 },
  link: { flex: 1, height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, backgroundColor: "#FEF6E3", borderWidth: 1, borderColor: "#F4DFA6" },
  linkText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  linkCount: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, overflow: "hidden", textAlign: "center", lineHeight: 18, backgroundColor: Colors.goldDark, color: Colors.white, fontFamily: Fonts.bold, fontSize: 10 },
  pressed: { opacity: 0.85 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 32 },
});
