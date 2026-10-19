import { OnlineDot } from "@/components/chat-ui";
import { BackHeader, PersonAvatar } from "@/components/intro-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { MEMBERS, type Member } from "@/data/members";
import { useConversations } from "@/lib/chat-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUGGESTED = ["Amit Goyal", "Sneha Bansal", "Rahul Agarwal", "Priya Mittal"];

export default function NewMessage() {
  const insets = useSafeAreaInsets();
  const conversations = useConversations();
  const [query, setQuery] = useState("");
  const online = new Set(conversations.filter((c) => c.online).map((c) => c.name));

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = MEMBERS.filter((m) => !m.restricted && (!q || [m.name, m.role, m.company].join(" ").toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
    const byLetter = new Map<string, Member[]>();
    hits.forEach((m) => byLetter.set(m.name[0].toUpperCase(), [...(byLetter.get(m.name[0].toUpperCase()) ?? []), m]));
    return [...byLetter].map(([title, data]) => ({ title, data }));
  }, [query]);

  const start = (name: string) => router.replace({ pathname: "/chat", params: { name } });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <BackHeader title="New Message" />
      </View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search members..." placeholderTextColor={Colors.textMuted} style={styles.searchInput} autoCorrect={false} />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(m) => m.name}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          query ? null : (
            <View style={styles.suggested}>
              <Text style={styles.suggestedTitle}>Suggested Members</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedRow}>
                {SUGGESTED.map((n) => (
                  <Pressable key={n} onPress={() => start(n)} style={styles.suggestedItem} accessibilityRole="button" accessibilityLabel={`Message ${n}`}>
                    <View>
                      <PersonAvatar name={n} size={56} />
                      {online.has(n) ? <OnlineDot style={styles.dot} /> : null}
                    </View>
                    <Text style={styles.suggestedName} numberOfLines={1}>
                      {n.split(" ")[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )
        }
        ListEmptyComponent={<Text style={styles.empty}>No members found</Text>}
        renderSectionHeader={({ section }) => (
          <View style={styles.letter}>
            <Text style={styles.letterText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item: m }) => (
          <Pressable onPress={() => start(m.name)} style={styles.row} accessibilityRole="button" accessibilityLabel={`Message ${m.name}`}>
            <PersonAvatar name={m.name} size={48} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {m.name}
              </Text>
              <Text style={styles.role} numberOfLines={1}>
                {m.role}
              </Text>
              <Text style={styles.company} numberOfLines={1}>
                {m.company}
              </Text>
            </View>
            <View style={styles.add}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.goldDark} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, marginHorizontal: 16, marginTop: 4, paddingHorizontal: 14, borderRadius: Radius.md, backgroundColor: "#F1F4F8" },
  searchInput: { flex: 1, padding: 0, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  suggested: { paddingTop: 16, paddingBottom: 8 },
  suggestedTitle: { paddingHorizontal: 16, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  suggestedRow: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  suggestedItem: { alignItems: "center", gap: 6, width: 64 },
  suggestedName: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  dot: { position: "absolute", right: 0, bottom: 0 },
  letter: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: "#F1F4F8" },
  letterText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  info: { flex: 1, minWidth: 0 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  company: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  add: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", marginTop: 40, color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
});
