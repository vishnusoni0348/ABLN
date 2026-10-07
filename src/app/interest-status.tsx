import { TopBar } from "@/components/interest-ui";
import { OppThumb } from "@/components/opportunity-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findOpp, formatDateTime } from "@/lib/opportunity-lookup";
import { type Interest, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = { title: string; text: string; state: "done" | "current" | "todo" | "bad"; date: string };

// Builds the five-step timeline from the interest's status and whether the opportunity has closed.
function buildSteps(i: Interest, closed: boolean): Step[] {
  const cur = { Pending: 1, Discussion: 2, Accepted: 3, Declined: 3 }[i.status];
  const closeNow = closed && i.status !== "Accepted";
  const state = (idx: number): Step["state"] => {
    if (idx < cur) return "done";
    if (idx > cur) return "todo";
    if (i.status === "Accepted") return "done";
    if (i.status === "Declined") return "bad";
    return closeNow ? "done" : "current";
  };
  // Only the latest reached step carries the time the owner acted.
  const when = (idx: number) => (idx === cur && i.updatedAt ? formatDateTime(i.updatedAt) : "-");
  return [
    { title: "Interest Submitted", text: "Your expression of interest has been sent to the opportunity owner.", state: "done", date: formatDateTime(i.submittedAt) },
    { title: "Under Review", text: "The owner is reviewing your request.", state: state(1), date: when(1) },
    { title: "Discussion Started", text: "Once accepted, you can start a discussion with the owner.", state: state(2), date: when(2) },
    i.status === "Declined"
      ? { title: "Declined", text: "The owner chose not to take this forward.", state: "bad", date: when(3) }
      : { title: "Accepted", text: "You can now connect and take this opportunity forward.", state: state(3), date: when(3) },
    { title: "Closed", text: "This opportunity has been closed.", state: closeNow ? "current" : "todo", date: "-" },
  ];
}

export default function InterestStatus() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { interests, mine } = useOpportunities();
  const interest = interests.find((i) => i.id === id);
  const o = findOpp(interest?.oppId, mine);

  if (!interest || !o) {
    return (
      <View style={styles.container}>
        <TopBar title="Interest Status" />
        <Text style={styles.none}>This interest is no longer available.</Text>
      </View>
    );
  }

  const steps = buildSteps(interest, o.closed);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TopBar title="Interest Status" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <Pressable style={[styles.card, CARD_SHADOW]} onPress={() => router.push({ pathname: "/opportunity-details", params: { id: o.id } })} accessibilityRole="button" accessibilityLabel={`Open ${o.title}`}>
          <OppThumb category={o.category} uri={o.cover} size={72} />
          <View style={styles.flex}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {o.title}
            </Text>
            <Text style={styles.meta}>{o.location}</Text>
            <Text style={styles.meta}>{o.valueLabel}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.navy} />
        </Pressable>

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
                  <Text style={styles.stepDate}>{s.date}</Text>
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
