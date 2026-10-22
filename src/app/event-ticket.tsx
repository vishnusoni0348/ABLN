import { EventThumb } from "@/components/event-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Cta } from "@/components/partner-ui";
import { InfoRow, KeyValue, TicketStatusPill } from "@/components/ticket-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS, calendarUrl, formatEventDate } from "@/data/events";
import { useEvents } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EventTicket() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { registrations, cancelled } = useEvents();

  const e = EVENTS.find((x) => x.id === id);
  const reg = registrations.find((r) => r.eventId === id) ?? cancelled.find((r) => r.eventId === id);

  if (!e || !reg) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <StatusBar style="dark" />
        <ScreenHeader title="Event Ticket Detail" />
        <Text style={styles.none}>This ticket is no longer available.</Text>
      </View>
    );
  }

  const active = reg.status === "Confirmed";
  const booked = new Date(reg.registeredAt);
  const bookedOn = `${booked.getDate()} ${booked.toLocaleString("en-US", { month: "short" })} ${booked.getFullYear()}`;
  const share = () => Share.share({ message: `${e.title} — ${formatEventDate(e.date)}, ${e.time}, ${e.location}` });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="Event Ticket Detail"
          right={
            <Pressable onPress={share} hitSlop={10} accessibilityRole="button" accessibilityLabel="Share event">
              <Ionicons name="share-social-outline" size={22} color={Colors.navy} />
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <EventThumb event={e} style={styles.hero} />
        <View>
          <Text style={styles.title}>{e.title}</Text>
          <Text style={styles.tagline}>{e.category} · {e.type}</Text>
        </View>
        <View style={styles.infoBlock}>
          <InfoRow icon="calendar-outline">{formatEventDate(e.date)}</InfoRow>
          <InfoRow icon="time-outline">{e.time}</InfoRow>
          <InfoRow icon="location-outline">{e.location}</InfoRow>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.section}>Attendee Details</Text>
          {active ? (
            <Pressable onPress={() => router.push({ pathname: "/event-register", params: { id: e.id } })} hitSlop={10} accessibilityRole="button">
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.attendee}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={Colors.white} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>{reg.name}</Text>
            <Text style={styles.role}>{[reg.designation, reg.company].filter(Boolean).join(", ")}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <KeyValue label="Ticket ID">{reg.ticketId}</KeyValue>
          <KeyValue label="Ticket Type">Full Access Pass</KeyValue>
          <KeyValue label="Attendees">{String(reg.attendees)}</KeyValue>
          <KeyValue label="Booking Date">{bookedOn}</KeyValue>
          <KeyValue label="Status">
            <TicketStatusPill status={reg.status} />
          </KeyValue>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {active ? <Cta label="View QR Ticket" onPress={() => router.push({ pathname: "/ticket-qr", params: { id: e.id } })} /> : null}
        {e.when === "Upcoming" ? <Cta variant="outline" label="Add to Calendar" onPress={() => Linking.openURL(calendarUrl(e))} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  top: { paddingHorizontal: 16 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 14 },
  hero: { height: 170, borderRadius: Radius.md },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, lineHeight: 28 },
  tagline: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
  infoBlock: { gap: 2 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  section: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  edit: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  attendee: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.navy, alignItems: "center", justifyContent: "center" },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  details: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.md, backgroundColor: "#F5F7FC" },
  footer: { paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
