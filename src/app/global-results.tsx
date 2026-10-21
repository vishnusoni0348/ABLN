import { Avatar, GOLD_BG, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import {
  activeGlobalFilterCount,
  CATEGORIES,
  CATEGORY_LABEL,
  countByCategory,
  DATE_OPTIONS,
  EMPTY_GLOBAL_FILTERS,
  GLOBAL_SORTS,
  SEARCH_INDUSTRIES,
  SEARCH_LOCATIONS,
  searchCategory,
  type GlobalFilters,
  type GlobalSort,
  type SearchCategory,
  type SearchItem,
} from "@/data/global-search";
import { addRecent, setSearch, useSearch } from "@/lib/search-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICON: Record<SearchCategory, IconName> = {
  members: "person-outline",
  opportunities: "briefcase-outline",
  events: "calendar-outline",
  partners: "business-outline",
};

const ROUTE: Record<SearchCategory, "/member-profile" | "/opportunity-details" | "/event-details" | "/partner-details"> = {
  members: "/member-profile",
  opportunities: "/opportunity-details",
  events: "/event-details",
  partners: "/partner-details",
};

function open(item: SearchItem) {
  router.push({ pathname: ROUTE[item.kind], params: item.kind === "members" ? { name: item.id } : { id: item.id } });
}

function Thumb({ item }: { item: SearchItem }) {
  if (item.kind === "members") return <Avatar name={item.title} photo={item.photo} size={64} />;
  if (item.kind === "partners") {
    return (
      <View style={[styles.thumb, { backgroundColor: `${item.color}1A` }]}>
        <Text style={[styles.mark, { color: item.color }]}>{item.mark}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.thumb, { backgroundColor: GOLD_BG }]}>
      <Ionicons name={CATEGORY_ICON[item.kind]} size={28} color={Colors.goldDark} />
    </View>
  );
}

