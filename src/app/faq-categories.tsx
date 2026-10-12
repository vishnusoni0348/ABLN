import { SearchBar } from "@/components/help-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { FAQ_CATEGORIES } from "@/data/help";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function FaqCategories() {
  const [query, setQuery] = useState("");

  return (
    <SettingsScreen title="Frequently Asked Questions">
      <SearchBar value={query} onChangeText={setQuery} onSubmit={() => router.push({ pathname: "/faq-results", params: { q: query.trim() } })} />

      {FAQ_CATEGORIES.map((c) => (
        <Pressable
          key={c.key}
          onPress={() => router.push({ pathname: "/faq-results", params: { category: c.key } })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.icon}>
            <Ionicons name={c.icon} size={26} color={Colors.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.sub} numberOfLines={2}>
              {c.sub}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </Pressable>
      ))}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  icon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#FEF6E6", alignItems: "center", justifyContent: "center" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
});
