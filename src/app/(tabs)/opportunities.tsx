import { FeaturedOppCard, OppCard, SearchBar, ChipRow } from "@/components/opportunity-ui";
import { Colors, Fonts } from "@/constants/theme";
import { CATEGORIES, EMPTY_FILTERS, activeFilterCount, searchOpportunities } from "@/data/opportunities";
import { useUnreadCount } from "@/lib/notification-store";
import { setOpportunities, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CHIPS = ["All", ...CATEGORIES] as const;

export default function Opportunities() {
  const insets = useSafeAreaInsets();
  const unreadCount = useUnreadCount();
  const { filters, sort } = useOpportunities();
  const [text, setText] = useState("");

  // The feed only reacts to the quick category chips; the free-text query opens Results.
  const feed = useMemo(() => searchOpportunities("", { ...EMPTY_FILTERS, category: filters.category }, sort), [filters.category, sort]);
  const featured = feed.filter((o) => o.status === "Featured");
  const recommended = featured.length ? featured.slice(0, 1) : feed.slice(0, 1);
  const more = feed.filter((o) => !recommended.includes(o));

  const search = () => {
    setOpportunities({ query: text.trim() });
    router.push("/opportunity-results");
  };
  const openFilters = () => {
    setOpportunities({ query: text.trim() });
    router.push("/filter-opportunities");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 24 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Image source={require("../../../assets/images/abln-logo-light.png")} style={styles.logo} resizeMode="contain" />
          <View style={styles.topActions}>
            <Pressable style={styles.bell} hitSlop={6} onPress={() => router.push("/my-opportunities")} accessibilityLabel="My opportunities">
              <Ionicons name="briefcase-outline" size={21} color={Colors.navy} />
            </Pressable>
            <Pressable style={styles.bell} hitSlop={6} onPress={() => router.push("/notifications")} accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={22} color={Colors.navy} />
              {unreadCount > 0 ? <View style={styles.bellDot} /> : null}
            </Pressable>
            <Image source={require("../../../assets/images/avatar-user.png")} style={styles.avatarSm} />
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Business Opportunities</Text>
          <Text style={styles.heroText}>Discover new partnerships, investments and collaborations within the ABLN network.</Text>
        </View>

        <SearchBar value={text} onChangeText={setText} onSubmit={search} onClear={() => setText("")} placeholder="Search opportunities..." onFilter={openFilters} filterCount={activeFilterCount(filters)} />

        <ChipRow scroll options={CHIPS} selected={filters.category} onSelect={(c) => setOpportunities({ filters: { ...filters, category: c } })} />

        {feed.length === 0 ? (
          <Text style={styles.none}>No opportunities in this category yet.</Text>
        ) : (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <Pressable
                onPress={() => {
                  setOpportunities({ query: "" });
                  router.push("/opportunity-results");
                }}
                hitSlop={8}
                style={styles.viewAll}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.goldDark} />
              </Pressable>
            </View>
            {recommended.map((o) => (
              <FeaturedOppCard key={o.id} o={o} />
            ))}
            {more.map((o) => (
              <OppCard key={o.id} o={o} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 16, gap: 14 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { width: 130, height: 50 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  bell: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  bellDot: { position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  avatarSm: { width: 42, height: 42, borderRadius: 21 },

  hero: { gap: 6 },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32 },
  heroText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },

  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 32 },
});
