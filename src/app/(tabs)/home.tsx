import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TabHeader } from "@/components/tab-header";
import { LinearGradient } from "expo-linear-gradient";
import { QuestionCard } from "@/components/ask-ui";
import { openEvent } from "@/components/event-ui";
import { EVENTS as ALL_EVENTS } from "@/data/events";
import { searchQuestions } from "@/data/questions";
import { useQuestions } from "@/lib/question-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode, useEffect, useRef, useState } from "react";
import { Image, ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const PURPLE = "#6D4BD8";
const PURPLE_BG = "#EFEAFB";
const BLUE = "#2F6FDE";
const GOLD_BG = "#FDF0D2";

// Sample content until the members/events APIs are wired up.
const CHIPS: { key: string; label: string; icon?: IconName; mci?: ComponentProps<typeof MaterialCommunityIcons>["name"] }[] = [
  { key: "all", label: "All", icon: "grid-outline" },
  { key: "members", label: "Members", icon: "people-outline" },
  { key: "businesses", label: "Businesses", icon: "business-outline" },
  { key: "opportunities", label: "Opportunities", mci: "handshake-outline" },
  { key: "events", label: "Events", icon: "calendar-outline" },
  { key: "more", label: "More" },
];

const FILTER_GROUPS: { key: string; title: string; options: string[] }[] = [
  { key: "industry", title: "Industry", options: ["Technology", "Manufacturing", "Sustainability", "E-commerce", "Finance"] },
  { key: "city", title: "City", options: ["Jaipur", "Delhi", "Mumbai", "Bangalore"] },
  { key: "role", title: "Role", options: ["CEO", "Founder", "Director", "Co-Founder"] },
];

const SUMMARY: { key: string; icon: IconName; value: string; label: string; color: string; valueColor: string; bg: string }[] = [
  { key: "members", icon: "people", value: "1K+", label: "Members", color: Colors.gold, valueColor: Colors.goldDark, bg: "#FDF6E6" },
  { key: "businesses", icon: "business", value: "200+", label: "Businesses", color: PURPLE, valueColor: PURPLE, bg: "#F3EEFC" },
  { key: "opps", icon: "briefcase", value: "150+", label: "Opportunities", color: BLUE, valueColor: BLUE, bg: "#EAF2FC" },
  { key: "events", icon: "calendar-outline", value: "50+", label: "Events\nAnnually", color: Colors.success, valueColor: Colors.success, bg: "#E8F7EF" },
];

const CONNECTIONS: { name: string; role: string; company: string; tags: string[]; photo: ImageSourcePropType }[] = [
  { name: "Rahul Agarwal", role: "CEO", company: "TechVision Pvt Ltd", tags: ["Technology", "Jaipur"], photo: require("../../../assets/images/member-rahul.png") },
  { name: "Sneha Bansal", role: "Founder", company: "GreenNest Solutions", tags: ["Sustainability", "Delhi"], photo: require("../../../assets/images/member-sneha.png") },
  { name: "Amit Goyal", role: "Director", company: "Goyal Enterprises", tags: ["Manufacturing", "Mumbai"], photo: require("../../../assets/images/member-amit.png") },
  { name: "Priya Mittal", role: "Co-Founder", company: "Kraftly Innovations", tags: ["E-commerce", "Bangalore"], photo: require("../../../assets/images/member-priya.png") },
];

const OPPORTUNITIES: { id: string; title: string; location: string; tags: string[] }[] = [
  { id: "o10", title: "Looking for Technology Partners for Expansion", location: "India (Multiple Cities)", tags: ["Partnership", "Technology", "Expansion"] },
];

// The next few upcoming events from the events data, shaped for the home cards.
const EVENTS = ALL_EVENTS.filter((e) => e.when === "Upcoming")
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 3)
  .map((e) => {
    const d = new Date(`${e.date}T00:00:00`);
    return { id: e.id, day: String(d.getDate()), month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(), title: e.title, location: e.location, time: e.time, tags: [e.category, e.type] };
  });

function SectionHeader({ title, action = "View All", onAction, hideAction }: { title: string; action?: string; onAction?: () => void; hideAction?: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hideAction ? null : (
        <Pressable hitSlop={8} style={styles.viewAll} onPress={onAction} accessibilityRole="button">
          <Text style={styles.viewAllText}>{action}</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.goldDark} />
        </Pressable>
      )}
    </View>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const BANNERS: { key: string; label: string; image: ImageSourcePropType; href: "/network" | "/opportunities" }[] = [
  { key: "network", label: "Explore Network", image: require("../../../assets/images/hero-banner.png"), href: "/network" },
  { key: "opportunities", label: "Explore Opportunities", image: require("../../../assets/images/hero-opportunities.png"), href: "/opportunities" },
];

