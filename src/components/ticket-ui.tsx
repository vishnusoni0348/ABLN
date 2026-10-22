import { EventThumb } from "@/components/event-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS, type AppEvent, formatEventDate } from "@/data/events";
import type { Registration, TicketStatus } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type Ticket = { reg: Registration; event: AppEvent };

// Pairs registrations with their events, dropping any whose event no longer exists.
export const toTickets = (regs: Registration[]): Ticket[] => regs.flatMap((reg) => EVENTS.filter((e) => e.id === reg.eventId).map((event) => ({ reg, event })));

export const openTicket = (id: string) => router.push({ pathname: "/event-ticket", params: { id } });

const TONE: Record<TicketStatus, { icon: IconName; fg: string; bg: string }> = {
  Confirmed: { icon: "checkmark-circle", fg: Colors.success, bg: "#E8F7EF" },
  Pending: { icon: "time", fg: Colors.goldDark, bg: "#FDF0D2" },
  Cancelled: { icon: "close-circle", fg: Colors.error, bg: "#FCE9E9" },
};

export function TicketStatusPill({ status }: { status: TicketStatus }) {
  const t = TONE[status];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Ionicons name={t.icon} size={14} color={t.fg} />
      <Text style={[styles.pillText, { color: t.fg }]}>{status}</Text>
    </View>
  );
}

export function InfoRow({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icon} size={14} color={Colors.navy} />
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

// Card used by both "My Events" and the registration status list.
export function TicketCard({ ticket, action, onPress }: { ticket: Ticket; action: string; onPress: () => void }) {
  const { event: e, reg } = ticket;
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button" accessibilityLabel={e.title}>
      <EventThumb event={e} style={styles.thumb} />
      <View style={styles.flex}>
        <TicketStatusPill status={reg.status} />
        <Text style={styles.title}>{e.title}</Text>
        <InfoRow icon="calendar-outline">{formatEventDate(e.date)}</InfoRow>
        <InfoRow icon="time-outline">{e.time}</InfoRow>
        <InfoRow icon="location-outline">{e.location}</InfoRow>
        <View style={styles.action}>
          <Text style={styles.actionText}>{action}</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.goldDark} />
        </View>
      </View>
    </Pressable>
  );
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <View style={styles.kvValue}>{typeof children === "string" ? <Text style={styles.kvText}>{children}</Text> : children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  pillText: { fontFamily: Fonts.semiBold, fontSize: 11 },
  info: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  infoText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  card: { flexDirection: "row", gap: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white },
  thumb: { width: 84, height: 104, borderRadius: Radius.sm },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 19, marginTop: 6 },
  action: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, marginTop: 10, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.gold },
  actionText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  kv: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 7 },
  kvLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  kvValue: { alignItems: "flex-end" },
  kvText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
});
