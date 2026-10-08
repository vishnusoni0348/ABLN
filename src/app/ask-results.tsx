import { GoldFill, LoadingFooter, QuestionCard, SearchField, useInfinite } from "@/components/ask-ui";
import { NetworkTabBar } from "@/components/intro-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { activeQCount, QSORTS, QTYPES, searchQuestions } from "@/data/questions";
import { resetQFilters, setQFilters, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUGGESTIONS = ["Check your spelling", "Try different keywords", "Remove some filters", "Browse all questions"];

function Empty({ onClear, onBrowse }: { onClear: () => void; onBrowse: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyArt}>
        <View style={styles.emptyDoc}>
          {[34, 44, 28, 40].map((w) => (
            <View key={w} style={[styles.docLine, { width: w }]} />
          ))}
        </View>
        <Ionicons name="search" size={60} color={Colors.goldDark} style={styles.lens} />
      </View>
      <Text style={styles.emptyTitle}>No Questions Found</Text>
      <Text style={styles.emptyText}>We couldn&apos;t find any questions matching your search and filters.</Text>
      <View style={styles.suggest}>
        <Text style={styles.suggestTitle}>Try these suggestions:</Text>
        {SUGGESTIONS.map((s) => (
          <Text key={s} style={styles.suggestItem}>
            •  {s}
          </Text>
        ))}
      </View>
      <Pressable style={styles.full} onPress={onBrowse} accessibilityRole="button">
        <GoldFill style={styles.fullInner}>
          <Text style={styles.fullText}>Browse All Questions</Text>
        </GoldFill>
      </Pressable>
      <Pressable style={[styles.fullInner, styles.outline]} onPress={onClear} accessibilityRole="button">
        <Text style={styles.outlineText}>Clear Filters</Text>
      </Pressable>
    </View>
  );
}

export default function AskResults() {
  const insets = useSafeAreaInsets();
  const { filters, posted } = useQuestions();
  const list = searchQuestions(filters, posted);
  const { shown, hasMore, loading, loadMore } = useInfinite(JSON.stringify(filters), list.length);

  const sortLabel = QSORTS.find((s) => s.key === filters.sort)?.label;
  const typeLabel = QTYPES.find((t) => t.key === filters.type)?.label;
  const chips: { label: string; remove: () => void }[] = [
    ...filters.categories.map((c) => ({ label: c, remove: () => setQFilters({ categories: filters.categories.filter((x) => x !== c) }) })),
    ...(filters.sort !== "latest" ? [{ label: sortLabel ?? "", remove: () => setQFilters({ sort: "latest" as const }) }] : []),
    ...(filters.type !== "all" ? [{ label: typeLabel ?? "", remove: () => setQFilters({ type: "all" as const }) }] : []),
  ];

  const clearFilters = () => setQFilters({ categories: [], sort: "latest", type: "all" });
  const browseAll = () => {
    resetQFilters();
    router.replace("/ask-network");
  };

  const header = (
    <View style={styles.header}>
      <SearchField value={filters.query} onChange={(query) => setQFilters({ query })} onFilter={() => router.push("/ask-filter")} filterCount={activeQCount(filters)} />
      {chips.length ? (
        <View style={styles.chipRow}>
          <View style={styles.chips}>
            {chips.map((c) => (
              <View key={c.label} style={styles.chip}>
                <Text style={styles.chipText}>{c.label}</Text>
                <Pressable onPress={c.remove} hitSlop={8} accessibilityLabel={`Remove ${c.label}`}>
                  <Ionicons name="close" size={13} color={Colors.goldDark} />
                </Pressable>
              </View>
            ))}
          </View>
          <Pressable onPress={clearFilters} hitSlop={8} accessibilityRole="button">
            <Text style={styles.clear}>Clear All</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title={list.length ? `Search Results (${list.length})` : "Search Results"} />
      </View>
      <FlatList
        data={list.slice(0, shown)}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => <QuestionCard q={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty onClear={clearFilters} onBrowse={browseAll} />}
        ListFooterComponent={list.length ? <LoadingFooter loading={loading} hasMore={hasMore} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { gap: 12, paddingBottom: 14 },
  chipRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  chips: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#FDF0D2" },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  clear: { color: "#2F6FDE", fontFamily: Fonts.semiBold, fontSize: 12, paddingTop: 6 },

  empty: { alignItems: "center", gap: 12, paddingTop: 8 },
  emptyArt: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#FBEBCB", alignItems: "center", justifyContent: "center", marginTop: 8 },
  emptyDoc: { width: 68, height: 84, borderRadius: 8, backgroundColor: "#F6D9A0", paddingTop: 16, paddingLeft: 12, gap: 8, transform: [{ translateX: -8 }] },
  docLine: { height: 5, borderRadius: 3, backgroundColor: "#FBEBCB" },
  lens: { position: "absolute", right: 24, bottom: 26 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center", paddingHorizontal: 8 },
  suggest: { alignSelf: "stretch", gap: 4, marginVertical: 8 },
  suggestTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, marginBottom: 2 },
  suggestItem: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  full: { alignSelf: "stretch" },
  fullInner: { alignSelf: "stretch", height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  fullText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  outline: { borderWidth: 1, borderColor: Colors.gold },
  outlineText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
});
