import { Avatar, CARD_SHADOW, GOLD_BG, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EMPTY_FILTERS, INDUSTRIES, type Member, memberSpot, searchMembers } from "@/data/members";
import { setMapFilters, useMapFilters } from "@/lib/map-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAP_HEIGHT = 300;
const PIN = 44;
const DISTANCES = [
  { label: "Any distance", km: Infinity },
  { label: "Within 5 km", km: 5 },
  { label: "Within 10 km", km: 10 },
  { label: "Within 15 km", km: 15 },
];
const SORTS = [
  { key: "nearest", label: "Nearest" },
  { key: "name", label: "Name A - Z" },
  { key: "recent", label: "Recently Joined" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

type Item = { member: Member; km: number; angle: number };

function Menu({ icon, label, active, options, value, onChange }: { icon: keyof typeof Ionicons.glyphMap; label: string; active: boolean; options: { key: string; label: string }[]; value: string; onChange: (k: string) => void }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={[styles.pill, active && styles.pillOn]} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={label}>
        <Ionicons name={icon} size={16} color={active ? Colors.goldDark : Colors.navy} />
        <Text style={[styles.pillText, active && styles.pillTextOn]} numberOfLines={1}>
          {label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={active ? Colors.goldDark : Colors.navy} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((o) => {
              const on = o.key === value;
              return (
                <Pressable
                  key={o.key}
                  style={styles.option}
                  onPress={() => {
                    onChange(o.key);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, on && styles.optionOn]}>{o.label}</Text>
                  {on ? <Ionicons name="checkmark" size={18} color={Colors.goldDark} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

export default function MembersMap() {
  const insets = useSafeAreaInsets();
  const { city, industries } = useMapFilters();
  const [query, setQuery] = useState("");
  const [maxKm, setMaxKm] = useState(Infinity);
  const [sort, setSort] = useState<SortKey>("nearest");
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string>();
  const [width, setWidth] = useState(0);

  const items = useMemo<Item[]>(() => {
    const found = searchMembers(query, { ...EMPTY_FILTERS, city }, "relevance")
      .filter((m) => !industries.length || industries.includes(m.industry))
      .map((member) => ({ member, ...memberSpot(member.name) }))
      .filter((i) => i.km <= maxKm);
    return found.sort((a, b) => (sort === "nearest" ? a.km - b.km : sort === "name" ? a.member.name.localeCompare(b.member.name) : a.member.joinedDaysAgo - b.member.joinedDaysAgo));
  }, [query, city, industries, maxKm, sort]);

  const filterCount = (city ? 1 : 0) + industries.length;
  const pxPerKm = (MAP_HEIGHT / 2 - PIN) / 15 * zoom;
  const cx = width / 2;
  const cy = MAP_HEIGHT / 2 + 14;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  const zoomBy = (f: number) => setZoom((z) => clamp(z * f, 0.5, 2.5));

  const industryOptions = [{ key: "", label: "All industries" }, ...INDUSTRIES.map((i) => ({ key: i, label: i }))];
  const industryValue = industries.length === 1 ? industries[0] : "";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Explore Members Map" />
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={20} color={Colors.navy} />
            <TextInput
              placeholder="Search members, city, industry"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
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
          <Pressable style={({ pressed }) => [styles.filter, pressed && styles.pressed]} onPress={() => router.navigate("/map-filters")} accessibilityRole="button" accessibilityLabel="Open map filters">
            <Ionicons name="options-outline" size={22} color={Colors.goldDark} />
            {filterCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.map} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {/* Stylised street grid */}
          <View style={[styles.road, { top: 70, left: -20, right: -20, height: 10, transform: [{ rotate: "-8deg" }] }]} />
          <View style={[styles.road, { top: 190, left: -20, right: -20, height: 8, transform: [{ rotate: "6deg" }] }]} />
          <View style={[styles.road, { left: "28%", top: -20, bottom: -20, width: 9, transform: [{ rotate: "10deg" }] }]} />
          <View style={[styles.road, { left: "68%", top: -20, bottom: -20, width: 8, transform: [{ rotate: "-12deg" }] }]} />
          <View style={[styles.park, { top: 24, left: 18, width: 90, height: 56 }]} />
          <View style={[styles.park, { bottom: 20, right: 24, width: 110, height: 60 }]} />

          {width > 0 ? (
            <>
              <View style={[styles.halo, { left: cx - 60, top: cy - 60 }]} />
              <View style={[styles.you, { left: cx - 7, top: cy - 7 }]} />
              <Text style={[styles.cityLabel, { left: cx - 60, top: cy + 12 }]}>{city || "All cities"}</Text>

              {items.map(({ member: m, km, angle }) => {
                const x = clamp(cx + Math.cos(angle) * km * pxPerKm, PIN / 2 + 4, width - PIN / 2 - 4);
                const y = clamp(cy + Math.sin(angle) * km * pxPerKm, PIN + 8, MAP_HEIGHT - 8);
                const on = selected === m.name;
                return (
                  <Pressable
                    key={m.name}
                    onPress={() => setSelected(on ? undefined : m.name)}
                    style={[styles.pin, { left: x - PIN / 2, top: y - PIN - 6 }, on && styles.pinTop]}
                    accessibilityRole="button"
                    accessibilityLabel={`${m.name}, ${km.toFixed(1)} km away`}
                  >
                    {on ? (
                      <View style={styles.callout}>
                        <Text style={styles.calloutText} numberOfLines={1}>
                          {m.name}
                        </Text>
                      </View>
                    ) : null}
                    <View style={[styles.pinHead, { borderColor: m.verified ? Colors.gold : Colors.navy }, on && styles.pinHeadOn]}>
                      <Avatar name={m.name} photo={m.photo} size={on ? 38 : 34} />
                    </View>
                    <View style={[styles.pinTip, { borderTopColor: m.verified ? Colors.gold : Colors.navy }]} />
                  </Pressable>
                );
              })}
            </>
          ) : null}

          <View style={styles.legend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Members</Text>
          </View>
          <View style={styles.controls}>
            <Pressable style={styles.ctrl} onPress={() => setZoom(1)} accessibilityLabel="Recenter map">
              <Ionicons name="locate" size={22} color={Colors.navy} />
            </Pressable>
            <View style={styles.zoom}>
              <Pressable style={styles.zoomBtn} onPress={() => zoomBy(1.4)} accessibilityLabel="Zoom in">
                <Ionicons name="add" size={22} color={Colors.navy} />
              </Pressable>
              <View style={styles.zoomDivider} />
              <Pressable style={styles.zoomBtn} onPress={() => zoomBy(1 / 1.4)} accessibilityLabel="Zoom out">
                <Ionicons name="remove" size={22} color={Colors.navy} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.listHead}>
          <Text style={styles.listTitle}>Members Near You</Text>
          <Text style={styles.listCount}>{items.length} members found</Text>
        </View>

        <View style={styles.pills}>
          <Menu
            icon="location-outline"
            label={maxKm === Infinity ? "Distance" : `≤ ${maxKm} km`}
            active={maxKm !== Infinity}
            options={DISTANCES.map((d) => ({ key: String(d.km), label: d.label }))}
            value={String(maxKm)}
            onChange={(k) => setMaxKm(Number(k))}
          />
          <Menu
            icon="briefcase-outline"
            label={industryValue || (industries.length > 1 ? `${industries.length} industries` : "Industry")}
            active={industries.length > 0}
            options={industryOptions}
            value={industryValue}
            onChange={(k) => setMapFilters({ industries: k ? [k] : [] })}
          />
          <Menu icon="swap-vertical" label="Sort" active={false} options={SORTS.map((s) => ({ key: s.key, label: s.label }))} value={sort} onChange={(k) => setSort(k as SortKey)} />
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={40} color={Colors.goldDark} />
            <Text style={styles.emptyTitle}>No members here yet</Text>
            <Text style={styles.emptyText}>Try another city, widen the distance or clear your filters.</Text>
          </View>
        ) : (
          items.map(({ member: m, km }) => (
            <Pressable
              key={m.name}
              style={[styles.row, selected === m.name && styles.rowOn]}
              onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })}
              accessibilityRole="button"
              accessibilityLabel={`View ${m.name}'s profile`}
            >
              <Avatar name={m.name} photo={m.photo} size={52} />
              <View style={styles.rowInfo}>
                <Text style={styles.name} numberOfLines={1}>
                  {m.name}
                </Text>
                <Text style={styles.role} numberOfLines={1}>
                  {m.role}, {m.company}
                </Text>
                <View style={styles.meta}>
                  <Ionicons name="location-outline" size={13} color={Colors.goldDark} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {m.city}, {m.country} • {km.toFixed(1)} km
                  </Text>
                </View>
              </View>
              <View style={styles.viewBtn}>
                <Text style={styles.viewText}>View Profile</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.navy} />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16, gap: 10, paddingBottom: 10 },
  searchRow: { flexDirection: "row", gap: 10 },
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, height: 50, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#F6F8FC" },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.navy, padding: 0 },
  filter: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  badgeText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 11 },

  scroll: { gap: 14 },
  map: { height: MAP_HEIGHT, backgroundColor: "#E8F0E4", overflow: "hidden" },
  road: { position: "absolute", backgroundColor: "#FFFFFF", opacity: 0.9 },
  park: { position: "absolute", borderRadius: 18, backgroundColor: "#CFE5C5" },
  halo: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(47,111,222,0.12)" },
  you: { position: "absolute", width: 14, height: 14, borderRadius: 7, backgroundColor: "#2F6FDE", borderWidth: 2, borderColor: Colors.white },
  cityLabel: { position: "absolute", width: 120, textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  pin: { position: "absolute", width: PIN, alignItems: "center" },
  pinTop: { zIndex: 5 },
  pinHead: { width: PIN, height: PIN, borderRadius: PIN / 2, borderWidth: 3, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pinHeadOn: { transform: [{ scale: 1.15 }] },
  pinTip: { width: 0, height: 0, marginTop: -2, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent" },
  callout: { position: "absolute", bottom: PIN + 14, minWidth: 90, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.navy, alignItems: "center" },
  calloutText: { color: Colors.white, fontFamily: Fonts.semiBold, fontSize: 11 },
  legend: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: Colors.white, ...CARD_SHADOW },
  legendDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.gold },
  legendText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  controls: { position: "absolute", right: 12, bottom: 12, gap: 10, alignItems: "center" },
  ctrl: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
  zoom: { borderRadius: 22, backgroundColor: Colors.white, ...CARD_SHADOW },
  zoomBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  zoomDivider: { height: 1, backgroundColor: "#EEF1F5", marginHorizontal: 10 },

  listHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  listTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  listCount: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
  pills: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#F6F8FC" },
  pillOn: { borderColor: Colors.gold, backgroundColor: GOLD_BG },
  pillText: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  pillTextOn: { color: Colors.goldDark, fontFamily: Fonts.semiBold },

  row: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, paddingVertical: 10, paddingHorizontal: 8, borderRadius: Radius.md, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  rowOn: { backgroundColor: GOLD_BG },
  rowInfo: { flex: 1, minWidth: 0, gap: 2 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11 },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 2, height: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: "#EEF2FA" },
  viewText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 11 },

  empty: { alignItems: "center", gap: 8, paddingVertical: 32, paddingHorizontal: 32 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center" },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, maxHeight: "70%" },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 8 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  optionOn: { fontFamily: Fonts.bold, color: Colors.goldDark },
});
