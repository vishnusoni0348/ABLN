import { ScreenHeader } from "@/components/member-ui";
import { GoldButton, OppCard, OutlineButton, SearchBar } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EMPTY_FILTERS, SORT_OPTIONS, activeFilterCount, searchOpportunities } from "@/data/opportunities";
import { setOpportunities, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TIPS = ["Try different keywords", "Use fewer filters", "Check the spelling", "Browse all opportunities", "Create an opportunity if you have one"];

export default function OpportunityResults() {
  const insets = useSafeAreaInsets();
  const { query, filters, sort } = useOpportunities();
  const [sortOpen, setSortOpen] = useState(false);

  const results = useMemo(() => searchOpportunities(query, filters, sort), [query, filters, sort]);
  const total = results.length;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSortOpen(false)} />
        <View style={[styles.sortCard, { top: insets.top + 56 }]}>
          <Text style={styles.sortTitle}>Sort By</Text>
          {SORT_OPTIONS.map((o) => {
            const on = sort === o.key;
            return (
              <Pressable
                key={o.key}
                style={styles.sortRow}
                onPress={() => {
                  setOpportunities({ sort: o.key });
                  setSortOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
              >
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <Text style={[styles.sortLabel, on && styles.sortLabelOn]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Modal>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 24 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Opportunities" />

        <SearchBar
          value={query}
          onChangeText={(q) => setOpportunities({ query: q })}
          onClear={() => setOpportunities({ query: "" })}
          placeholder="Search opportunities..."
          onFilter={() => router.navigate("/filter-opportunities")}
          filterCount={activeFilterCount(filters)}
        />

        {total > 0 ? (
          <>
            <View style={styles.countRow}>
              <Text style={styles.count}>{`${total} ${total === 1 ? "Opportunity" : "Opportunities"} Found`}</Text>
              <Pressable style={styles.sortBtn} onPress={() => setSortOpen(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Sort results">
                <Text style={styles.sortBtnText}>Sort</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.goldDark} />
              </Pressable>
            </View>
            {results.map((o) => (
              <OppCard key={o.id} o={o} outlineButton />
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyArt}>
              <View style={styles.emptyDoc}>
                <View style={[styles.docLine, { width: 34 }]} />
                <View style={[styles.docLine, { width: 44 }]} />
                <View style={[styles.docLine, { width: 28 }]} />
                <View style={[styles.docLine, { width: 40 }]} />
              </View>
              <Ionicons name="search" size={62} color={Colors.goldDark} style={styles.emptyLens} />
            </View>
            <Text style={styles.emptyTitle}>No Opportunities Found</Text>
            <Text style={styles.emptyText}>We couldn&apos;t find any opportunities matching your search.</Text>

            <GoldButton label="Clear Filters" onPress={() => setOpportunities({ query: "", filters: EMPTY_FILTERS })} style={styles.fullBtn} />
            <OutlineButton label="Browse All Opportunities" onPress={() => setOpportunities({ query: "", filters: EMPTY_FILTERS, sort: "recent" })} style={styles.fullBtn} />

            <View style={styles.tips}>
              <View style={styles.tipsHead}>
                <Ionicons name="bulb-outline" size={16} color={Colors.goldDark} />
                <Text style={styles.tipsTitle}>Search Tips:</Text>
              </View>
              {TIPS.map((t) => (
                <Text key={t} style={styles.tip}>
                  •  {t}
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 16, gap: 14 },

  countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  count: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  sortBtnText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  empty: { alignItems: "center", gap: 12, paddingTop: 16 },
  emptyArt: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#FBEBCB", alignItems: "center", justifyContent: "center", marginTop: 24, marginBottom: 12 },
  emptyDoc: { width: 72, height: 88, borderRadius: 8, backgroundColor: "#F6D9A0", paddingTop: 18, paddingLeft: 12, gap: 8, transform: [{ translateX: -8 }] },
  docLine: { height: 5, borderRadius: 3, backgroundColor: "#FBEBCB" },
  emptyLens: { position: "absolute", right: 28, bottom: 30 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center", marginBottom: 8, paddingHorizontal: 8 },
  fullBtn: { alignSelf: "stretch" },
  tips: { alignSelf: "stretch", marginTop: 24, padding: 16, borderRadius: Radius.md, backgroundColor: "#F1F4FA", gap: 6 },
  tipsHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  tipsTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  tip: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },

  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(255,255,255,0.7)" },
  sortCard: {
    position: "absolute",
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    gap: 4,
    shadowColor: Colors.navy,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sortTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginBottom: 6 },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.goldDark },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.goldDark },
  sortLabel: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  sortLabelOn: { fontFamily: Fonts.semiBold },
});
