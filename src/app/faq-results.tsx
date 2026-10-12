import { FaqRow, SearchBar } from "@/components/help-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { searchFaqs } from "@/data/help";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

export default function FaqResults() {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const category = params.category;

  const results = searchFaqs(query, category);
  const count = `${results.length} ${results.length === 1 ? "Result" : "Results"} Found`;

  return (
    <SettingsScreen title={category ?? "Search Results"}>
      <SearchBar value={query} onChangeText={setQuery} placeholder={category ? `Search in ${category}...` : "Search FAQs..."} autoFocus={!category && !params.q} />
      <Text style={styles.count}>{count}</Text>

      {results.length ? (
        results.map((f) => <FaqRow key={f.id} faq={f} />)
      ) : (
        <>
          <Text style={styles.empty}>No help topics match your search.</Text>
          <Text style={styles.link} onPress={() => router.push("/contact-support")}>
            Can&apos;t find an answer? Contact support
          </Text>
        </>
      )}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  count: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  empty: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", marginTop: 12 },
  link: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13, textAlign: "center" },
});
