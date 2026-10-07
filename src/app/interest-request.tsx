import { OppHero, OfferPills, TopBar } from "@/components/interest-ui";
import { Avatar } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { Decision } from "@/lib/opportunity-store";
import { findOpp, formatDateTime } from "@/lib/opportunity-lookup";
import { decideIncoming, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BUTTONS: { decision: Decision; label: string; icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string; border: string }[] = [
  { decision: "Accepted", label: "Accept", icon: "checkmark-circle", fg: "#1E7F55", bg: "#DDF4E7", border: "#7BD3A5" },
  { decision: "Discussing", label: "Discuss", icon: "chatbox-ellipses-outline", fg: Colors.goldDark, bg: "#FEF3DA", border: Colors.champagne },
  { decision: "Declined", label: "Decline", icon: "close", fg: Colors.error, bg: "#FDE8E8", border: "#F1A6A6" },
];

export default function InterestRequest() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incoming, mine } = useOpportunities();
  const req = incoming.find((r) => r.id === id);
  const o = findOpp(req?.oppId, mine);

  if (!req || !o) {
    return (
      <View style={styles.container}>
        <TopBar title="New Interest Request" />
        <Text style={styles.none}>This request is no longer available.</Text>
      </View>
    );
  }

  const decide = (d: Decision) => {
    if (d !== "Declined") return decideIncoming(req.id, d);
    Alert.alert("Decline request?", `${req.name} will be told you are not taking this forward.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Decline", style: "destructive", onPress: () => decideIncoming(req.id, d) },
    ]);
  };
  const done = BUTTONS.find((b) => b.decision === req.decision);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TopBar title="New Interest Request" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <OppHero o={o} pill tags={false} facts={false} />

        <Text style={styles.h}>Interested Member</Text>
        <View style={styles.member}>
          <Avatar name={req.name} size={60} />
          <View style={styles.flex}>
            <Text style={styles.name}>{req.name}</Text>
            <Text style={styles.sub}>{req.role}</Text>
            <Text style={styles.sub}>{req.company}</Text>
            <View style={styles.loc}>
              <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.sub}>{req.location}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.h}>Their Interest</Text>
        <Text style={styles.p}>{req.why}</Text>

        <Text style={styles.h}>What They Can Offer</Text>
        <OfferPills offers={req.offers} />

        <View style={styles.submitted}>
          <Ionicons name="calendar-outline" size={22} color={Colors.navy} />
          <View>
            <Text style={styles.subLabel}>Submitted On</Text>
            <Text style={styles.name}>{formatDateTime(req.submittedAt)}</Text>
          </View>
        </View>

        {done ? (
          <View style={[styles.decided, { backgroundColor: done.bg, borderColor: done.border }]}>
            <Ionicons name={done.icon} size={20} color={done.fg} />
            <Text style={[styles.decidedText, { color: done.fg }]}>{`You marked this request as ${done.decision.toLowerCase()}.`}</Text>
          </View>
        ) : (
          <View style={styles.actions}>
            {BUTTONS.map((b) => (
              <Pressable key={b.decision} onPress={() => decide(b.decision)} style={({ pressed }) => [styles.action, { backgroundColor: b.bg, borderColor: b.border }, pressed && styles.pressed]} accessibilityRole="button">
                <Ionicons name={b.icon} size={18} color={b.fg} />
                <Text style={[styles.actionText, { color: b.fg }]}>{b.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 40 },
  scroll: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginTop: 6 },
  p: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 19 },
  member: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  subLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  loc: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  submitted: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  action: { flex: 1, height: 46, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", borderRadius: Radius.sm, borderWidth: 1 },
  actionText: { fontFamily: Fonts.bold, fontSize: 13 },
  decided: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.md, borderWidth: 1, marginTop: 6 },
  decidedText: { flex: 1, fontFamily: Fonts.semiBold, fontSize: 13 },
});
