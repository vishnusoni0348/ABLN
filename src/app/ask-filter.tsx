import { GoldFill } from "@/components/ask-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EMPTY_Q, QCATEGORIES, type QCategory, QSORTS, type QSort, QTYPES, type QType } from "@/data/questions";
import { setQFilters, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Radio({ on }: { on: boolean }) {
  return <View style={[styles.radio, on && styles.radioOn]}>{on ? <Ionicons name="checkmark" size={12} color={Colors.white} /> : null}</View>;
}

export default function AskFilter() {
  const insets = useSafeAreaInsets();
  const { filters } = useQuestions();
  const [cats, setCats] = useState<QCategory[]>(filters.categories);
  const [sort, setSort] = useState<QSort>(filters.sort);
  const [type, setType] = useState<QType>(filters.type);

  const toggle = (c: QCategory) => setCats((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]));
  const reset = () => {
    setCats(EMPTY_Q.categories);
    setSort(EMPTY_Q.sort);
    setType(EMPTY_Q.type);
  };
  const apply = () => {
    setQFilters({ categories: cats, sort, type });
    router.replace("/ask-results");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={24} color={Colors.navy} />
        </Pressable>
        <Text style={styles.title}>Filter & Sort</Text>
        <Pressable onPress={reset} hitSlop={8} accessibilityRole="button">
          <Text style={styles.clear}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h}>Categories</Text>
        <Text style={styles.sub}>Select one or more categories</Text>
        <View style={styles.grid}>
          {QCATEGORIES.map((c) => {
            const on = cats.includes(c.key);
            return (
              <Pressable key={c.key} onPress={() => toggle(c.key)} style={[styles.cat, on && styles.catOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                {on ? (
                  <View style={styles.tick}>
                    <Ionicons name="checkmark" size={11} color={Colors.white} />
                  </View>
                ) : null}
                <Ionicons name={c.icon} size={24} color={on ? Colors.goldDark : "#2F6FDE"} />
                <Text style={styles.catText} numberOfLines={2}>
                  {c.key}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.h, { marginTop: 22 }]}>Sort By</Text>
        {QSORTS.map((s) => (
          <Pressable key={s.key} onPress={() => setSort(s.key)} style={[styles.row, sort === s.key && styles.rowOn]} accessibilityRole="radio" accessibilityState={{ selected: sort === s.key }}>
            <Radio on={sort === s.key} />
            <Text style={styles.rowText}>{s.label}</Text>
          </Pressable>
        ))}

        <Text style={[styles.h, { marginTop: 22 }]}>Question Type</Text>
        {QTYPES.map((t) => (
          <Pressable key={t.key} onPress={() => setType(t.key)} style={[styles.row, type === t.key && styles.rowOn]} accessibilityRole="radio" accessibilityState={{ selected: type === t.key }}>
            <Radio on={type === t.key} />
            <Text style={styles.rowText}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.reset} onPress={reset} accessibilityRole="button">
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
        <Pressable style={styles.apply} onPress={apply} accessibilityRole="button">
          <GoldFill style={styles.applyInner}>
            <Text style={styles.applyText}>Apply Filters</Text>
          </GoldFill>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 52, paddingHorizontal: 16 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  clear: { color: "#2F6FDE", fontFamily: Fonts.semiBold, fontSize: 13 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginBottom: 6 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginBottom: 12 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  cat: { width: "31.5%", minHeight: 84, padding: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: "#E3E9F2", backgroundColor: "#F5F8FD", alignItems: "center", justifyContent: "center", gap: 6 },
  catOn: { borderColor: Colors.gold, backgroundColor: "#FDF3DC" },
  catText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11, textAlign: "center" },
  tick: { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },

  row: { flexDirection: "row", alignItems: "center", gap: 12, height: 44, paddingHorizontal: 12, marginTop: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: "#E3E9F2", backgroundColor: "#F5F8FD" },
  rowOn: { borderColor: Colors.gold, backgroundColor: "#FDF3DC" },
  rowText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  radioOn: { borderColor: Colors.gold, backgroundColor: Colors.gold },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  reset: { flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  resetText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
  apply: { flex: 1.4 },
  applyInner: { height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
});
