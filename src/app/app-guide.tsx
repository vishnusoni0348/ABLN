import { CARD_SHADOW } from "@/components/member-ui";
import { GoldButton, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { GUIDE_SECTIONS, useGuideProgress } from "@/lib/guide-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const STEP_FOR = { network: 0, opportunities: 1, ask: 2, privileges: 2 } as const;

export default function AppGuide() {
  const { done, count, total, percent } = useGuideProgress();

  return (
    <SettingsScreen title="App Guide" footer={<GoldButton label="Start Tour  →" onPress={() => router.push("/app-tour")} />}>
      <LinearGradient colors={["#FFFFFF", "#FEF6E6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>
            Learn <Text style={{ color: Colors.goldDark }}>ABLN</Text>
          </Text>
          <Text style={styles.heroSub}>Your guide to making the most of your network.</Text>
        </View>
        <View style={styles.bulb}>
          <Ionicons name="bulb" size={44} color={Colors.gold} />
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        {GUIDE_SECTIONS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => router.push({ pathname: "/app-tour", params: { step: STEP_FOR[s.key] } })}
            accessibilityRole="button"
            accessibilityLabel={`${s.title}. ${s.sub}${done.includes(s.key) ? ". Completed" : ""}`}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.tileIcon}>
              <Ionicons name={s.icon} size={22} color={Colors.navy} />
            </View>
            <View style={styles.tileRow}>
              <Text style={styles.tileTitle}>{s.title}</Text>
              {done.includes(s.key) ? (
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              ) : (
                <Ionicons name="chevron-forward" size={16} color={Colors.navy} />
              )}
            </View>
            <Text style={styles.tileSub}>{s.sub}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.progress}>
        <View style={styles.progressIcon}>
          <Ionicons name="document-text" size={22} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>App Guide Progress</Text>
            <Text style={styles.progressPct}>{percent}%</Text>
          </View>
          <Text style={styles.progressSub}>
            {count} of {total} sections completed
          </Text>
          <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>
        </View>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", borderRadius: Radius.lg, padding: 18, minHeight: 130, ...CARD_SHADOW },
  heroText: { flex: 1, gap: 6 },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 28 },
  heroSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  bulb: { width: 84, height: 84, borderRadius: 42, backgroundColor: "#FBF1D6", alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47.5%", flexGrow: 1, gap: 6, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  tileIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F2F5FA", alignItems: "center", justifyContent: "center" },
  tileRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 4 },
  tileTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  tileSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  progress: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: "#EAF1FD" },
  progressIcon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: "#2F6FED", alignItems: "center", justifyContent: "center" },
  progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  progressPct: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  progressSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: "#D3DEF3", marginTop: 8, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: Colors.gold },
});
