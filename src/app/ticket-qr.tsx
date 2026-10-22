import { ScreenHeader } from "@/components/member-ui";
import { QrCode } from "@/components/qr-code";
import { KeyValue, TicketStatusPill } from "@/components/ticket-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS, formatEventDate } from "@/data/events";
import { useEvents } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TicketQr() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { registrations } = useEvents();

  const e = EVENTS.find((x) => x.id === id);
  const reg = registrations.find((r) => r.eventId === id);

  if (!e || !reg) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <StatusBar style="dark" />
        <ScreenHeader title="My Ticket QR Code" />
        <Text style={styles.none}>This ticket is no longer available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="My Ticket QR Code" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.pass}>
          <Text style={styles.brand}>ABLN</Text>
          <Text style={styles.brandSub}>Agarwal Business Leaders Network</Text>
        </View>

        <Text style={styles.title}>{e.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.navy} />
          <Text style={styles.meta}>{`${formatEventDate(e.date)}  ·  ${e.time}`}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.navy} />
          <Text style={styles.meta}>{e.location}</Text>
        </View>

        <View style={styles.qrWrap}>
          <View style={styles.qrFrame}>
            <QrCode value={`ABLN|TICKET|${reg.ticketId}|${e.id}|${reg.attendees}`} size={220} />
          </View>
          <Text style={styles.hint}>Show this QR code at the event entry</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.name}>{reg.name}</Text>
          <Text style={styles.role}>{[reg.designation, reg.company].filter(Boolean).join(", ")}</Text>
          <View style={styles.divider} />
          <KeyValue label="Ticket ID">{reg.ticketId}</KeyValue>
          <KeyValue label="Ticket Type">Full Access Pass</KeyValue>
          <KeyValue label="Status">
            <TicketStatusPill status={reg.status} />
          </KeyValue>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  pass: { alignItems: "center", paddingVertical: 16, borderRadius: Radius.md, backgroundColor: Colors.navy },
  brand: { color: Colors.gold, fontFamily: Fonts.bold, fontSize: 28, letterSpacing: 2 },
  brandSub: { color: Colors.white, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, lineHeight: 26, textAlign: "center", marginTop: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  qrWrap: { alignItems: "center", marginVertical: 12, gap: 10 },
  qrFrame: { padding: 16, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.gold, backgroundColor: Colors.white },
  hint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  details: { padding: 14, borderRadius: Radius.md, backgroundColor: "#F5F7FC" },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "#E3E8F0", marginVertical: 8 },
});
