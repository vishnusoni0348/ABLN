import { WideBtn } from "@/components/ask-ui";
import { PersonAvatar } from "@/components/intro-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EXPERT_NAMES } from "@/data/answers";
import { findMember, type Member } from "@/data/members";
import { MAX_CATEGORIES, QCATEGORIES } from "@/data/questions";
import { setDraft, toggleDraftCategory, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EXPERTS = EXPERT_NAMES.map((n) => findMember(n)).filter((m): m is Member => !!m);

export default function AskCategory() {
  const insets = useSafeAreaInsets();
  const { draft } = useQuestions();
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();
  const experts = EXPERTS.filter((m) => !needle || [m.name, m.industry, m.company, ...m.expertise, ...m.tags].join(" ").toLowerCase().includes(needle));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="Select Category & Expert" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.h}>Select a Category</Text>
        <Text style={styles.sub}>Choose up to {MAX_CATEGORIES} relevant categories for your question.</Text>
        <View style={styles.grid}>
          {QCATEGORIES.map((c) => {
            const on = draft.categories.includes(c.key);
            return (
              <Pressable key={c.key} onPress={() => toggleDraftCategory(c.key)} style={[styles.cat, on && styles.catOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
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

        <Text style={[styles.h, { marginTop: 24 }]}>
          Ask a Specific Expert <Text style={styles.opt}>(Optional)</Text>
        </Text>
        <Text style={styles.sub}>If you have someone specific in mind, you can select an expert.</Text>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search experts by name, industry or expertise" placeholderTextColor={Colors.textMuted} style={styles.searchInput} autoCorrect={false} />
        </View>

        {experts.length === 0 ? <Text style={styles.none}>No experts match your search.</Text> : null}
        {experts.map((m) => {
          const on = draft.expert === m.name;
          return (
            <Pressable key={m.name} style={styles.expert} onPress={() => setDraft({ expert: on ? undefined : m.name })} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <PersonAvatar name={m.name} size={52} />
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{m.name}</Text>
                  {m.verified ? <Ionicons name="ribbon" size={13} color={Colors.gold} /> : null}
                </View>
                <Text style={styles.role} numberOfLines={1}>
                  {m.role}, {m.company}
                </Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{m.expertise[0] ?? m.industry}</Text>
                </View>
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <WideBtn label="Back" icon="arrow-back" outline onPress={() => router.back()} />
        <WideBtn label="Continue" icon="arrow-forward" trailing disabled={!draft.categories.length} onPress={() => router.push("/ask-review")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 8 },
  opt: { color: Colors.textSecondary, fontFamily: Fonts.regular },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2, marginBottom: 12 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  cat: { width: "31.5%", minHeight: 84, padding: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: "#E3E9F2", backgroundColor: "#F5F8FD", alignItems: "center", justifyContent: "center", gap: 6 },
  catOn: { borderColor: Colors.gold, backgroundColor: "#FDF3DC" },
  catText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11, textAlign: "center" },
  tick: { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },

  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, padding: 0, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
  none: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, paddingVertical: 24 },

  expert: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  pill: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: "#FDF0D2" },
  pillText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.gold },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.gold },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
