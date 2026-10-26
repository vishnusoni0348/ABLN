import { CARD_SHADOW } from "@/components/member-ui";
import { GoldButton, OutlineBtn, SettingsScreen } from "@/components/settings-ui";
import { CategoryBadge, StatusPill } from "@/components/support-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { TICKET_STEPS, formatStamp, useTicket, type Ticket, type TicketStep } from "@/lib/support-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const STEP_COPY: Record<TicketStep, { label: string; done: string; pending: string }> = {
  submitted: { label: "Submitted", done: "Your ticket has been submitted successfully.", pending: "Waiting to be submitted." },
  assigned: { label: "Assigned to Support", done: "Your ticket has been assigned to our support team.", pending: "Pending" },
  progress: { label: "In Progress", done: "Our team is working on your request.", pending: "Pending" },
  resolved: { label: "Resolved", done: "Your ticket has been resolved.", pending: "Your ticket will be marked as resolved once the issue is fixed." },
};

function Timeline({ ticket }: { ticket: Ticket }) {
  const reached = TICKET_STEPS.filter((s) => ticket.reached[s]);
  const current = reached[reached.length - 1];
  return (
    <View>
      {TICKET_STEPS.map((step, i) => {
        const at = ticket.reached[step];
        const done = !!at;
        const isCurrent = step === current && step !== "resolved";
        const copy = STEP_COPY[step];
        const last = i === TICKET_STEPS.length - 1;
        return (
          <View key={step} style={[styles.step, isCurrent && styles.stepCurrent]}>
            <View style={styles.rail}>
              <View style={[styles.dot, done && !isCurrent && styles.dotDone, isCurrent && styles.dotCurrent]}>
                {done && !isCurrent ? <Ionicons name="checkmark" size={16} color={Colors.white} /> : isCurrent ? <View style={styles.dotInner} /> : null}
              </View>
              {!last ? <View style={[styles.line, ticket.reached[TICKET_STEPS[i + 1]] ? styles.lineDone : null]} /> : null}
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepLabel}>{copy.label}</Text>
              <Text style={styles.stepTime}>{at ? formatStamp(at) : "Pending"}</Text>
            </View>
            <Text style={styles.stepDesc}>{done ? copy.done : step === "resolved" ? copy.pending : ""}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function SupportTicketStatus() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const ticket = useTicket(id);

  if (!ticket) {
    return (
      <SettingsScreen title="Ticket Status">
        <Text style={styles.empty}>This ticket could not be found.</Text>
      </SettingsScreen>
    );
  }

  return (
    <SettingsScreen
      title="Ticket Status"
      footer={
        <>
          <GoldButton label="Back to My Tickets" onPress={() => router.navigate("/support-tickets")} />
          {ticket.status !== "Resolved" ? <OutlineBtn label="Add Reply" icon="chatbubble-ellipses-outline" onPress={() => router.navigate({ pathname: "/support-ticket", params: { id: ticket.id } })} /> : null}
        </>
      }
    >
      <Text style={styles.sub}>Track the progress of your support request.</Text>

      <View style={styles.summary}>
        <CategoryBadge category={ticket.category} size={48} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text style={styles.title}>{ticket.title}</Text>
          <View style={styles.row}>
            <Text style={styles.meta}>Ticket #{ticket.id}</Text>
            <StatusPill status={ticket.status} />
          </View>
          <Text style={styles.meta}>
            {ticket.category} · {ticket.priority}
          </Text>
          <Text style={styles.meta}>Created on {formatStamp(ticket.createdAt)}</Text>
        </View>
      </View>

      <Timeline ticket={ticket} />

      <View style={styles.expect}>
        <Ionicons name="time-outline" size={26} color="#2F6FED" />
        <View style={{ flex: 1 }}>
          <Text style={styles.expectTitle}>Expected Response Time</Text>
          <Text style={styles.expectText}>We usually respond within 24 hours.</Text>
        </View>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, paddingVertical: 40 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, marginTop: -4 },
  summary: { flexDirection: "row", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  step: { flexDirection: "row", gap: 12, paddingHorizontal: 8, paddingBottom: 18, borderRadius: Radius.md },
  stepCurrent: { backgroundColor: "#FEF6E6", paddingTop: 8, marginBottom: 10 },
  rail: { alignItems: "center", width: 28 },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#CBD3DF", alignItems: "center", justifyContent: "center" },
  dotDone: { backgroundColor: Colors.success },
  dotCurrent: { backgroundColor: "#F5A623" },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.white },
  line: { position: "absolute", top: 30, bottom: -18, width: 2, backgroundColor: "#CBD3DF" },
  lineDone: { backgroundColor: Colors.success },
  stepBody: { flex: 1, minWidth: 0 },
  stepLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  stepTime: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  stepDesc: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  expect: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: "#EAF1FD" },
  expectTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  expectText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
});
