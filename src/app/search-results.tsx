import { GOLD_BG, MemberRow, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { activeFilterCount, EMPTY_FILTERS, PAGE_SIZE, searchMembers, SORT_OPTIONS } from "@/data/members";
import { setDirectory, toggleRequest, useDirectory } from "@/lib/directory-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TIPS = ["Check the spelling of keywords", "Try more general terms", "Use fewer filters", "Browse by industry or location"];

function SkeletonRow() {
  return (
    <View style={[styles.skelRow]}>
      <View style={styles.skelAvatar} />
      <View style={styles.skelLines}>
        <View style={[styles.skelLine, { width: "70%" }]} />
        <View style={[styles.skelLine, { width: "50%" }]} />
        <View style={[styles.skelLine, { width: "35%" }]} />
      </View>
      <View style={styles.skelBtn} />
    </View>
  );
}

export default function SearchResults() {
  const insets = useSafeAreaInsets();
  const { query, filters, sort, requested } = useDirectory();
  const filterCount = activeFilterCount(filters);

  const results = useMemo(() => searchMembers(query, filters, sort), [query, filters, sort]);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const moreTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The screen opens behind a short loading state; later searches update in place.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);
  // New results always start on page one.
  useEffect(() => setShown(PAGE_SIZE), [results]);
  useEffect(() => () => clearTimeout(moreTimer.current), []);

  const loadMore = () => {
    setLoadingMore(true);
    moreTimer.current = setTimeout(() => {
      setShown((s) => s + PAGE_SIZE);
      setLoadingMore(false);
    }, 900);
  };

  const total = results.length;
  const visible = results.slice(0, shown);
  const hasMore = shown < total;
  const countLabel = hasMore ? `Showing ${shown} of ${total} members` : `${total} Members Found`;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSortOpen(false)} />
        <Pressable style={[styles.sortClose, { top: insets.top + 12 }]} onPress={() => setSortOpen(false)} hitSlop={10} accessibilityLabel="Close sort">
          <Ionicons name="close" size={24} color={Colors.navy} />
        </Pressable>
        <View style={[styles.sortCard, { top: insets.top + 56 }]}>
          <Text style={styles.sortTitle}>Sort By</Text>
          {SORT_OPTIONS.map((o) => {
            const on = sort === o.key;
            return (
              <Pressable
                key={o.key}
                style={styles.sortRow}
                onPress={() => {
                  setDirectory({ sort: o.key });
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
        <ScreenHeader title="Search Results" />

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={20} color={Colors.navy} />
            {query && !editing ? (
              <Pressable style={styles.queryWrap} onPress={() => setEditing(true)}>
                <View style={styles.queryChip}>
                <Text style={styles.queryText} numberOfLines={1}>
                  {query}
                </Text>
                <Pressable onPress={() => setDirectory({ query: "" })} hitSlop={8} accessibilityLabel="Remove search term">
                  <Ionicons name="close" size={14} color={Colors.goldDark} />
                </Pressable>
                </View>
              </Pressable>
            ) : (
              <TextInput
                placeholder="Search members, businesses, industries..."
                placeholderTextColor={Colors.textMuted}
                style={styles.searchInput}
                value={query}
                onChangeText={(q) => setDirectory({ query: q })}
                onFocus={() => setEditing(true)}
                onBlur={() => setEditing(false)}
                onSubmitEditing={() => setEditing(false)}
                autoFocus={editing}
                returnKeyType="search"
                autoCorrect={false}
              />
            )}
            <Ionicons name="chevron-down" size={18} color={Colors.navy} />
          </View>
          <Pressable style={({ pressed }) => [styles.filter, pressed && styles.pressed]} onPress={() => router.navigate("/filter-members")} accessibilityRole="button" accessibilityLabel="Open filters">
            <Ionicons name="options-outline" size={22} color={Colors.goldDark} />
            {filterCount > 0 ? <View style={styles.filterDot} /> : null}
          </Pressable>
        </View>

        {!loading && total > 0 ? (
          <View style={styles.countRow}>
            <Text style={styles.count}>{countLabel}</Text>
            <Pressable style={styles.sortBtn} onPress={() => setSortOpen(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Sort results">
              <Text style={styles.sortBtnText}>Sort</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.goldDark} />
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View>
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonRow key={i} />
            ))}
          </View>
        ) : total === 0 ? (
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
            <Text style={styles.emptyTitle}>No Members Found</Text>
            <Text style={styles.emptyText}>Try changing your filters or searching with a different keyword.</Text>

            <Pressable style={({ pressed }) => [styles.fullBtn, pressed && styles.pressed]} onPress={() => setDirectory({ filters: EMPTY_FILTERS })}>
              <LinearGradient colors={[Colors.champagne, Colors.gold, Colors.goldDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fullBtnInner}>
                <Text style={styles.fullBtnText}>Clear Filters</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.fullBtn, styles.outlineBtn, pressed && styles.pressed]} onPress={() => setDirectory({ query: "", filters: EMPTY_FILTERS })}>
              <Text style={styles.outlineBtnText}>Browse All Members</Text>
            </Pressable>

            <View style={styles.tips}>
              <View style={styles.tipsHead}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.navy} />
                <Text style={styles.tipsTitle}>Search Tips:</Text>
              </View>
              {TIPS.map((t) => (
                <Text key={t} style={styles.tip}>
                  •  {t}
                </Text>
              ))}
            </View>
          </View>
        ) : (
          <View>
            {visible.map((m) => (
              <MemberRow key={m.name} member={m} requested={requested.includes(m.name)} onToggle={() => toggleRequest(m.name)} />
            ))}
            {loadingMore ? Array.from({ length: 4 }, (_, i) => <SkeletonRow key={`s${i}`} />) : null}
            {hasMore ? (
              <Pressable disabled={loadingMore} onPress={loadMore} style={({ pressed }) => [styles.loadMore, pressed && styles.pressed]} accessibilityRole="button">
                {loadingMore ? (
                  <View style={[styles.fullBtnInner, styles.loadingBtn]}>
                    <ActivityIndicator size="small" color={Colors.goldDark} />
                    <Text style={styles.loadingText}>Load More Members</Text>
                  </View>
                ) : (
                  <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fullBtnInner}>
                    <Text style={styles.fullBtnText}>Load More Members</Text>
                  </LinearGradient>
                )}
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  scroll: { paddingHorizontal: 16, gap: 14 },

  searchRow: { flexDirection: "row", gap: 10 },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 12, color: Colors.navy, padding: 0 },
  queryWrap: { flex: 1, alignItems: "flex-start", justifyContent: "center" },
  queryChip: { flexDirection: "row", alignItems: "center", maxWidth: "100%", gap: 6, backgroundColor: GOLD_BG, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  queryText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12, flexShrink: 1 },
  filter: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  filterDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.goldDark },

  countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  count: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  sortBtnText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  loadMore: { marginTop: 16 },
  fullBtn: { alignSelf: "stretch" },
  fullBtnInner: { height: 46, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  fullBtnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  loadingBtn: { flexDirection: "row", gap: 8, backgroundColor: "#FDF3DC", borderWidth: 1, borderColor: Colors.champagne },
  loadingText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  outlineBtn: { height: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  outlineBtnText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },

  skelRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  skelAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E7EAF0" },
  skelLines: { flex: 1, gap: 8 },
  skelLine: { height: 9, borderRadius: 5, backgroundColor: "#E7EAF0" },
  skelBtn: { width: 90, height: 34, borderRadius: Radius.sm, backgroundColor: "#F7E3B5" },

  empty: { alignItems: "center", gap: 12, paddingTop: 16 },
  emptyArt: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#FBEBCB", alignItems: "center", justifyContent: "center", marginTop: 24, marginBottom: 12 },
  emptyDoc: { width: 72, height: 88, borderRadius: 8, backgroundColor: "#F6D9A0", paddingTop: 18, paddingLeft: 12, gap: 8, transform: [{ translateX: -8 }] },
  docLine: { height: 5, borderRadius: 3, backgroundColor: "#FBEBCB" },
  emptyLens: { position: "absolute", right: 28, bottom: 30 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center", marginBottom: 8, paddingHorizontal: 8 },
  tips: { alignSelf: "stretch", marginTop: 32, padding: 16, borderRadius: Radius.md, backgroundColor: "#F1F4FA", gap: 6 },
  tipsHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  tipsTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  tip: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.7)" },
  sortClose: { position: "absolute", right: 16 },
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
