import { Avatar, ConnectButton, GOLD_BG, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CATEGORIES, CATEGORY_LABEL, EMPTY_GLOBAL_FILTERS, POPULAR_SEARCHES, suggestKeywords, suggestMembers, type SearchCategory } from "@/data/global-search";
import { toggleRequest, useDirectory } from "@/lib/directory-store";
import { clearRecent, removeRecent, runSearch, setSearch, useSearch } from "@/lib/search-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const CATEGORY_UI: Record<SearchCategory, { icon: IconName; hint: string; tint: string; color: string }> = {
  members: { icon: "person-outline", hint: "Business leaders, experts, mentors", tint: "#E8EEFB", color: "#2F6FDE" },
  opportunities: { icon: "briefcase-outline", hint: "Business deals, collaborations", tint: "#E3F5EC", color: Colors.success },
  events: { icon: "calendar-outline", hint: "Upcoming events, webinars, meetups", tint: GOLD_BG, color: Colors.goldDark },
  partners: { icon: "business-outline", hint: "Trusted service providers", tint: "#E8EEFB", color: Colors.royalNavy },
};

export default function GlobalSearch() {
  const insets = useSafeAreaInsets();
  const { recent } = useSearch();
  const { requested } = useDirectory();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  const typing = text.trim().length > 0;
  const suggesting = typing || focused;

  const submit = (term: string, category: SearchCategory = "members") => {
    if (!term.trim()) return;
    runSearch(term);
    setSearch({ category });
    router.push("/global-results");
  };

  const browse = (category: SearchCategory) => {
    setSearch({ query: "", category, filters: EMPTY_GLOBAL_FILTERS, sort: "relevance" });
    router.push("/global-results");
  };

  const keywords = suggestKeywords(text);
  const people = typing ? suggestMembers(text) : [];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 24 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={suggesting ? "Search Suggestions" : "Global Search"} />

        {!suggesting ? (
          <View style={styles.intro}>
            <Text style={styles.title}>Global Search</Text>
            <Text style={styles.subtitle}>Find members, opportunities, events, partners and more across ABLN.</Text>
          </View>
        ) : null}

        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={Colors.navy} />
          <TextInput
            placeholder="Search members, opportunities, events..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            value={text}
            onChangeText={setText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => submit(text)}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search"
          />
          {typing ? (
            <Pressable onPress={() => setText("")} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {!suggesting ? (
          <>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((c) => (
                <Pressable key={c} style={({ pressed }) => [styles.catChip, { backgroundColor: CATEGORY_UI[c].tint }, pressed && styles.pressed]} onPress={() => browse(c)} accessibilityRole="button">
                  <Ionicons name={CATEGORY_UI[c].icon} size={20} color={CATEGORY_UI[c].color} />
                  <Text style={styles.catChipText}>{CATEGORY_LABEL[c]}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.section, styles.sectionGap]}>Popular Searches</Text>
            {CATEGORIES.map((c) => (
              <Pressable key={c} style={({ pressed }) => [styles.popRow, pressed && styles.pressed]} onPress={() => browse(c)} accessibilityRole="button">
                <View style={[styles.popIcon, { backgroundColor: CATEGORY_UI[c].tint }]}>
                  <Ionicons name={CATEGORY_UI[c].icon} size={22} color={CATEGORY_UI[c].color} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.popTitle}>{CATEGORY_LABEL[c]}</Text>
                  <Text style={styles.popHint}>{CATEGORY_UI[c].hint}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </Pressable>
            ))}
          </>
        ) : (
          <>
            {recent.length > 0 && !typing ? (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.section}>Recent Searches</Text>
                  <Pressable onPress={clearRecent} hitSlop={8}>
                    <Text style={styles.link}>Clear All</Text>
                  </Pressable>
                </View>
                {recent.map((r) => (
                  <Pressable key={r} style={styles.termRow} onPress={() => submit(r)} accessibilityRole="button">
                    <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.term} numberOfLines={1}>
                      {r}
                    </Text>
                    <Pressable onPress={() => removeRecent(r)} hitSlop={10} accessibilityLabel={`Remove ${r}`}>
                      <Ionicons name="close" size={16} color={Colors.textSecondary} />
                    </Pressable>
                  </Pressable>
                ))}
              </>
            ) : null}

            {typing ? (
              <>
                <Text style={styles.section}>Suggested Searches</Text>
                {keywords.map((k) => (
                  <Pressable key={k} style={styles.termRow} onPress={() => submit(k)} accessibilityRole="button">
                    <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.term} numberOfLines={1}>
                      {k}
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : recent.length === 0 ? (
              <>
                <Text style={styles.section}>Popular Searches</Text>
                {POPULAR_SEARCHES.map((k) => (
                  <Pressable key={k} style={styles.termRow} onPress={() => submit(k)} accessibilityRole="button">
                    <Ionicons name="trending-up-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.term}>{k}</Text>
                  </Pressable>
                ))}
              </>
            ) : null}

            {people.length > 0 ? (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.section}>Suggested Members</Text>
                  <Pressable onPress={() => submit(text, "members")} hitSlop={8}>
                    <Text style={styles.link}>See All</Text>
                  </Pressable>
                </View>
                {people.map((p) => (
                  <Pressable key={p.id} style={styles.personRow} onPress={() => router.push({ pathname: "/member-profile", params: { name: p.id } })} accessibilityRole="button">
                    <Avatar name={p.title} photo={p.photo} size={52} />
                    <View style={styles.flex}>
                      <Text style={styles.popTitle} numberOfLines={1}>
                        {p.title}
                      </Text>
                      <Text style={styles.popHint} numberOfLines={1}>
                        {p.line1}
                      </Text>
                      <Text style={styles.popHint} numberOfLines={1}>
                        {p.line2}
                      </Text>
                    </View>
                    <ConnectButton requested={requested.includes(p.id)} onPress={() => toggleRequest(p.id)} />
                  </Pressable>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  intro: { gap: 6, marginTop: 4 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 28 },
  subtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.navy, padding: 0 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catChip: { flexBasis: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: Radius.lg },
  catChipText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  section: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 4 },
  sectionGap: { marginTop: 12 },
  link: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  popRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  popIcon: { width: 54, height: 54, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  popTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  popHint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  termRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  term: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
});
