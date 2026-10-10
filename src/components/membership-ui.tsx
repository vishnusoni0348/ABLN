import { CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CURRENT_MEMBER } from "@/data/membership";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const NAVY_CARD = [Colors.deepNavy, Colors.navy, Colors.royalNavy] as const;

export function Crown({ size = 32, color = Colors.gold }: { size?: number; color?: string }) {
  return <MaterialCommunityIcons name="crown" size={size} color={color} />;
}

// Dark membership card. `status` swaps the "ABLN Member" caption + badge for the plan name + Active chip.
export function MemberCard({ status, onPress }: { status?: boolean; onPress?: () => void }) {
  const m = CURRENT_MEMBER;
  const body = (
    <LinearGradient colors={NAVY_CARD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.top}>
        <Crown size={34} />
        <View style={styles.flex}>
          <Text style={status ? styles.planName : styles.caption}>{status ? m.planName : "ABLN Member"}</Text>
          {status ? null : (
            <View style={styles.pill}>
              <MaterialCommunityIcons name="crown" size={11} color={Colors.navy} />
              <Text style={styles.pillText}>Premium</Text>
            </View>
          )}
        </View>
        {status ? (
          <View style={styles.active}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.bottom}>
        <View>
          <Text style={styles.name}>{m.name}</Text>
          <Text style={styles.id}>{m.id}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.valid}>Valid Till</Text>
          <Text style={styles.validDate}>{m.validTill}</Text>
        </View>
      </View>
    </LinearGradient>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed} accessibilityRole="button" accessibilityLabel="View membership status">
      {body}
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Surface({ children }: { children: ReactNode }) {
  return <View style={[styles.surface, CARD_SHADOW]}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },
  card: { borderRadius: Radius.lg, padding: 18, gap: 22 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  caption: { color: Colors.goldLight, fontFamily: Fonts.semiBold, fontSize: 16 },
  planName: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 18 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: Colors.champagne },
  pillText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 11 },
  active: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.success },
  activeText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 12 },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  name: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 17 },
  id: { color: "rgba(255,255,255,0.75)", fontFamily: Fonts.regular, fontSize: 14, marginTop: 4 },
  right: { alignItems: "flex-end" },
  valid: { color: "rgba(255,255,255,0.75)", fontFamily: Fonts.regular, fontSize: 13 },
  validDate: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 17, marginTop: 4 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  sectionAction: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  surface: { borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white },
});
