import { FaqRow } from "@/components/help-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { findFaq, Faq } from "@/data/help";
import { useSavedFaqs } from "@/lib/faq-store";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function SavedFaqs() {
  const ids = useSavedFaqs();
  const faqs = ids.map(findFaq).filter((f): f is Faq => !!f);

  return (
    <SettingsScreen title="Saved FAQs">
      {faqs.length ? (
        <>
          <Text style={styles.count}>{faqs.length} Saved {faqs.length === 1 ? "Answer" : "Answers"}</Text>
          {faqs.map((f) => (
            <FaqRow key={f.id} faq={f} />
          ))}
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved FAQs yet</Text>
          <Text style={styles.emptySub}>Tap the bookmark icon on any answer to keep it here for later.</Text>
        </View>
      )}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  count: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  empty: { alignItems: "center", gap: 8, marginTop: 60, paddingHorizontal: 24 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  emptySub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center" },
});
