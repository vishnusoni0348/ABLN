import { CARD_SHADOW } from "@/components/member-ui";
import { GOLD_GRADIENT, OppThumb, STATUS_PILL } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { MineStatus } from "@/data/opportunities";
import { useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COPY = {
  pause: { title: "Opportunity Paused\nSuccessfully!", text: "Your opportunity has been paused and is now hidden from new applicants.", note: "You can resume this opportunity anytime from the opportunity details page.", status: "Paused" },
  resume: { title: "Opportunity Resumed\nSuccessfully!", text: "Your opportunity is live again and members can express interest.", note: "You can pause this opportunity anytime from My Opportunities.", status: "Active" },
  close: { title: "Opportunity Closed\nSuccessfully!", text: "Your opportunity has been closed and is no longer visible to members.", note: "A closed opportunity can't be reopened. You can still view its details and past requests.", status: "Closed" },
} as const;

// Little rays around the check badge, as in the design.
const RAYS = [
  { top: 6, left: 34, rotate: "-35deg", color: "#F4B63F" },
  { top: 0, left: 98, rotate: "0deg", color: "#3DBE8B" },
  { top: 8, right: 30, rotate: "35deg", color: "#F4B63F" },
  { top: 62, left: 4, rotate: "-70deg", color: "#3DBE8B" },
  { top: 62, right: 4, rotate: "70deg", color: "#3DBE8B" },
  { bottom: 14, left: 14, rotate: "-110deg", color: "#F4B63F" },
  { bottom: 14, right: 14, rotate: "110deg", color: "#F4B63F" },
] as const;

function Status({ status }: { status: MineStatus }) {
  const p = STATUS_PILL[status];
  return (
    <View style={[styles.pill, { backgroundColor: p.bg }]}>
      <Text style={[styles.pillText, { color: p.fg }]}>{p.label}</Text>
    </View>
  );
}

export default function OpportunityStatusUpdated() {
  const insets = useSafeAreaInsets();
  const { id, action, from } = useLocalSearchParams<{ id?: string; action?: string; from?: string }>();
  const { mine } = useOpportunities();
  const o = mine.find((m) => m.id === id);
  const c = COPY[action === "close" ? "close" : action === "resume" ? "resume" : "pause"];
  const previous = (from && from in STATUS_PILL ? from : "Active") as MineStatus;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <StatusBar style="dark" />
      <Pressable onPress={() => router.replace("/my-opportunities")} hitSlop={12} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
        <Ionicons name="close" size={26} color={Colors.navy} />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.art}>
          {RAYS.map((r, i) => (
            <View key={i} style={[styles.ray, { backgroundColor: r.color, transform: [{ rotate: r.rotate }] }, r]} />
          ))}
          <View style={styles.halo}>
            <View style={styles.badge}>
              <Ionicons name="checkmark" size={46} color={Colors.white} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{c.title}</Text>
        <Text style={styles.sub}>{c.text}</Text>

        {o ? (
          <View style={[styles.card, CARD_SHADOW]}>
            <View style={styles.cardTop}>
              <OppThumb category={o.category} size={72} uri={o.cover} />
              <Text style={styles.cardTitle} numberOfLines={3}>
                {o.title}
              </Text>
            </View>
            <View style={styles.flow}>
              <View style={styles.flowCol}>
                <Text style={styles.flowLabel}>Previous Status</Text>
                <Status status={previous} />
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.textSecondary} />
              <View style={styles.flowCol}>
                <Text style={styles.flowLabel}>Current Status</Text>
                <Status status={c.status} />
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.note}>
          <Ionicons name="information-circle" size={20} color="#2F6FDE" />
          <Text style={styles.noteText}>{c.note}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {o ? (
          <Pressable onPress={() => router.replace({ pathname: "/opportunity-details", params: { id: o.id } })} style={({ pressed }) => pressed && { opacity: 0.85 }} accessibilityRole="button">
            <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
              <Text style={styles.btnText}>View Opportunity</Text>
            </LinearGradient>
          </Pressable>
        ) : null}
        <Pressable onPress={() => router.replace("/my-opportunities")} style={({ pressed }) => [styles.btn, styles.outline, pressed && { opacity: 0.85 }]} accessibilityRole="button">
          <Text style={styles.outlineText}>Go to Opportunities</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 16 },
  close: { alignSelf: "flex-end" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  art: { width: 220, height: 150, alignItems: "center", justifyContent: "center" },
  ray: { position: "absolute", width: 5, height: 18, borderRadius: 3 },
  halo: { width: 116, height: 116, borderRadius: 58, backgroundColor: "#DDF4E7", alignItems: "center", justifyContent: "center" },
  badge: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, lineHeight: 30, textAlign: "center" },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, textAlign: "center", paddingHorizontal: 12 },
  card: { alignSelf: "stretch", marginTop: 8, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5", gap: 14 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 20 },
  flow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  flowCol: { gap: 6, alignItems: "flex-start" },
  flowLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  pill: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 },
  pillText: { fontFamily: Fonts.bold, fontSize: 12 },
  note: { alignSelf: "stretch", flexDirection: "row", gap: 10, padding: 14, borderRadius: Radius.md, backgroundColor: "#EEF3FF" },
  noteText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  actions: { gap: 10 },
  btn: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  btnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  outline: { borderWidth: 1.5, borderColor: Colors.navy, backgroundColor: Colors.white },
  outlineText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
});
