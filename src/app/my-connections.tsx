import { EmptyState } from "@/components/empty-state";
import { NetworkTabBar } from "@/components/intro-ui";
import { Avatar, CARD_SHADOW, GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { ConnectionFilterSheet, EMPTY_CONNECTION_FILTERS, activeFilterCount, matchesFilters } from "@/components/connection-filter";
import { findMember, type Member } from "@/data/members";
import { recordSent, removeConnection, secondDegree, useConnections } from "@/lib/connection-store";
import { toggleRequest, useDirectory } from "@/lib/directory-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const BLUE = "#2F6FDE";

type Degree = "1st" | "2nd";

type Sort = "recent" | "name";
const SORTS: { key: Sort; label: string }[] = [
  { key: "recent", label: "Recently Added" },
  { key: "name", label: "Name A - Z" },
];

export default function MyConnections() {
  const insets = useSafeAreaInsets();
  const { connections, incoming } = useConnections();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_CONNECTION_FILTERS);

  const { requested } = useDirectory();
  const [degree, setDegree] = useState<Degree>("1st");
  const second = secondDegree(connections);

  const q = query.trim().toLowerCase();
  const source =
    degree === "1st"
      ? connections.map((c) => ({ name: c.name, addedAt: c.addedAt, via: [] as string[] }))
      : second.map((s) => ({ name: s.name, addedAt: undefined, via: s.via }));
  const rows = source
    .map((c) => ({ c, m: findMember(c.name) }))
    .filter(({ m }) => !m || matchesFilters(m, filters))
    .filter(({ c, m }) => !q || [c.name, m?.role, m?.company, m?.location, ...(m?.tags ?? [])].join(" ").toLowerCase().includes(q))
    .sort((a, b) => (sort === "name" ? a.c.name.localeCompare(b.c.name) : (b.c.addedAt?.getTime() ?? 0) - (a.c.addedAt?.getTime() ?? 0)));

  const connect = (name: string) => {
    if (requested.includes(name)) return toggleRequest(name);
    toggleRequest(name);
    recordSent(name);
    router.push({ pathname: "/connection-sent", params: { name } });
  };

  const openProfile = (name: string) => router.push({ pathname: "/member-profile", params: { name } });
  const contact = (m: Member | undefined, scheme: "tel" | "sms") => {
    if (!m?.phone) return Alert.alert("Contact unavailable", `${m?.name ?? "This member"} hasn't shared a phone number.`);
    Linking.openURL(`${scheme}:${m.phone.replace(/\s/g, "")}`).catch(() => Alert.alert("Couldn't open", "This device can't place calls or send messages."));
  };
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuMember = menuFor ? findMember(menuFor) : undefined;
  const closeMenu = () => setMenuFor(null);
  const confirmRemove = (name: string) =>
    Alert.alert("Remove connection?", `${name} will be removed from your connections.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeConnection(name) },
    ]);
  const menuItems = (name: string, m?: Member): { icon: ComponentProps<typeof Ionicons>["name"]; title: string; sub: string; onPress: () => void; danger?: boolean }[] => [
    { icon: "person-outline", title: "View Profile", sub: "See full profile and details", onPress: () => openProfile(name) },
    { icon: "call-outline", title: "Call", sub: "Call on phone", onPress: () => contact(m, "tel") },
    { icon: "chatbubble-ellipses-outline", title: "Message", sub: "Send a message", onPress: () => contact(m, "sms") },
    { icon: "calendar-outline", title: "Schedule Meeting", sub: "Pick a date and time", onPress: () => router.push({ pathname: "/schedule-meeting", params: { name } }) },
    { icon: "person-remove-outline", title: "Remove Connection", sub: "Remove from your connections", onPress: () => confirmRemove(name), danger: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <Modal visible={sortOpen} transparent animationType="slide" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSortOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Sort by</Text>
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              style={styles.sortRow}
              onPress={() => {
                setSort(s.key);
                setSortOpen(false);
              }}
            >
              <Text style={[styles.sortLabel, sort === s.key && styles.sortLabelOn]}>{s.label}</Text>
              {sort === s.key ? <Ionicons name="checkmark" size={20} color={Colors.goldDark} /> : null}
            </Pressable>
          ))}
        </View>
      </Modal>


      <Modal visible={!!menuFor} transparent animationType="slide" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          {menuFor ? (
            <>
              <View style={styles.menuHead}>
                <Avatar name={menuFor} photo={menuMember?.photo} size={46} />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{menuFor}</Text>
                  {menuMember ? <Text style={styles.role} numberOfLines={1}>{menuMember.role} • {menuMember.company}</Text> : null}
                </View>
              </View>
              {menuItems(menuFor, menuMember).map((it) => (
                <Pressable
                  key={it.title}
                  style={styles.menuRow}
                  onPress={() => {
                    closeMenu();
                    it.onPress();
                  }}
                  accessibilityRole="button"
                >
                  <View style={[styles.menuIcon, it.danger && styles.menuIconDanger]}>
                    <Ionicons name={it.icon} size={18} color={it.danger ? Colors.error : BLUE} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.menuTitle, it.danger && { color: Colors.error }]}>{it.title}</Text>
                    <Text style={styles.menuSub}>{it.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </Pressable>
              ))}
              <Pressable style={styles.cancelBtn} onPress={closeMenu} accessibilityRole="button">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </Modal>

      <ConnectionFilterSheet
        visible={filterOpen}
        value={filters}
        members={connections.map((c) => findMember(c.name)).filter((m): m is Member => !!m)}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
        }}
      />

      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/network"))} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>My Connections</Text>
        <Pressable
          onPress={() => router.push("/connection-requests")}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={`Connection requests${incoming.length ? `, ${incoming.length} pending` : ""}`}
        >
          <View style={styles.reqIcon}>
            <Ionicons name="person-add-outline" size={22} color={Colors.navy} />
            {incoming.length > 0 ? (
              <View style={styles.reqBadge}>
                <Text style={styles.reqBadgeText}>{incoming.length > 9 ? "9+" : incoming.length}</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </View>

      {connections.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Start Building Your ABLN Network"
          text="You haven't connected with any members yet. Discover and connect with business leaders to grow together."
          cta={{ label: "Discover Members", onPress: () => router.replace("/network") }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.tabs}>
            {(
              [
                ["1st", "1st Degree", connections.length],
                ["2nd", "2nd Degree", second.length],
              ] as [Degree, string, number][]
            ).map(([key, label, n]) => (
              <Pressable key={key} style={[styles.tab, degree === key && styles.tabOn]} onPress={() => setDegree(key)} accessibilityRole="tab" accessibilityState={{ selected: degree === key }}>
                <Text style={[styles.tabText, degree === key && styles.tabTextOn]}>
                  {label} ({n})
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.hint, degree === "2nd" && styles.hint2]}>
            <Ionicons name="information-circle-outline" size={16} color={degree === "1st" ? Colors.success : BLUE} />
            <Text style={styles.hintText}>
              {degree === "1st"
                ? "Direct: members you are connected with directly."
                : "Mutual: members connected to you through your direct connections."}
            </Text>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.search}>
              <Ionicons name="search-outline" size={20} color={Colors.navy} />
              <TextInput
                placeholder="Search connections..."
                placeholderTextColor={Colors.textMuted}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
              />
              {query ? (
                <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
            <Pressable style={({ pressed }) => [styles.filter, pressed && styles.pressed]} onPress={() => {
                setFilterOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Filter connections"
            >
              <Ionicons name="options-outline" size={22} color={Colors.goldDark} />
              {activeFilterCount(filters) ? <View style={styles.dot} /> : null}
            </Pressable>
          </View>

          <View style={styles.countRow}>
            <Text style={styles.count}>
              {rows.length} {degree} Degree {rows.length === 1 ? "Connection" : "Connections"}
            </Text>
            <Pressable style={styles.sortBtn} onPress={() => setSortOpen(true)} hitSlop={8}>
              <Text style={styles.sortText}>{SORTS.find((s) => s.key === sort)?.label}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.navy} />
            </Pressable>
          </View>

          {rows.length === 0 ? (
            <View style={styles.noMatch}>
              <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.noMatchTitle}>No connections found</Text>
              <Text style={styles.noMatchText}>Try a different search.</Text>
            </View>
          ) : (
            rows.map(({ c, m }) => (
              <View key={c.name} style={styles.card}>
                <Pressable style={styles.row} onPress={() => openProfile(c.name)} accessibilityRole="button" accessibilityLabel={`View ${c.name}'s profile`}>
                  <Avatar name={c.name} photo={m?.photo} size={64} />
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {c.name}
                      </Text>
                      {m?.verified ? <Ionicons name="checkmark-circle" size={16} color={BLUE} /> : null}
                    </View>
                    {m ? (
                      <>
                        <Text style={styles.role} numberOfLines={1}>
                          {m.role}
                        </Text>
                        <Text style={styles.role} numberOfLines={1}>
                          {m.company}
                        </Text>
                        <View style={styles.meta}>
                          <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                          <Text style={styles.metaText} numberOfLines={1}>
                            {m.location}
                          </Text>
                        </View>
                        <View style={styles.meta}>
                          <Ionicons name="people-outline" size={12} color={Colors.goldDark} />
                          <Text style={[styles.metaText, { color: Colors.goldDark }]} numberOfLines={1}>
                            {m.city} Chapter
                          </Text>
                        </View>
                      </>
                    ) : null}
                    {c.via.length ? (
                      <View style={styles.meta}>
                        <Ionicons name="git-network-outline" size={12} color={BLUE} />
                        <Text style={[styles.metaText, { color: BLUE }]} numberOfLines={1}>
                          Via {c.via[0]}
                          {c.via.length > 1 ? ` +${c.via.length - 1} more` : ""}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.side}>
                    <View style={[styles.degree, degree === "2nd" && styles.degree2]}>
                      <Text style={[styles.degreeText, degree === "2nd" && styles.degreeText2]}>{degree} · {degree === "1st" ? "Direct" : "Mutual"}</Text>
                    </View>
                    {degree === "1st" ? (
                      <Pressable hitSlop={8} onPress={() => setMenuFor(c.name)} accessibilityLabel={`More options for ${c.name}`}>
                        <Ionicons name="ellipsis-vertical" size={20} color={Colors.navy} />
                      </Pressable>
                    ) : null}
                  </View>
                </Pressable>
                {degree === "2nd" ? (
                  <View style={styles.actions}>
                    <Pressable style={({ pressed }) => [styles.action, styles.actionCall, pressed && styles.pressed]} onPress={() => connect(c.name)} accessibilityRole="button">
                      <Ionicons name={requested.includes(c.name) ? "time-outline" : "person-add-outline"} size={16} color={Colors.goldDark} />
                      <Text style={[styles.actionText, { color: Colors.goldDark }]}>{requested.includes(c.name) ? "Requested" : "Connect"}</Text>
                    </Pressable>
                    <Pressable style={({ pressed }) => [styles.action, styles.actionBlue, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/request-introduction", params: { name: c.name } })} accessibilityRole="button">
                      <Ionicons name="people-outline" size={16} color={BLUE} />
                      <Text style={[styles.actionText, { color: BLUE }]}>Request Intro</Text>
                    </Pressable>
                  </View>
                ) : (
                <View style={styles.actions}>
                  <Pressable style={({ pressed }) => [styles.action, styles.actionCall, pressed && styles.pressed]} onPress={() => contact(m, "tel")} accessibilityRole="button" accessibilityLabel={`Call ${c.name}`}>
                    <Ionicons name="call-outline" size={16} color={Colors.goldDark} />
                    <Text style={[styles.actionText, { color: Colors.goldDark }]}>Call</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.action, styles.actionBlue, pressed && styles.pressed]} onPress={() => contact(m, "sms")} accessibilityRole="button" accessibilityLabel={`Message ${c.name}`}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={BLUE} />
                    <Text style={[styles.actionText, { color: BLUE }]}>Message</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.action, styles.actionBlue, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/schedule-meeting", params: { name: c.name } })} accessibilityRole="button" accessibilityLabel={`Schedule a meeting with ${c.name}`}>
                    <Ionicons name="calendar-outline" size={16} color={BLUE} />
                    <Text style={[styles.actionText, { color: BLUE }]}>Meet</Text>
                  </Pressable>
                </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 16 },
  back: { width: 36, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  reqIcon: { alignSelf: "flex-end" },
  reqBadge: { position: "absolute", top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, backgroundColor: Colors.error, alignItems: "center", justifyContent: "center" },
  reqBadgeText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 9 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  searchRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, height: 50, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.navy, padding: 0 },
  filter: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },

  countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 4 },
  count: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },

  card: { marginTop: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, flexShrink: 1 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  action: { flex: 1, height: 40, borderRadius: Radius.sm, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: Colors.white },
  actionCall: { borderColor: Colors.gold },
  actionBlue: { borderColor: BLUE },
  actionText: { fontFamily: Fonts.semiBold, fontSize: 13 },

  menuHead: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  menuIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAF1FC", alignItems: "center", justifyContent: "center" },
  menuIconDanger: { backgroundColor: "#FCEBEB" },
  menuTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  menuSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  cancelBtn: { height: 46, marginTop: 14, borderRadius: Radius.md, backgroundColor: Colors.softWhite, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },

  tabs: { flexDirection: "row", padding: 4, marginTop: 8, borderRadius: Radius.md, backgroundColor: "#EEF2FA" },
  tab: { flex: 1, height: 38, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: Colors.white, ...CARD_SHADOW },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 12 },
  tabTextOn: { color: Colors.navy, fontFamily: Fonts.bold },
  hint: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, padding: 10, borderRadius: Radius.sm, backgroundColor: "#E4F5EC" },
  hint2: { backgroundColor: "#EAF1FC" },
  hintText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16 },
  side: { alignItems: "flex-end", gap: 10 },
  degree: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: "#E4F5EC" },
  degree2: { backgroundColor: "#EAF1FC" },
  degreeText: { color: Colors.success, fontFamily: Fonts.semiBold, fontSize: 11 },
  degreeText2: { color: BLUE },

  noMatch: { alignItems: "center", gap: 6, paddingVertical: 40 },
  noMatchTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  noMatchText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyHalo: { width: 170, height: 170, borderRadius: 85, backgroundColor: "#FDF0D8", alignItems: "center", justifyContent: "center" },
  plus: { position: "absolute", right: 36, bottom: 38, width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FDF0D8" },
  emptyTitle: { textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, marginTop: 26 },
  emptyText: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, marginTop: 10 },
  discover: { alignSelf: "stretch", marginTop: 28 },

  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 14 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginBottom: 6 },
  sortRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  sortLabel: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 14 },
  applyBtn: { flex: 1.4, height: 46, borderRadius: Radius.md, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  dot: { position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  sortLabelOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
});
