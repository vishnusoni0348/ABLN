import { GoldButton, NetworkTabBar, PersonAvatar } from "@/components/intro-ui";
import { GOLD_BG, Tag } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { removeConnection, useConnections } from "@/lib/connection-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const q = query.trim().toLowerCase();
  const rows = connections
    .map((c) => ({ c, m: findMember(c.name) }))
    .filter(({ c, m }) => !q || [c.name, m?.role, m?.company, m?.location, ...(m?.tags ?? [])].join(" ").toLowerCase().includes(q))
    .sort((a, b) => (sort === "name" ? a.c.name.localeCompare(b.c.name) : b.c.addedAt.getTime() - a.c.addedAt.getTime()));

  const openProfile = (name: string) => router.push({ pathname: "/member-profile", params: { name } });
  const menu = (name: string) =>
    Alert.alert(name, undefined, [
      { text: "View Profile", onPress: () => openProfile(name) },
      { text: "Remove Connection", style: "destructive", onPress: () => removeConnection(name) },
      { text: "Cancel", style: "cancel" },
    ]);

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
        <View style={styles.empty}>
          <View style={styles.emptyHalo}>
            <Ionicons name="people" size={74} color={Colors.gold} />
            <View style={styles.plus}>
              <Ionicons name="add" size={22} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Start Building Your ABLN Network</Text>
          <Text style={styles.emptyText}>You haven&apos;t connected with any members yet. Discover and connect with business leaders to grow together.</Text>
          <GoldButton label="Discover Members" icon="search-outline" onPress={() => router.replace("/network")} style={styles.discover} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
            <Pressable style={({ pressed }) => [styles.filter, pressed && styles.pressed]} onPress={() => setSortOpen(true)} accessibilityRole="button" accessibilityLabel="Sort connections">
              <Ionicons name="options-outline" size={22} color={Colors.goldDark} />
            </Pressable>
          </View>

          <View style={styles.countRow}>
            <Text style={styles.count}>
              {connections.length} {connections.length === 1 ? "Connection" : "Connections"}
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
              <Pressable key={c.name} style={styles.row} onPress={() => openProfile(c.name)} accessibilityRole="button" accessibilityLabel={`View ${c.name}'s profile`}>
                <PersonAvatar name={c.name} size={54} />
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {c.name}
                    </Text>
                    {m?.verified ? <Ionicons name="checkmark-circle" size={15} color="#2F6FDE" /> : null}
                  </View>
                  {m ? (
                    <>
                      <Text style={styles.role} numberOfLines={1}>
                        {m.role} • {m.company}
                      </Text>
                      <View style={styles.meta}>
                        <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {m.location}
                        </Text>
                      </View>
                      <View style={styles.tags}>
                        {m.tags.slice(0, 2).map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </View>
                    </>
                  ) : null}
                </View>
                <Pressable style={styles.iconBtn} hitSlop={6} onPress={() => Alert.alert("Messages", `Messaging with ${c.name} is coming soon.`)} accessibilityLabel={`Message ${c.name}`}>
                  <Ionicons name="chatbox-ellipses-outline" size={20} color={Colors.navy} />
                </Pressable>
                <Pressable hitSlop={8} onPress={() => menu(c.name)} accessibilityLabel={`More options for ${c.name}`}>
                  <Ionicons name="ellipsis-vertical" size={20} color={Colors.navy} />
                </Pressable>
              </Pressable>
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

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, flexShrink: 1 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  metaText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },

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
  sortLabelOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
});