function ResultRow({ item }: { item: SearchItem }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={() => open(item)} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`}>
      <Thumb item={item} />
      <View style={styles.rowInfo}>
        {item.badge && item.kind !== "members" ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={item.kind === "members" ? 1 : 2}>
            {item.title}
          </Text>
          {item.verified ? <Ionicons name="checkmark-circle" size={16} color="#2F6FDE" /> : null}
        </View>
        <Text style={styles.line} numberOfLines={1}>
          {item.line1}
        </Text>
        {item.line2 ? (
          <Text style={styles.line} numberOfLines={1}>
            {item.line2}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {item.place ? (
            <View style={styles.meta}>
              <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.place}
              </Text>
            </View>
          ) : null}
          {item.meta ? (
            <View style={styles.meta}>
              <Ionicons name={item.kind === "events" ? "calendar-outline" : "time-outline"} size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{item.meta}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

type PickerKey = "location" | "industry" | "days";

function PickerRow({ icon, label, value, open: isOpen, onToggle, children }: { icon: IconName; label: string; value: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.sheetLabel}>{label}</Text>
      <Pressable style={styles.pickRow} onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
        <Ionicons name={icon} size={20} color={Colors.navy} />
        <Text style={[styles.pickText, value.startsWith("Select") || value === "Any Time" ? styles.pickMuted : null]}>{value}</Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-forward"} size={18} color={Colors.textSecondary} />
      </Pressable>
      {isOpen ? <View style={styles.optionWrap}>{children}</View> : null}
    </View>
  );
}

function Option({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, on && styles.optionOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
      <Text style={[styles.optionText, on && styles.optionTextOn]}>{label}</Text>
    </Pressable>
  );
}

export default function GlobalResults() {
  const insets = useSafeAreaInsets();
  const { query, category, filters, sort } = useSearch();
  const [text, setText] = useState(query);
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<{ filters: GlobalFilters; sort: GlobalSort; category: SearchCategory }>({ filters, sort, category });
  const [picker, setPicker] = useState<PickerKey | null>(null);

  const counts = useMemo(() => countByCategory(query, filters), [query, filters]);
  const results = useMemo(() => searchCategory(category, query, filters, sort), [category, query, filters, sort]);
  const filterCount = activeGlobalFilterCount(filters) + (sort !== "relevance" ? 1 : 0);

  const submit = () => {
    addRecent(text);
    setSearch({ query: text.trim() });
  };

  const openSheet = () => {
    setDraft({ filters, sort, category });
    setPicker(null);
    setSheet(true);
  };
  const apply = () => {
    setSearch({ filters: draft.filters, sort: draft.sort, category: draft.category });
    setSheet(false);
  };
  const reset = () => setDraft({ filters: EMPTY_GLOBAL_FILTERS, sort: "relevance", category: draft.category });
  const setF = (patch: Partial<GlobalFilters>) => {
    setDraft((d) => ({ ...d, filters: { ...d.filters, ...patch } }));
    setPicker(null);
  };
  const toggle = (k: PickerKey) => setPicker((p) => (p === k ? null : k));

  const df = draft.filters;
  const dateLabel = DATE_OPTIONS.find((o) => o.key === df.days)?.label ?? "Any Time";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheet(false)} accessibilityLabel="Close filters" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.grabber} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Filters & Sort</Text>
            <Pressable onPress={() => setSheet(false)} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={Colors.navy} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
            <View>
              <Text style={styles.sheetLabel}>Category</Text>
              <View style={styles.catRow}>
                {CATEGORIES.map((c) => {
                  const on = draft.category === c;
                  return (
                    <Pressable key={c} style={[styles.catBtn, on && styles.catBtnOn]} onPress={() => setDraft((d) => ({ ...d, category: c }))} accessibilityRole="button" accessibilityState={{ selected: on }}>
                      <Ionicons name={CATEGORY_ICON[c]} size={20} color={on ? Colors.goldDark : Colors.navy} />
                      <Text style={[styles.catBtnText, on && styles.catBtnTextOn]} numberOfLines={1}>
                        {CATEGORY_LABEL[c]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <PickerRow icon="location-outline" label="Location" value={df.location || "Select Location"} open={picker === "location"} onToggle={() => toggle("location")}>
              {SEARCH_LOCATIONS.map((l) => (
                <Option key={l} label={l} on={df.location === l} onPress={() => setF({ location: df.location === l ? "" : l })} />
              ))}
            </PickerRow>

            <PickerRow icon="business-outline" label="Industry" value={df.industry || "Select Industry"} open={picker === "industry"} onToggle={() => toggle("industry")}>
              {SEARCH_INDUSTRIES.map((i) => (
                <Option key={i} label={i} on={df.industry === i} onPress={() => setF({ industry: df.industry === i ? "" : i })} />
              ))}
            </PickerRow>

            <PickerRow icon="calendar-outline" label="Date" value={dateLabel} open={picker === "days"} onToggle={() => toggle("days")}>
              {DATE_OPTIONS.map((o) => (
                <Option key={o.key} label={o.label} on={df.days === o.key} onPress={() => setF({ days: o.key })} />
              ))}
            </PickerRow>

            <View style={styles.switchRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.navy} />
              <Text style={styles.pickText}>Verified Members Only</Text>
              <Switch
                value={df.verifiedOnly}
                onValueChange={(v) => setF({ verifiedOnly: v })}
                trackColor={{ false: Colors.border, true: Colors.gold }}
                thumbColor={Colors.white}
                accessibilityLabel="Verified members only"
              />
            </View>

            <View>
              <Text style={styles.sheetLabel}>Sort By</Text>
              {GLOBAL_SORTS.map((s) => {
                const on = draft.sort === s.key;
                return (
                  <Pressable key={s.key} style={styles.sortRow} onPress={() => setDraft((d) => ({ ...d, sort: s.key }))} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                    <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <Text style={[styles.sortText, on && styles.sortTextOn]}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.sheetActions}>
            <Pressable style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]} onPress={reset} accessibilityRole="button">
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.applyWrap, pressed && styles.pressed]} onPress={apply} accessibilityRole="button">
              <LinearGradient colors={[Colors.champagne, Colors.gold, Colors.goldDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.applyBtn}>
                <Text style={styles.applyText}>Apply Filters</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Search Results" />
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={20} color={Colors.navy} />
            <TextInput
              style={styles.searchInput}
              value={text}
              onChangeText={setText}
              onSubmitEditing={submit}
              placeholder="Search members, opportunities, events..."
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel="Search"
            />
            {text ? (
              <Pressable
                onPress={() => {
                  setText("");
                  setSearch({ query: "" });
                }}
                hitSlop={8}
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          <Pressable style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]} onPress={openSheet} accessibilityRole="button" accessibilityLabel="Open filters and sort">
            <Ionicons name="options-outline" size={22} color={Colors.navy} />
            {filterCount > 0 ? <View style={styles.filterDot} /> : null}
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {CATEGORIES.map((c) => {
            const on = category === c;
            return (
              <Pressable key={c} style={styles.tab} onPress={() => setSearch({ category: c })} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <View style={styles.tabTop}>
                  <Text style={[styles.tabText, on && styles.tabTextOn]}>{CATEGORY_LABEL[c]}</Text>
                  <View style={[styles.count, on && styles.countOn]}>
                    <Text style={[styles.countText, on && styles.countTextOn]}>{counts[c]}</Text>
                  </View>
                </View>
                <View style={[styles.underline, on && styles.underlineOn]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: 24 + insets.bottom }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {results.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={Colors.goldDark} />
            <Text style={styles.emptyTitle}>No {CATEGORY_LABEL[category]} Found</Text>
            <Text style={styles.emptyText}>Try a different keyword, another category, or fewer filters.</Text>
            {filterCount > 0 ? (
              <Pressable style={({ pressed }) => [styles.resetBtn, styles.clearBtn, pressed && styles.pressed]} onPress={() => setSearch({ filters: EMPTY_GLOBAL_FILTERS, sort: "relevance" })} accessibilityRole="button">
                <Text style={styles.resetText}>Clear Filters</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          results.map((item) => <ResultRow key={`${item.kind}-${item.id}`} item={item} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
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
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.navy, padding: 0 },
  filterBtn: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  filterDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.goldDark },

  tabs: { gap: 20 },
  tab: { gap: 8 },
  tabTop: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 4 },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 13 },
  tabTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  count: { minWidth: 20, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: "#EEF1F5", alignItems: "center", justifyContent: "center" },
  countOn: { backgroundColor: Colors.gold },
  countText: { color: Colors.textSecondary, fontFamily: Fonts.bold, fontSize: 10 },
  countTextOn: { color: Colors.white },
  underline: { height: 3, borderRadius: 2, backgroundColor: "transparent" },
  underlineOn: { backgroundColor: Colors.goldDark },

  list: { paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  thumb: { width: 64, height: 64, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  mark: { fontFamily: Fonts.bold, fontSize: 18 },
  rowInfo: { flex: 1, gap: 2 },
  badge: { alignSelf: "flex-start", backgroundColor: GOLD_BG, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 2 },
  badgeText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  line: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 1 },
  metaText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, flexShrink: 1 },

  empty: { alignItems: "center", gap: 10, paddingTop: 56, paddingHorizontal: 16 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center" },
  clearBtn: { alignSelf: "stretch", flex: 0, marginTop: 12 },

  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "88%", backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 12 },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  sheetBody: { gap: 16, paddingBottom: 12 },
  sheetLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginBottom: 8 },
  catRow: { flexDirection: "row", gap: 8 },
  catBtn: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: "#F1F4FA", borderWidth: 1, borderColor: "transparent" },
  catBtnOn: { backgroundColor: GOLD_BG, borderColor: Colors.gold },
  catBtnText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 10 },
  catBtnTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  pickRow: { flexDirection: "row", alignItems: "center", gap: 12, height: 44, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  pickText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  pickMuted: { color: Colors.textSecondary },
  optionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 10 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: Colors.border },
  optionOn: { borderColor: Colors.gold, backgroundColor: GOLD_BG },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
  optionTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.goldDark },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.goldDark },
  sortText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  sortTextOn: { fontFamily: Fonts.semiBold },
  sheetActions: { flexDirection: "row", gap: 12, paddingTop: 12 },
  resetBtn: { flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  resetText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
  applyWrap: { flex: 1.4 },
  applyBtn: { height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
});
