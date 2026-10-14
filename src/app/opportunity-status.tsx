import { TopBar } from "@/components/interest-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { OppThumb } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { MineStatus } from "@/data/opportunities";
import { useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = { title: string; text: string; state: "done" | "current" | "todo" | "bad"; date: string };

const BADGE: Record<MineStatus, { label: string; bg: string; fg: string; text: string }> = {
  Pending: { label: "Under Review", bg: "#FDEBC8", fg: Colors.goldDark, text: "Our team is reviewing your opportunity. You will be notified once it's live." },
  Active: { label: "Published", bg: "#DDF4E7", fg: Colors.success, text: "Your opportunity is live and visible to ABLN members." },
  Paused: { label: "Paused", bg: "#E9ECF3", fg: Colors.textSecondary, text: "Your opportunity is hidden from members. Resume it to make it visible again." },
  Closed: { label: "Closed", bg: "#FBDADA", fg: Colors.error, text: "This opportunity is closed and no longer receives requests." },
};

// Builds the timeline from the opportunity's current status.
function buildSteps(status: MineStatus, posted: string, requests: number): Step[] {
  const published = status !== "Pending";
  const steps: Step[] = [
    { title: "Submitted", text: "Your opportunity was sent to the ABLN team.", state: "done", date: posted },
    { title: "Under Review", text: "Our team is reviewing your opportunity.", state: published ? "done" : "current", date: "-" },
    { title: "Published", text: "Your opportunity is live for ABLN members.", state: published ? "done" : "todo", date: "-" },
  ];
  if (status === "Paused") steps.push({ title: "Paused", text: "Temporarily hidden from members.", state: "current", date: "-" });
  else if (status === "Closed") steps.push({ title: "Closed", text: "No longer receiving requests.", state: "bad", date: "-" });
  else steps.push({ title: "Interested Members", text: requests ? `${requests} interest ${requests === 1 ? "request" : "requests"} received.` : "Receive and manage expressions of interest.", state: status === "Active" ? "current" : "todo", date: "-" });
  return steps;
}

export default function OpportunityStatus() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mine, incoming } = useOpportunities();
  const o = mine.find((m) => m.id === id);

  if (!o) {
    return (
      <View style={styles.container}>
        <TopBar title="Opportunity Status" />
        <Text style={styles.none}>This opportunity is no longer available.</Text>
      </View>
    );
  }

  const badge = BADGE[o.status];
  const steps = buildSteps(o.status, o.postedLabel, incoming.filter((r) => r.oppId === o.id).length);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TopBar title="Opportunity Status" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <Pressable style={[styles.card, CARD_SHADOW]} onPress={() => router.push({ pathname: "/opportunity-details", params: { id: o.id } })} accessibilityRole="button" accessibilityLabel={`Open ${o.title}`}>
          <OppThumb category={o.category} uri={o.cover} size={72} />
          <View style={styles.flex}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {o.title}
            </Text>
            <Text style={styles.meta}>{`Posted: ${o.postedLabel}`}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.navy} />
        </Pressable>

        <View style={[styles.current, { backgroundColor: badge.bg }]}>
          <Text style={styles.currentLabel}>Current Status</Text>
          <Text style={[styles.currentValue, { color: badge.fg }]}>{badge.label}</Text>
          <Text style={styles.currentText}>{badge.text}</Text>
        </View>

        <View style={styles.timeline}>
          {steps.map((s, i) => {
            const color = s.state === "done" ? Colors.success : s.state === "current" ? Colors.goldDark : s.state === "bad" ? Colors.error : "#9AA7C0";
            return (
              <View key={s.title} style={styles.row}>
                <View style={styles.rail}>
                  <View style={[styles.dot, s.state === "done" && { backgroundColor: Colors.success, borderColor: Colors.success }, s.state === "current" && { borderColor: Colors.goldDark, backgroundColor: Colors.goldDark }, s.state === "bad" && { borderColor: Colors.error, backgroundColor: Colors.error }, s.state === "todo" && { borderColor: "#B5C0DA", backgroundColor: "#E3E8F4" }]}>
                    {s.state === "done" ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : s.state === "bad" ? <Ionicons name="close" size={14} color={Colors.white} /> : null}
                  </View>
                  {i < steps.length - 1 ? <View style={[styles.line, s.state === "done" && { backgroundColor: Colors.success }]} /> : null}
                </View>
                <View style={styles.text}>
                  <Text style={[styles.stepTitle, { color: s.state === "current" || s.state === "bad" ? color : Colors.navy }]}>{s.title}</Text>
                  {s.date !== "-" ? <Text style={styles.stepDate}>{s.date}</Text> : null}
                  <Text style={styles.stepText}>{s.text}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.royalNavy} />
          <Text style={styles.noteText}>You will be notified about any updates on this opportunity.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 40 },
  scroll: { paddingHorizontal: 16, paddingTop: 4, gap: 18 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },

  current: { padding: 14, borderRadius: Radius.md, gap: 2 },
  currentLabel: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 11 },
  currentValue: { fontFamily: Fonts.bold, fontSize: 18 },
  currentText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },

  timeline: { paddingHorizontal: 4 },
  row: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: 24 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  line: { width: 2, flex: 1, minHeight: 28, backgroundColor: Colors.border },
  text: { flex: 1, paddingBottom: 18 },
  stepTitle: { fontFamily: Fonts.bold, fontSize: 13 },
  stepDate: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  stepText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },

  note: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.md, backgroundColor: "#EAF0FB" },
  noteText: { flex: 1, color: Colors.royalNavy, fontFamily: Fonts.regular, fontSize: 12 },
});
