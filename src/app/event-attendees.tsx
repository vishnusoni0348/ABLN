import { EmptyState } from "@/components/empty-state";
import { Avatar, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS, eventAttendees } from "@/data/events";
import { INDUSTRIES, type MemberType } from "@/data/members";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Chip({ label, on, onPress, icon }: { label: string; on: boolean; onPress: () => void; icon?: "checkmark-circle" | "location-outline" }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
      {icon ? <Ionicons name={icon} size={14} color={on ? Colors.white : icon === "location-outline" ? Colors.goldDark : "#2F6FDE"} /> : null}
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

export default function EventAttendees() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = EVENTS.find((x) => x.id === id);
  const all = useMemo(() => (e ? eventAttendees(e) : []), [e]);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [verified, setVerified] = useState(false);
  const [city, setCity] = useState("");
  const [type, setType] = useState<MemberType | "">("");
  const cities = useMemo(() => [...new Set(all.map((m) => m.city))].sort(), [all]);

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (m) =>
        (!q || [m.name, m.role, m.company, m.location].some((t) => t.toLowerCase().includes(q))) &&
        (!industry || m.industry === industry) &&
        (!city || m.city === city) &&
        (!type || m.type === type) &&
        (!verified || m.verified),
    );
  }, [all, query, industry, city, type, verified]);
  const activeCount = [!!industry, !!city, !!type, verified].filter(Boolean).length;
  const [sheet, setSheet] = useState(false);
  const clearFilters = () => {
    setIndustry("");
    setCity("");
    setType("");
    setVerified(false);
  };
  const filtering = !!query.trim() || !!industry || !!city || !!type || verified;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="Attending Members" />
      </View>
      {all.length > 0 ? (
        <View style={styles.tools}>
          <View style={[styles.search, styles.flex]}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Search by name, company or city" placeholderTextColor={Colors.textSecondary} style={styles.input} returnKeyType="search" autoCorrect={false} />
            {query ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
          <Pressable style={[styles.filterBtn, activeCount > 0 && styles.filterBtnOn]} onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={`Filters${activeCount ? `, ${activeCount} active` : ""}`}>
            <Ionicons name="options-outline" size={20} color={activeCount > 0 ? Colors.white : Colors.navy} />
            {activeCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      ) : null}
      {all.length === 0 ? (
        <EmptyState icon="people-outline" title="No Attendees Yet" text="Members who register for this event will appear here." />
      ) : members.length === 0 ? (
        <EmptyState icon="search-outline" title="No Matching Members" text="Try a different search or clear the filters." cta={{ label: "Clear Filters", onPress: () => { setQuery(""); clearFilters(); } }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => m.name}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.count} numberOfLines={2}>
              {filtering ? `${members.length} of ${all.length} members` : `${e?.title} · ${e?.going} going`}
            </Text>
          }
          renderItem={({ item: m }) => (
            <Pressable style={styles.row} onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })} accessibilityRole="button" accessibilityLabel={`View ${m.name}'s profile`}>
              <Avatar name={m.name} photo={m.photo} size={48} />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {m.name}
                  </Text>
                  {m.verified ? <Ionicons name="checkmark-circle" size={15} color="#2F6FDE" /> : null}
                </View>
                <Text style={styles.role} numberOfLines={1}>
                  {m.role} • {m.company}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </Pressable>
          )}
        />
      )}

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheet(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Filters</Text>
            <Pressable onPress={clearFilters} hitSlop={8} accessibilityRole="button">
              <Text style={styles.reset}>Reset</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
            <Group title="Member Type">
              {(["Individual", "Business"] as const).map((t) => (
                <Chip key={t} label={t} on={type === t} onPress={() => setType(type === t ? "" : t)} />
              ))}
            </Group>
            <Group title="Verification">
              <Chip label="Verified only" icon="checkmark-circle" on={verified} onPress={() => setVerified((v) => !v)} />
            </Group>
            <Group title="City">
              {cities.map((c) => (
                <Chip key={c} label={c} icon="location-outline" on={city === c} onPress={() => setCity(city === c ? "" : c)} />
              ))}
            </Group>
            <Group title="Industry">
              {INDUSTRIES.map((i) => (
                <Chip key={i} label={i} on={industry === i} onPress={() => setIndustry(industry === i ? "" : i)} />
              ))}
            </Group>
          </ScrollView>
          <Pressable style={styles.apply} onPress={() => setSheet(false)} accessibilityRole="button">
            <Text style={styles.applyText}>{`Show ${members.length} ${members.length === 1 ? "member" : "members"}`}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  tools: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 6 },
  filterBtn: { width: 44, height: 44, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  filterBtnOn: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  badge: { position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 10 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, maxHeight: "80%" },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  reset: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  sheetBody: { gap: 18, paddingVertical: 14 },
  group: { gap: 10 },
  groupTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  apply: { height: 50, borderRadius: Radius.md, backgroundColor: Colors.navy, alignItems: "center", justifyContent: "center", marginTop: 8 },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingHorizontal: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: "#F1F4FA" },
  chipOn: { backgroundColor: Colors.navy },
  chipText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 12 },
  chipTextOn: { color: Colors.white },
  list: { paddingHorizontal: 16 },
  count: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12, paddingVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, flexShrink: 1 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
});