function HeroSlider() {
  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth - 32;
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const paused = useRef(false);

  const goTo = (i: number) => {
    indexRef.current = i;
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) goTo((indexRef.current + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [width]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    paused.current = false;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    indexRef.current = i;
    setIndex(i);
  };

  return (
    <View style={{ gap: 8 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => (paused.current = true)}
        onMomentumScrollEnd={onEnd}
        style={styles.hero}
      >
        {BANNERS.map((b) => (
          <Pressable
            key={b.key}
            style={({ pressed }) => [{ width, aspectRatio: 1672 / 941 }, pressed && styles.pressed]}
            onPress={() => router.navigate(b.href)}
            accessibilityRole="button"
            accessibilityLabel={b.label}
          >
            <Image source={b.image} style={styles.heroImage} resizeMode="cover" />
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((b, i) => (
          <View key={b.key} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const [chip, setChip] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const activeFilters = Object.values(filters).reduce((n, v) => n + v.length, 0);

  const openFilters = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const toggleDraft = (group: string, option: string) =>
    setDraft((d) => {
      const cur = d[group] ?? [];
      return { ...d, [group]: cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option] };
    });
  const applyFilters = () => {
    setFilters(draft);
    setFilterOpen(false);
  };

  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const hit = (...parts: string[]) => !q || parts.join(" ").toLowerCase().includes(q);
  const sel = (g: string) => filters[g] ?? [];
  const tagsMatch = (tags: string[], location: string) =>
    (!sel("industry").length || sel("industry").some((i) => tags.includes(i))) &&
    (!sel("city").length || sel("city").some((c) => tags.includes(c) || location.includes(c)));

  const members = CONNECTIONS.filter(
    (m) => hit(m.name, m.role, m.company, ...m.tags) && tagsMatch(m.tags, "") && (!sel("role").length || sel("role").includes(m.role)),
  );
  const opportunities = OPPORTUNITIES.filter((o) => hit(o.title, o.location, ...o.tags) && tagsMatch(o.tags, o.location));
  const events = EVENTS.filter((e) => hit(e.title, e.location, ...e.tags) && tagsMatch(e.tags, e.location));

  const isAll = chip === "all";
  const isFiltering = q.length > 0 || activeFilters > 0;
  const showSummary = isAll && !isFiltering;
  const showMembers = (isAll || chip === "members") && members.length > 0;
  const showBusinesses = chip === "businesses" && members.length > 0;
  const { posted } = useQuestions();
  const latestQuestions = searchQuestions({ query: "", categories: [], sort: "latest", type: "all" }, posted).slice(0, 2);
  const showOpps = (isAll || chip === "opportunities") && opportunities.length > 0;
  const showEvents = (isAll || chip === "events") && events.length > 0;
  const hasResults = showSummary || showMembers || showBusinesses || showOpps || showEvents;
  const resetAll = () => {
    setQuery("");
    setFilters({});
    setChip("all");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            <Pressable onPress={() => setDraft({})} hitSlop={8}>
              <Text style={styles.viewAllText}>Clear all</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {FILTER_GROUPS.map((g) => (
              <View key={g.key} style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>{g.title}</Text>
                <View style={styles.filterOptions}>
                  {g.options.map((o) => {
                    const on = (draft[g.key] ?? []).includes(o);
                    return (
                      <Pressable key={o} onPress={() => toggleDraft(g.key, o)} style={[styles.chip, styles.chipOff, on && styles.chipOn]}>
                        <Text style={[styles.chipText, { color: on ? Colors.goldDark : Colors.navy }]}>{o}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={applyFilters}>
            <LinearGradient
              colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBtn}
            >
              <Text style={styles.heroBtnText}>Apply Filters</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Modal>
      <TabHeader onAvatarPress={() => router.push("/business-card")} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 6, paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <HeroSlider />

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={20} color={Colors.navy} />
            <TextInput
              placeholder="Search members, businesses, industries, opportunities..."
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              numberOfLines={1}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
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
            onPress={openFilters}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <Ionicons name="options-outline" size={22} color={Colors.navy} />
            {activeFilters > 0 ? <View style={styles.filterDot} /> : null}
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsWrap}>
          {CHIPS.map((c) => {
            const on = chip === c.key;
            const color = on ? Colors.white : Colors.navy;
            const content = (
              <>
                {c.mci ? (
                  <MaterialCommunityIcons name={c.mci} size={16} color={color} />
                ) : c.icon ? (
                  <Ionicons name={c.icon} size={16} color={color} />
                ) : null}
                <Text style={[styles.chipText, { color }]}>{c.label}</Text>
                {c.key === "more" ? <Ionicons name="chevron-down" size={14} color={color} /> : null}
              </>
            );
            return (
              <Pressable key={c.key} onPress={() => (c.key === "more" ? openFilters() : setChip(c.key))} accessibilityRole="button">
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

        {showSummary ? (
          <>
            {/* Network summary */}
            <SectionHeader title="Network Summary" hideAction />
            <View style={styles.summary}>
              {SUMMARY.map((s) => (
                <View key={s.key} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={24} color={s.color} />
                  <Text style={[styles.summaryValue, { color: s.valueColor }]}>{s.value}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* Recommended connections */}
        {showMembers ? (
          <>
            <SectionHeader title={isAll && !isFiltering ? "Recommended Connections" : "Members"} onAction={() => router.navigate("/network")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.connections} style={styles.bleed}>
              {members.map((m) => (
                <Pressable key={m.name} style={styles.connection} onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })}>
                  <View style={styles.connTop}>
                    <Image source={m.photo} style={styles.avatar} />
                    <Pressable style={styles.addBtn} hitSlop={6}>
                      <Ionicons name="person-add-outline" size={14} color={Colors.goldDark} />
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
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Businesses */}
        {showBusinesses ? (
          <View style={{ gap: 12 }}>
            <SectionHeader title="Businesses" />
            {members.map((m) => (
              <Pressable key={m.company} style={styles.card} onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })}>
                <View style={styles.cardTop}>
                  <View style={[styles.cardIcon, { backgroundColor: PURPLE_BG }]}>
                    <Ionicons name="business" size={22} color={PURPLE} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{m.company}</Text>
                    <View style={styles.meta}>
                      <Ionicons name="person-outline" size={13} color={Colors.gold} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {m.name} · {m.role}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.tagRow}>
                  {m.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Opportunities + Events */}
        {showOpps || showEvents ? (
          <View style={{ gap: 12 }}>
            {showOpps ? (
              <View style={{ gap: 12 }}>
                <SectionHeader title={isAll && !isFiltering ? "Latest Opportunities" : "Opportunities"} onAction={() => router.navigate("/opportunities")} />
                {opportunities.map((o) => (
                  <Pressable key={o.title} style={styles.card} onPress={() => router.push({ pathname: "/opportunity-details", params: { id: o.id } })} accessibilityRole="button" accessibilityLabel={`Open ${o.title}`}>
                    <View style={styles.cardTop}>
                      <View style={[styles.cardIcon, { backgroundColor: GOLD_BG }]}>
                        <Ionicons name="briefcase" size={22} color={Colors.gold} />
                      </View>
                      <View style={styles.flex}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>BUSINESS OPPORTUNITY</Text>
                        </View>
                        <Text style={styles.cardTitle}>{o.title}</Text>
                        <View style={styles.meta}>
                          <Ionicons name="location-outline" size={13} color={Colors.gold} />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {o.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.tagRow}>
                      {o.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {showEvents ? (
              <View style={{ gap: 12 }}>
                <SectionHeader title="Upcoming Events" onAction={() => router.navigate("/events")} />
                {events.map((e) => (
                  <Pressable key={e.id} onPress={() => openEvent(e.id)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} accessibilityRole="button" accessibilityLabel={e.title}>
                    <View style={styles.cardTop}>
                      <View style={styles.date}>
                        <Text style={styles.dateDay}>{e.day}</Text>
                        <Text style={styles.dateMonth}>{e.month}</Text>
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{e.title}</Text>
                        <View style={styles.meta}>
                          <Ionicons name="location-outline" size={13} color={Colors.gold} />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {e.location}
                          </Text>
                        </View>
                        <View style={styles.meta}>
                          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {e.time}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.tagRow}>
                      {e.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Empty state */}
        {!hasResults ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try a different search or clear your filters.</Text>
            <Pressable onPress={resetAll} hitSlop={8}>
              <Text style={styles.viewAllText}>Reset search & filters</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Latest questions */}
        {showSummary ? (
          <View style={{ gap: 12 }}>
            <SectionHeader title="Latest Questions" onAction={() => router.push("/ask-network")} />
            {latestQuestions.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </View>
        ) : null}

        {/* Ask network + privileges */}
        {showSummary ? (
        <View style={styles.twoCol}>
          <Pressable style={[styles.col, styles.promo]} onPress={() => router.push("/ask-network")} accessibilityRole="button" accessibilityLabel="Open Ask Network">
            <View style={styles.promoTop}>
              <View style={[styles.promoIcon, { backgroundColor: PURPLE_BG }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={26} color={PURPLE} />
              </View>
              <View style={styles.flex}>
                <View style={styles.promoTitleRow}>
                  <Text style={styles.promoTitle}>Ask Network</Text>
                  <View style={styles.beta}>
                    <Text style={styles.betaText}>Beta</Text>
                  </View>
                </View>
                <Text style={styles.promoDesc}>Get advice, insights and solutions from the ABLN community.</Text>
              </View>
            </View>
            <View style={[styles.promoBtn, { backgroundColor: PURPLE_BG }]}>
              <Text style={[styles.promoBtnText, { color: PURPLE }]}>View Questions</Text>
              <Ionicons name="arrow-forward" size={14} color={PURPLE} />
            </View>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.col, styles.promo, pressed && styles.pressed]} onPress={() => router.navigate("/partners")} accessibilityRole="button" accessibilityLabel="Open ABLN Privileges">
            <View style={styles.promoTop}>
              <View style={[styles.promoIcon, { backgroundColor: GOLD_BG }]}>
                <MaterialCommunityIcons name="crown" size={26} color={Colors.gold} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.promoTitle}>ABLN Privileges</Text>
                <Text style={styles.promoDesc}>Access exclusive perks, partner discounts and member benefits.</Text>
              </View>
            </View>
            <View style={[styles.promoBtn, { backgroundColor: GOLD_BG }]}>
              <Text style={[styles.promoBtnText, { color: Colors.goldDark }]}>Explore Privileges</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.goldDark} />
            </View>
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
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  scroll: { paddingHorizontal: 16, gap: 14 },
  bleed: { marginHorizontal: -16 },

  hero: { borderRadius: Radius.lg, overflow: "hidden", backgroundColor: Colors.white },
  heroImage: { width: "100%", height: "100%" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D5D8E6" },
  dotOn: { width: 20, backgroundColor: Colors.gold },
  heroBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
    marginTop: 4,
  },
  heroBtnText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12 },

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
    borderColor: "#C9CDEB",
    backgroundColor: Colors.white,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 12, color: Colors.navy, padding: 0 },
  filter: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    backgroundColor: "#EEF2FA",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: { alignItems: "center", gap: 6, paddingVertical: 32 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  filterDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: PURPLE },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: "80%",
  },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  sheetBody: { flexGrow: 0, marginBottom: 12 },
  filterGroup: { marginBottom: 16, gap: 10 },
  filterGroupTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chipsWrap: { flexGrow: 0, marginHorizontal: -16 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
  },
  chipOff: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipOn: { borderColor: Colors.gold, backgroundColor: "#FDF6E6" },
  chipText: { fontFamily: Fonts.medium, fontSize: 12 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17, flexShrink: 1 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewAllText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  summary: { flexDirection: "row", gap: 8 },
  summaryCard: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 14, paddingHorizontal: 2, borderRadius: Radius.lg },
  summaryValue: { fontFamily: Fonts.bold, fontSize: 18 },
  summaryLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10, textAlign: "center" },

  connections: { paddingHorizontal: 16, gap: 10, paddingVertical: 4 },
  connection: {
    width: 150,
    padding: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...CARD_SHADOW,
  },
  connTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GOLD_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  memberName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  memberRole: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  memberCompany: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10, marginTop: 1 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  tag: { backgroundColor: "#EEF2FA", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  tagText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 9 },

  twoCol: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  col: { flex: 1 },
  card: {
    flex: 1,
    padding: 10,
    marginTop: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...CARD_SHADOW,
  },
  cardTop: { flexDirection: "row", gap: 8 },
  cardIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badge: { alignSelf: "flex-start", backgroundColor: PURPLE_BG, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginBottom: 3 },
  badgeText: { color: PURPLE, fontFamily: Fonts.semiBold, fontSize: 7 },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12, lineHeight: 16 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  metaText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10 },
  date: {
    width: 44,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: "#FDF3DC",
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 18, lineHeight: 22 },
  dateMonth: { color: Colors.goldDark, fontFamily: Fonts.medium, fontSize: 10 },

  promo: { padding: 10, borderRadius: Radius.lg, backgroundColor: Colors.white, gap: 10, ...CARD_SHADOW },
  promoTop: { flexDirection: "row", gap: 8 },
  promoIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  promoTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  promoTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  promoDesc: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10, lineHeight: 14, marginTop: 2 },
  beta: { backgroundColor: GOLD_BG, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  betaText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 9 },
  promoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: Radius.md,
    marginTop: "auto",
  },
  promoBtnText: { fontFamily: Fonts.semiBold, fontSize: 12 },

});
