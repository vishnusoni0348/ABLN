import { EventCard, EventSkeleton, PillTabs } from "@/components/event-ui";
import { ScreenHeader } from "@/components/member-ui";
import { ChipRow, GoldButton, SearchBar } from "@/components/opportunity-ui";
import { useUnreadCount } from "@/lib/notification-store";
import { HeaderIconButton } from "@/components/tab-header";
import { Colors, Fonts } from "@/constants/theme";
import { EMPTY_EVENT_FILTERS, EVENT_STATUSES, EVENT_TYPES, type EventFilters, activeEventFilterCount, searchEvents } from "@/data/events";
import { setEvents, useEvents } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ALL = "All";
type Tab = "All" | "Upcoming" | "Past";
const TABS: readonly Tab[] = ["All", "Upcoming", "Past"];

export default function EventResults() {
  const insets = useSafeAreaInsets();
  const unread = useUnreadCount();
  const { query, filters } = useEvents();
  const [tab, setTab] = useState<Tab>("All");
  const [loading, setLoading] = useState(true);

  // Stand-in for the request latency of the events API.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const all = useMemo(() => searchEvents(query, filters), [query, filters]);
  const upcoming = all.filter((e) => e.when === "Upcoming");
  const past = all.filter((e) => e.when === "Past");
  const shown = tab === "All" ? all : tab === "Upcoming" ? upcoming : past;
  const labels = { All: `All (${all.length})`, Upcoming: `Upcoming (${upcoming.length})`, Past: `Past (${past.length})` };

  const setFilter = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => setEvents({ filters: { ...filters, [key]: value } });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Events" right={<HeaderIconButton icon="notifications-outline" onPress={() => router.push("/notifications")} label="Notifications" dot={unread > 0} />} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 24 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SearchBar
          value={query}
          onChangeText={(q) => setEvents({ query: q })}
          onClear={() => setEvents({ query: "" })}
          placeholder="Search events..."
          onFilter={() => router.navigate("/filter-events")}
          filterCount={activeEventFilterCount(filters)}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.bleedContent}>
          <PillTabs options={TABS} selected={tab} onSelect={setTab} labels={labels} />
        </ScrollView>

        <ChipRow scroll options={[ALL, ...EVENT_TYPES]} selected={filters.type} onSelect={(t) => setFilter("type", t as EventFilters["type"])} />

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Event Status</Text>
          <ChipRow scroll options={[ALL, ...EVENT_STATUSES]} selected={filters.status} onSelect={(s) => setFilter("status", s as EventFilters["status"])} />
        </View>

        {loading ? (
          <>
            <EventSkeleton />
            <View style={styles.loadingRow}>
              <Ionicons name="reload" size={16} color={Colors.goldDark} />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          </>
        ) : shown.length > 0 ? (
          shown.map((e) => <EventCard key={e.id} e={e} capacity />)
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyArt}>
              <Ionicons name="calendar-outline" size={64} color={Colors.goldDark} />
              <View style={styles.lens}>
                <Ionicons name="search" size={30} color={Colors.white} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptyText}>We couldn&apos;t find any events matching your search and filters.</Text>
            <GoldButton label="Browse All Events" onPress={() => setEvents({ query: "", filters: EMPTY_EVENT_FILTERS })} style={styles.fullBtn} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  bleed: { flexGrow: 0, marginHorizontal: -16 },
  bleedContent: { paddingHorizontal: 16 },
  group: { gap: 10 },
  groupTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },

  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 8 },
  loadingText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },

  empty: { alignItems: "center", gap: 12, paddingTop: 16 },
  emptyArt: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#FBEBCB", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 12 },
  lens: { position: "absolute", right: 26, bottom: 28, width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.goldDark, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, textAlign: "center", marginBottom: 8, paddingHorizontal: 8 },
  fullBtn: { alignSelf: "stretch" },
});
