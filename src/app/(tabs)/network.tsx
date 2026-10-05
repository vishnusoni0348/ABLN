import { Avatar, ConnectButton, GOLD_BG, MemberRow, Tag } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EMPTY_FILTERS, type Filters, type SortKey } from "@/data/members";
import { setDirectory, toggleRequest, useDirectory } from "@/lib/directory-store";
import { useUnreadCount } from "@/lib/notification-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Image, ImageSourcePropType, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Member = { name: string; role: string; company: string; tags: string[]; photo: ImageSourcePropType };
type Joined = { name: string; role: string; company: string; location: string; tags: string[]; verified?: boolean; photo?: ImageSourcePropType };

// Sample content until the members API is wired up.
const CHIPS: { key: string; label: string; icon?: IconName }[] = [
  { key: "all", label: "All", icon: "grid-outline" },
  { key: "members", label: "Members", icon: "person-outline" },
  { key: "businesses", label: "Businesses", icon: "business-outline" },
  { key: "industries", label: "Industries", icon: "pricetag-outline" },
  { key: "more", label: "More" },
];

// Shortcuts behind the "More" chip; each opens Search Results with a preset.
const MORE: { key: string; label: string; icon: IconName; query?: string; sort?: SortKey; filters?: Partial<Filters> }[] = [
  { key: "verified", label: "Verified Members", icon: "checkmark-circle-outline", filters: { verifiedOnly: true } },
  { key: "recent", label: "Recently Joined", icon: "time-outline", sort: "recent" },
  { key: "investors", label: "Investors", icon: "trending-up-outline", query: "Investor" },
  { key: "nearest", label: "Nearest to Me", icon: "navigate-outline", sort: "nearest" },
  { key: "business", label: "Business Accounts", icon: "business-outline", filters: { memberType: "Business" } },
];

// network-hero-banner.jpg is the middle band of network-hero.png (head and shoulders plus the crowd), pre-cropped to 3.3:1.
const HERO_RATIO = 3.3;

const RECOMMENDED: Member[] = [
  { name: "Rahul Agarwal", role: "CEO", company: "TechVision Pvt Ltd", tags: ["Technology", "AI"], photo: require("../../../assets/images/member-rahul.png") },
  { name: "Sneha Bansal", role: "Founder", company: "GreenNest Solutions", tags: ["Sustainability", "Cleantech"], photo: require("../../../assets/images/member-sneha.png") },
  { name: "Amit Goyal", role: "Director", company: "Goyal Enterprises", tags: ["Manufacturing", "Supply Chain"], photo: require("../../../assets/images/member-amit.png") },
  { name: "Priya Mittal", role: "Co-Founder", company: "Kraftly Innovations", tags: ["E-commerce", "Marketing"], photo: require("../../../assets/images/member-priya.png") },
];

const INDUSTRIES: { name: string; count: string; icon: IconName }[] = [
  { name: "Technology", count: "1.2K+", icon: "hardware-chip-outline" },
  { name: "Healthcare", count: "980+", icon: "heart-outline" },
  { name: "Manufacturing", count: "650+", icon: "settings-outline" },
  { name: "E-commerce", count: "520+", icon: "cart-outline" },
  { name: "Finance", count: "480+", icon: "trending-up-outline" },
];

const RECENT: Joined[] = [
  { name: "Vikram Sethi", role: "Founder", company: "Sethi Group", location: "Jaipur, Rajasthan", tags: ["Real Estate", "Investment"], verified: true },
  { name: "Neha Sharma", role: "Business Head", company: "InnovaTech", location: "Delhi, India", tags: ["Technology", "Product"] },
  { name: "Karan Agarwal", role: "Investor", company: "Agarwal Capital", location: "Mumbai, India", tags: ["Finance", "Venture Capital"] },
  { name: "Ritika Jain", role: "Co-Founder", company: "MediCare Plus", location: "Bangalore, India", tags: ["Healthcare", "HealthTech"] },
];

function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable hitSlop={8} style={styles.viewAll} onPress={onPress}>
        <Text style={styles.viewAllText}>View All</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.goldDark} />
      </Pressable>
    </View>
  );
}

