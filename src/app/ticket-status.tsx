import { EmptyState } from "@/components/empty-state";
import { ScreenHeader } from "@/components/member-ui";
import { TicketCard, openTicket, toTickets } from "@/components/ticket-ui";
import { Colors, Fonts } from "@/constants/theme";
import { useEvents } from "@/lib/event-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTERS = ["All", "Confirmed", "Pending", "Cancelled"] as const;
type Filter = (typeof FILTERS)[number];

export default function TicketStatus() {
  const insets = useSafeAreaInsets();
  const { registrations, cancelled } = useEvents();
  const [filter, setFilter] = useState<Filter>("All");

  const all = toTickets([...registrations, ...cancelled]).sort((a, b) => b.reg.registeredAt - a.reg.registeredAt);
  const count = (f: Filter) => (f === "All" ? all.length : all.filter((t) => t.reg.status === f).length);
  const list = filter === "All" ? all : all.filter((t) => t.reg.status === filter);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Registration Status" />
      </View>

      <View style={styles.chips}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: filter === f }}>
            <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{`${f} (${count(f)})`}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]} showsVerticalScrollIndicator={false}>
        {list.length ? (
          list.map((t) => (
            <TicketCard
              key={`${t.reg.ticketId}-${t.reg.status}`}
              ticket={t}
              action={t.reg.status === "Confirmed" ? "View Ticket" : "View Details"}
              onPress={() => (t.reg.status === "Cancelled" ? router.push({ pathname: "/event-details", params: { id: t.event.id } }) : openTicket(t.event.id))}
            />
          ))
        ) : (
          <EmptyState inline icon="ticket-outline" title="No Registrations" text={filter === "All" ? "Register for an event to see its status here." : `You have no ${filter.toLowerCase()} registrations.`} cta={{ label: "Browse Events", onPress: () => router.navigate("/events") }} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F5F7FC" },
  chipOn: { backgroundColor: Colors.goldDark },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  chipTextOn: { color: Colors.white, fontFamily: Fonts.semiBold },
  scroll: { paddingHorizontal: 16, gap: 14 },
});
