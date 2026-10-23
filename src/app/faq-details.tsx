import { CARD_SHADOW } from "@/components/member-ui";
import { Card, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findFaq } from "@/data/help";
import { toggleSavedFaq, useSavedFaqs } from "@/lib/faq-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function FaqDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const faq = findFaq(id);
  const savedIds = useSavedFaqs();
  const saved = !!faq && savedIds.includes(faq.id);
  const [vote, setVote] = useState<"yes" | "no">();

  if (!faq) {
    return (
      <SettingsScreen title="FAQ Details">
        <Text style={styles.body}>This help topic could not be found.</Text>
      </SettingsScreen>
    );
  }

  const bookmark = (
    <Pressable onPress={() => toggleSavedFaq(faq.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={saved ? "Remove bookmark" : "Bookmark this answer"}>
      <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color={saved ? Colors.goldDark : Colors.navy} />
    </Pressable>
  );

  return (
    <SettingsScreen title="FAQ Details" right={bookmark}>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{faq.category}</Text>
      </View>
      <Text style={styles.q}>{faq.q}</Text>
      <Text style={styles.updated}>Last updated: {faq.updated}</Text>
      <Text style={styles.body}>{faq.a}</Text>

      {faq.steps ? (
        <View style={{ gap: 12 }}>
          <Text style={styles.h}>Step by Step Process</Text>
          {faq.steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {faq.note ? (
        <View style={styles.note}>
          <Ionicons name="bulb" size={22} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Note</Text>
            <Text style={styles.noteText}>{faq.note}</Text>
          </View>
        </View>
      ) : null}

      <Card style={{ gap: 12, alignItems: "center" }}>
        <Text style={styles.h}>{vote ? "Thanks for your feedback!" : "Was this helpful?"}</Text>
        {vote ? (
          vote === "no" ? (
            <Pressable onPress={() => router.push("/contact-support")} accessibilityRole="button">
              <Text style={styles.link}>Still need help? Contact support</Text>
            </Pressable>
          ) : null
        ) : (
          <View style={styles.voteRow}>
            <Pressable onPress={() => setVote("yes")} accessibilityRole="button" style={[styles.vote, { backgroundColor: "#FEF6E6" }]}>
              <Ionicons name="thumbs-up-outline" size={18} color={Colors.goldDark} />
              <Text style={styles.voteText}>Yes</Text>
            </Pressable>
            <Pressable onPress={() => setVote("no")} accessibilityRole="button" style={[styles.vote, { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border }]}>
              <Ionicons name="thumbs-down-outline" size={18} color={Colors.navy} />
              <Text style={styles.voteText}>No</Text>
            </Pressable>
          </View>
        )}
      </Card>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: "flex-start", backgroundColor: "#FEF6E6", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  q: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24, lineHeight: 30 },
  updated: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  body: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  step: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 12 },
  stepText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FEF6E6" },
  noteTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  noteText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
  voteRow: { flexDirection: "row", gap: 12, alignSelf: "stretch" },
  vote: { flex: 1, height: 46, borderRadius: Radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...CARD_SHADOW },
  voteText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  link: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
});
