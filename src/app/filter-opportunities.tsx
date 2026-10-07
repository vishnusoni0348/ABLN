import { ScreenHeader } from "@/components/member-ui";
import { ChipRow, GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CATEGORIES, EMPTY_FILTERS, type Filters, OPP_INDUSTRIES, OPP_LOCATIONS, POSTED_BY, SORT_OPTIONS, STATUSES, VALUE_RANGES, type SortKey } from "@/data/opportunities";
import { setOpportunities, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

function Select({ placeholder, value, options, onChange }: { placeholder: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const label = options.find((o) => o.value === value)?.label ?? "";
  return (
    <View>
      <Pressable style={styles.select} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={placeholder}>
        <Text style={[styles.selectText, !label && styles.selectPlaceholder]} numberOfLines={1}>
          {label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.navy} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{placeholder}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((o) => {
              const on = o.value === value;
              return (
                <Pressable
                  key={o.value || "any"}
                  style={styles.option}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, on && styles.optionOn]}>{o.label}</Text>
                  {on ? <Ionicons name="checkmark" size={18} color={Colors.goldDark} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const withAny = (items: string[]) => [{ value: "", label: "Any" }, ...items.map((i) => ({ value: i, label: i }))];

export default function FilterOpportunities() {
  const insets = useSafeAreaInsets();
  const { query, filters, sort } = useOpportunities();
  const [draft, setDraft] = useState<Filters>(filters);
  const [draftQuery, setDraftQuery] = useState(query);
  const [draftSort, setDraftSort] = useState<SortKey>(sort);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const valueOptions = [ALL, ...VALUE_RANGES.map((r) => r.label)];
  const valueLabel = VALUE_RANGES.find((r) => r.key === draft.value)?.label ?? ALL;

  const clear = () => {
    setDraft(EMPTY_FILTERS);
    setDraftQuery("");
    setDraftSort("recent");
  };
  const apply = () => {
    setOpportunities({ query: draftQuery.trim(), filters: draft, sort: draftSort });
    router.navigate("/opportunity-results");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="Filter Opportunities"
          right={
            <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close filters">
              <Ionicons name="close" size={24} color={Colors.navy} />
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Section title="Search">
          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={Colors.navy} />
            <TextInput
              placeholder="Search by title, keyword or company..."
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              value={draftQuery}
              onChangeText={setDraftQuery}
              returnKeyType="done"
              autoCorrect={false}
            />
          </View>
        </Section>

        <Section title="Opportunity Category">
          <ChipRow options={[ALL, ...CATEGORIES]} selected={draft.category} onSelect={(c) => set("category", c as Filters["category"])} />
        </Section>

        <Section title="Industry">
          <Select placeholder="Select industry" value={draft.industry} options={withAny(OPP_INDUSTRIES)} onChange={(v) => set("industry", v)} />
        </Section>

        <Section title="Location">
          <Select placeholder="Select location" value={draft.location} options={withAny(OPP_LOCATIONS)} onChange={(v) => set("location", v)} />
        </Section>

        <Section title="Value Range">
          <ChipRow options={valueOptions} selected={valueLabel} onSelect={(l) => set("value", VALUE_RANGES.find((r) => r.label === l)?.key ?? "")} />
        </Section>

        <Section title="Opportunity Status">
          <ChipRow options={[ALL, ...STATUSES]} selected={draft.status} onSelect={(s) => set("status", s as Filters["status"])} />
        </Section>

        <Section title="Posted By">
          <ChipRow options={[ALL, ...POSTED_BY]} selected={draft.postedBy} onSelect={(p) => set("postedBy", p as Filters["postedBy"])} />
        </Section>

        <Section title="Sort By">
          <Select placeholder="Sort by" value={draftSort} options={SORT_OPTIONS.map((o) => ({ value: o.key, label: o.label }))} onChange={(v) => setDraftSort(v as SortKey)} />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={({ pressed }) => [styles.clear, pressed && styles.pressed]} onPress={clear}>
          <Text style={styles.clearText}>Clear All</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.applyWrap, pressed && styles.pressed]} onPress={apply}>
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
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 18 },

  section: { gap: 10 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.navy, padding: 0 },

  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 46, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  selectText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  selectPlaceholder: { color: Colors.textSecondary },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  clear: { flex: 1, height: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  clearText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  applyWrap: { flex: 1.4 },
  apply: { height: 46, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, maxHeight: "70%" },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginBottom: 4 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  optionOn: { fontFamily: Fonts.bold, color: Colors.goldDark },
});
