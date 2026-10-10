import { FeaturedPartnerCard, PartnerRow } from "@/components/partner-ui";
import { SearchBar } from "@/components/opportunity-ui";
import { HeaderIconButton, TabHeader } from "@/components/tab-header";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PARTNERS, activePartnerFilterCount } from "@/data/partners";
import { setPartners, usePartners } from "@/lib/partner-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Partners() {
  const { filters } = usePartners();
  const [text, setText] = useState("");

  const featured = PARTNERS.filter((p) => p.featured);

  // The directory ignores filters; they apply on the results screen.
  const search = () => {
    setPartners({ query: text.trim() });
    router.push("/partner-results");
  };
  const openFilters = () => {
    setPartners({ query: text.trim() });
    router.push("/filter-partners");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TabHeader extraActions={<HeaderIconButton icon="ticket-outline" onPress={() => router.push("/my-redemptions")} label="My offers" />} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.heroTitle}>Partners</Text>

        <LinearGradient colors={["#031225", "#0B2A4A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <Text style={styles.bannerText}>Exclusive Benefits{"\n"}for ABLN Members</Text>
          <Ionicons name="trophy" size={52} color={Colors.champagne} />
        </LinearGradient>

        <SearchBar value={text} onChangeText={setText} onSubmit={search} onClear={() => setText("")} placeholder="Search partners, categories..." onFilter={openFilters} filterCount={activePartnerFilterCount(filters)} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Partners</Text>
          <Pressable
            hitSlop={8}
            onPress={() => {
              setPartners({ query: "" });
              router.push({ pathname: "/partner-results", params: { tab: "Featured" } });
            }}
            accessibilityRole="button"
          >
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.featuredRow}>
          {featured.map((p) => (
            <FeaturedPartnerCard key={p.id} p={p} />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>All Partners</Text>
        <View>
          {PARTNERS.map((p) => (
            <PartnerRow key={p.id} p={p} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 14 },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32 },
  banner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderRadius: Radius.lg },
  bannerText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 18, lineHeight: 25 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  seeAll: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  bleed: { flexGrow: 0, marginHorizontal: -16 },
  featuredRow: { paddingHorizontal: 16, paddingVertical: 4, gap: 12 },
});
