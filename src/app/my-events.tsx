import { EmptyState } from "@/components/empty-state";
import { PillTabs } from "@/components/event-ui";
import { ScreenHeader } from "@/components/member-ui";
import { TicketCard, openTicket, toTickets } from "@/components/ticket-ui";
import { Colors, Fonts } from "@/constants/theme";
import { useEvents } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = ["Upcoming", "Past"] as const;
type Tab = (typeof TABS)[number];

export default function MyEvents() {
  const insets = useSafeAreaInsets();
  const { registrations } = useEvents();
  const [tab, setTab] = useState<Tab>("Upcoming");

  const tickets = toTickets(registrations);
  const upcoming = tickets.filter((t) => t.event.when === "Upcoming").sort((a, b) => a.event.date.localeCompare(b.event.date));
  const past = tickets.filter((t) => t.event.when === "Past").sort((a, b) => b.event.date.localeCompare(a.event.date));
  const list = tab === "Upcoming" ? upcoming : past;
  const labels = { Upcoming: `Upcoming (${upcoming.length})`, Past: `Past (${past.length})` };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="My Events"
          right={
            <Pressable onPress={() => router.push("/ticket-status")} hitSlop={10} accessibilityRole="button" accessibilityLabel="Registration status">
              <Ionicons name="filter-outline" size={22} color={Colors.navy} />
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>Manage your event registrations and tickets.</Text>
        <PillTabs options={TABS} selected={tab} onSelect={setTab} labels={labels} />

        {list.length ? (
          list.map((t) => <TicketCard key={t.reg.ticketId} ticket={t} action="View Ticket" onPress={() => openTicket(t.event.id)} />)
        ) : (
          <EmptyState
            inline
            icon="ticket-outline"
            title={tab === "Upcoming" ? "No Upcoming Events" : "No Past Events"}
            text={tab === "Upcoming" ? "Register for an event and your ticket will appear here." : "Events you have attended will appear here."}
            cta={{ label: "Browse Events", onPress: () => router.navigate("/events") }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 4, gap: 14 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
});
