import { GOLD_BG, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CITIES, INDUSTRIES } from "@/data/members";
import { setMapFilters, useMapFilters } from "@/lib/map-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MapFilters() {
  const insets = useSafeAreaInsets();
  const applied = useMapFilters();
  const [city, setCity] = useState(applied.city);
  const [industries, setIndustries] = useState(applied.industries);

  const toggleIndustry = (o: string) => setIndustries((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  const apply = () => {
    setMapFilters({ city, industries });
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="Refine Map"
          right={
            <Pressable
              onPress={() => {
                setCity("");
                setIndustries([]);
              }}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.clear}>Clear All</Text>
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="location" size={18} color={Colors.navy} />
            <Text style={styles.sectionTitle}>Select City</Text>
          </View>
          <View style={styles.chips}>
            {CITIES.map((c) => {
              const on = city === c;
              return (
                <Pressable key={c} onPress={() => setCity(c)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="briefcase" size={18} color={Colors.navy} />
            <Text style={styles.sectionTitle}>Select Industry</Text>
          </View>
          <View style={styles.chips}>
            {INDUSTRIES.map((o) => {
              const on = industries.includes(o);
              return (
                <Pressable key={o} onPress={() => toggleIndustry(o)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={apply} accessibilityRole="button">
          <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.apply}>
            <Ionicons name="funnel-outline" size={18} color={Colors.white} />
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
  clear: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 24 },
  section: { gap: 12 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { height: 38, paddingHorizontal: 18, borderRadius: 19, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#F1F4FA", alignItems: "center", justifyContent: "center" },
  chipOn: { borderColor: Colors.gold, backgroundColor: GOLD_BG },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  chipTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  apply: { height: 50, borderRadius: Radius.md, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
