import { EventCard, FeaturedEventCard, PillTabs } from "@/components/event-ui";
import { SearchBar } from "@/components/opportunity-ui";
import { TabHeader } from "@/components/tab-header";
import { Colors, Fonts } from "@/constants/theme";
import { EMPTY_EVENT_FILTERS, WHEN, type When, activeEventFilterCount, searchEvents } from "@/data/events";
import { setEvents, useEvents } from "@/lib/event-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Events() {
  const { filters } = useEvents();
  const [when, setWhen] = useState<When>("Upcoming");
  const [text, setText] = useState("");

  // The listing ignores filters; they apply on the results screen.
  const list = useMemo(() => searchEvents("", EMPTY_EVENT_FILTERS, when), [when]);
  const featured = when === "Upcoming" ? (list.find((e) => e.featured) ?? list[0]) : undefined;
  const rest = list.filter((e) => e !== featured);

  const search = () => {
    setEvents({ query: text.trim() });
    router.push("/event-results");
  };
  const openFilters = () => {
    setEvents({ query: text.trim() });
    router.push("/filter-events");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TabHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.heroTitle}>Events</Text>

        <PillTabs options={WHEN} selected={when} onSelect={setWhen} />

        <SearchBar value={text} onChangeText={setText} onSubmit={search} onClear={() => setText("")} placeholder="Search events..." onFilter={openFilters} filterCount={activeEventFilterCount(filters)} />

        {list.length === 0 ? (
          <Text style={styles.none}>{`No ${when.toLowerCase()} events yet.`}</Text>
        ) : (
          <>
            {featured ? (
              <>
                <Text style={styles.sectionTitle}>Featured Event</Text>
                <FeaturedEventCard e={featured} />
              </>
            ) : null}
            {rest.length ? <Text style={styles.sectionTitle}>{`${when} Events`}</Text> : null}
            {rest.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 14 },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginTop: 4 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 32 },
});
