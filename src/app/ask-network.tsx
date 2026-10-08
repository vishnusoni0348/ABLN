import { GoldFill, LoadingFooter, QuestionCard, SearchField, useInfinite } from "@/components/ask-ui";
import { NetworkTabBar } from "@/components/intro-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { QCATEGORIES, searchQuestions } from "@/data/questions";
import { resetDraft, setQFilters, setQTab, type QTab, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: QTab[] = ["Latest", "Trending", "Unanswered"];

export default function AskNetwork() {
  const insets = useSafeAreaInsets();
  const { filters, tab, posted } = useQuestions();
  const [text, setText] = useState("");

  const cat = filters.categories.length === 1 ? filters.categories[0] : undefined;
  const list = searchQuestions({ query: "", categories: filters.categories, sort: tab === "Trending" ? "trending" : "latest", type: tab === "Unanswered" ? "unanswered" : "all" }, posted);
  const { shown, hasMore, loading, loadMore } = useInfinite(`${tab}|${filters.categories.join()}`, list.length);

  const search = () => {
    setQFilters({ query: text.trim() });
    router.push("/ask-results");
  };
  const ask = () => {
    resetDraft();
    router.push("/ask-question");
  };

  const header = (
    <View style={styles.header}>
      <SearchField
        value={text}
        onChange={setText}
        onSubmit={search}
        onFilter={() => {
          setQFilters({ query: text.trim() });
          router.push("/ask-filter");
        }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        {[{ key: undefined, label: "All" }, ...QCATEGORIES.map((c) => ({ key: c.key, label: c.short }))].map((c) => {
          const on = cat === c.key;
          return (
            <Pressable key={c.label} onPress={() => setQFilters({ categories: c.key ? [c.key] : [] })} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.hero}>
        <View style={styles.flex}>
          <Text style={styles.heroTitle}>Ask. Learn. Grow Together.</Text>
          <Text style={styles.heroSub}>Get expert advice, share your knowledge and connect with the ABLN network.</Text>
          <Pressable onPress={ask} accessibilityRole="button">
            <GoldFill style={styles.heroBtn}>
              <Ionicons name="help-circle-outline" size={16} color={Colors.white} />
              <Text style={styles.heroBtnText}>Ask a Question</Text>
            </GoldFill>
          </Pressable>
        </View>
        <View style={styles.heroArt}>
          <Ionicons name="help-circle" size={64} color="#2F6FDE" />
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setQTab(t)} style={[styles.tab, tab === t && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="Ask Network" />
      </View>
      <FlatList
        data={list.slice(0, shown)}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => <QuestionCard q={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={styles.empty}>No questions here yet.</Text>}
        ListFooterComponent={list.length ? <LoadingFooter loading={loading} hasMore={hasMore} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <Pressable onPress={ask} style={styles.fabWrap} accessibilityRole="button" accessibilityLabel="Ask a Question">
        <GoldFill style={styles.fab}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.fabText}>Ask a Question</Text>
        </GoldFill>
      </Pressable>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 90 },
  header: { gap: 14, paddingBottom: 14 },
  bleed: { marginHorizontal: -16 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 16, height: 34, borderRadius: 17, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  chipOn: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
  chipTextOn: { color: Colors.white, fontFamily: Fonts.bold },

  hero: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FDF3DC" },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  heroSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 10 },
  heroBtn: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 14, borderRadius: Radius.sm },
  heroBtnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 12 },
  heroArt: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },

  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: Colors.gold },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  tabTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },

  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, paddingVertical: 32 },
  fabWrap: { position: "absolute", right: 16, bottom: 94 },
  fab: { flexDirection: "row", alignItems: "center", gap: 6, height: 46, paddingHorizontal: 18, borderRadius: 23, shadowColor: Colors.navy, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  fabText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 13 },
});