export default function Network() {
  const insets = useSafeAreaInsets();
  const [chip, setChip] = useState("all");
  const [query, setQuery] = useState("");
  const { requested } = useDirectory();
  const unreadCount = useUnreadCount();
  const [moreOpen, setMoreOpen] = useState(false);

  // Hands a search over to the Search Results screen.
  const openResults = (term: string) => {
    setDirectory({ query: term, filters: EMPTY_FILTERS });
    router.navigate("/search-results");
  };
  const openMore = (m: (typeof MORE)[number]) => {
    setMoreOpen(false);
    setDirectory({ query: m.query ?? "", filters: { ...EMPTY_FILTERS, ...m.filters }, sort: m.sort ?? "relevance" });
    router.navigate("/search-results");
  };

  const q = query.trim().toLowerCase();
  const hit = (...parts: string[]) => !q || parts.join(" ").toLowerCase().includes(q);
  const recommended = RECOMMENDED.filter((m) => hit(m.name, m.role, m.company, ...m.tags));
  const recent = RECENT.filter((m) => hit(m.name, m.role, m.company, m.location, ...m.tags));
  const industries = INDUSTRIES.filter((i) => hit(i.name));

  const isAll = chip === "all";
  const showRecommended = (isAll || chip === "members") && recommended.length > 0;
  const showIndustries = (isAll || chip === "industries") && industries.length > 0;
  const showRecent = (isAll || chip === "members") && recent.length > 0;
  const showBusinesses = chip === "businesses";
  const businesses = [...RECOMMENDED, ...RECENT].filter((m) => hit(m.company, m.name, ...m.tags));
  const hasResults = showRecommended || showIndustries || showRecent || (showBusinesses && businesses.length > 0);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMoreOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>More</Text>
          {MORE.map((m) => (
            <Pressable key={m.key} style={styles.moreRow} onPress={() => openMore(m)}>
              <View style={styles.moreIcon}>
                <Ionicons name={m.icon} size={20} color={Colors.goldDark} />
              </View>
              <Text style={styles.moreLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
          ))}
          <Pressable
            style={styles.moreRow}
            onPress={() => {
              setMoreOpen(false);
              router.navigate("/filter-members");
            }}
          >
            <View style={styles.moreIcon}>
              <Ionicons name="options-outline" size={20} color={Colors.goldDark} />
            </View>
            <Text style={styles.moreLabel}>Advanced Filters</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Image source={require("../../../assets/images/abln-logo-light.png")} style={styles.logo} resizeMode="contain" />
          <View style={styles.topActions}>
            <Pressable style={styles.bell} hitSlop={6} onPress={() => router.push("/notifications")} accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={22} color={Colors.navy} />
              {unreadCount > 0 ? <View style={styles.bellDot} /> : null}
            </Pressable>
            <Image source={require("../../../assets/images/avatar-user.png")} style={styles.avatarSm} />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Image source={require("../../../assets/images/network-hero-banner.jpg")} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={[Colors.white, "rgba(255,255,255,0.85)", "rgba(255,255,255,0)"]}
            locations={[0.15, 0.35, 0.6]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.heroTitle}>Network</Text>
          <Text style={styles.heroSub}>Connect, collaborate and grow with business leaders.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={20} color={Colors.navy} />
            <TextInput
              placeholder="Search members, businesses, industries..."
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              numberOfLines={1}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={() => query.trim() && openResults(query.trim())}
              autoCorrect={false}
            />
            {query ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            style={({ pressed }) => [styles.filter, pressed && styles.pressed]}
            onPress={() => router.navigate("/filter-members")}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <Ionicons name="options-outline" size={22} color={Colors.goldDark} />
          </Pressable>
        </View>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
          {CHIPS.map((c) => {
            const on = chip === c.key;
            const color = on ? Colors.white : Colors.navy;
            const content = (
              <>
                {c.icon ? <Ionicons name={c.icon} size={16} color={color} /> : null}
                <Text style={[styles.chipText, { color }]}>{c.label}</Text>
                {c.key === "more" ? <Ionicons name="chevron-down" size={14} color={color} /> : null}
              </>
            );
            return (
              <Pressable key={c.key} onPress={() => (c.key === "more" ? setMoreOpen(true) : setChip(c.key))} accessibilityRole="button">
                {on ? (
                  <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.chip}>
                    {content}
                  </LinearGradient>
                ) : (
                  <View style={[styles.chip, styles.chipOff]}>{content}</View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Recommended */}
        {showRecommended ? (
          <>
            <SectionHeader title="Recommended for You" onPress={() => openResults("")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards} style={styles.bleed}>
              {recommended.map((m) => (
                <Pressable key={m.name} style={styles.recCard} onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })}>
                  <View style={styles.recTop}>
                    <Avatar name={m.name} photo={m.photo} />
                    <Pressable
                      onPress={() => toggleRequest(m.name)}
                      style={[styles.addBtn, requested.includes(m.name) && styles.addBtnOn]}
                      hitSlop={6}
                      accessibilityLabel={`Connect with ${m.name}`}
                    >
                      <Ionicons
                        name={requested.includes(m.name) ? "checkmark" : "person-add-outline"}
                        size={14}
                        color={Colors.goldDark}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Text style={styles.memberRole}>{m.role}</Text>
                  <Text style={styles.memberCompany} numberOfLines={1}>
                    {m.company}
                  </Text>
                  <View style={styles.tagRow}>
                    {m.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </View>
                  <ConnectButton requested={requested.includes(m.name)} onPress={() => toggleRequest(m.name)} style={styles.recBtn} />
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Industries */}
        {showIndustries ? (
          <>
            <SectionHeader title="Explore by Industry" onPress={() => openResults("")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards} style={styles.bleed}>
              {industries.map((i) => (
                <Pressable key={i.name} style={({ pressed }) => [styles.industry, pressed && styles.pressed]} onPress={() => openResults(i.name)}>
                  <View style={styles.industryIcon}>
                    <Ionicons name={i.icon} size={22} color={Colors.goldDark} />
                  </View>
                  <View>
                    <Text style={styles.industryName}>{i.name}</Text>
                    <Text style={styles.industryCount}>{i.count}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Recently joined */}
        {showRecent ? (
          <>
            <SectionHeader title="Recently Joined" onPress={() => openResults("")} />
            <View style={styles.list}>
              {recent.map((m) => (
                <MemberRow key={m.name} member={m} card requested={requested.includes(m.name)} onToggle={() => toggleRequest(m.name)} />
              ))}
            </View>
          </>
        ) : null}

        {/* Businesses */}
        {showBusinesses && businesses.length > 0 ? (
          <>
            <SectionHeader title="Businesses" />
            <View style={styles.list}>
              {businesses.map((m) => (
                <Pressable key={m.company} style={styles.row} onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })}>
                  <View style={[styles.avatarLg, styles.bizIcon]}>
                    <Ionicons name="business" size={24} color={Colors.goldDark} />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.company}
                    </Text>
                    <Text style={styles.memberRole} numberOfLines={1}>
                      {m.name} • {m.role}
                    </Text>
                    <View style={styles.tagRow}>
                      {m.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {!hasResults ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try a different search.</Text>
            <Pressable
              onPress={() => {
                setQuery("");
                setChip("all");
              }}
              hitSlop={8}
            >
              <Text style={styles.viewAllText}>Reset search</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: Colors.navy,
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  scroll: { paddingHorizontal: 16, gap: 14 },
  bleed: { marginHorizontal: -16, flexGrow: 0 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { width: 130, height: 50 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  bellDot: { position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  avatarSm: { width: 42, height: 42, borderRadius: 21 },

  hero: { aspectRatio: HERO_RATIO, justifyContent: "center", gap: 6, overflow: "hidden", borderRadius: Radius.lg, paddingLeft: 4 },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 32, lineHeight: 38 },
  heroSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, maxWidth: "62%" },

  searchRow: { flexDirection: "row", gap: 10 },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    ...CARD_SHADOW,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 12, color: Colors.navy, padding: 0 },
  filter: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },

  chips: { paddingHorizontal: 16, gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingHorizontal: 14, borderRadius: Radius.md },
  chipOff: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipText: { fontFamily: Fonts.medium, fontSize: 12 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17, flexShrink: 1 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewAllText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  cards: { paddingHorizontal: 16, gap: 10, paddingVertical: 4 },
  recCard: { width: 152, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  recTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginBottom: 8 },
  moreRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  moreIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  moreLabel: { flex: 1, color: Colors.navy, fontFamily: Fonts.medium, fontSize: 14 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  avatarLg: { width: 56, height: 56, borderRadius: 28 },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  addBtnOn: { backgroundColor: "#E3F5EC" },
  memberName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, flexShrink: 1 },
  memberRole: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  memberCompany: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10, marginTop: 1 },
  recBtn: { marginTop: 10 },



  industry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    ...CARD_SHADOW,
  },
  industryIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  industryName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12 },
  industryCount: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },

  list: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  rowInfo: { flex: 1, minWidth: 0 },
  bizIcon: { backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },

  empty: { alignItems: "center", gap: 6, paddingVertical: 32 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },

});
