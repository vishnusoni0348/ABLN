import { SOFT_GOLD } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${(step / total) * 100}%` }]} />
    </View>
  );
}

/** Selectable pill used for expertise areas, weekdays and session lengths. */
export function ToggleChip({ label, on, onPress, flex }: { label: string; on: boolean; onPress: () => void; flex?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={[styles.chip, on && styles.chipOn, flex && { flex: 1 }]}
    >
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
      {on ? <Ionicons name="checkmark-circle" size={16} color={Colors.goldDark} /> : null}
    </Pressable>
  );
}

/** Tall option tile with an icon, used for the preferred session mode. */
export function ModeCard({ icon, label, on, onPress }: { icon: IconName; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.mode, on && styles.chipOn]}>
      {on ? <Ionicons name="checkmark-circle" size={18} color={Colors.goldDark} style={styles.modeTick} /> : null}
      <Ionicons name={icon} size={26} color={on ? Colors.goldDark : Colors.textSecondary} />
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function CheckRow({ label, sub, on, onPress }: { label: string; sub: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={styles.checkRow}>
      <Ionicons name={on ? "checkbox" : "square-outline"} size={24} color={on ? Colors.goldDark : Colors.textMuted} />
      <Text style={styles.checkLabel}>{label}</Text>
      <Text style={styles.checkSub}>({sub})</Text>
    </Pressable>
  );
}

export function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

export function SubHeading({ children }: { children: string }) {
  return <Text style={styles.subHead}>{children}</Text>;
}

/** Centered result screen frame (submitted / under review / approved). */
export function ResultBody({ illustration, title, message, children }: { illustration: ReactNode; title: string; message: string; children?: ReactNode }) {
  return (
    <View style={styles.result}>
      {illustration}
      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={styles.resultMsg}>{message}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: "#E8ECF2", marginBottom: 6 },
  fill: { height: 4, borderRadius: 2, backgroundColor: Colors.gold },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipOn: { backgroundColor: SOFT_GOLD, borderColor: Colors.gold },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 14 },
  chipTextOn: { fontFamily: Fonts.bold },
  mode: {
    flex: 1,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modeTick: { position: "absolute", top: 6, right: 6 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  checkLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  checkSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, marginTop: 4 },
  subHead: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 10 },
  result: { alignItems: "center", paddingHorizontal: 8 },
  resultTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 34, textAlign: "center", marginTop: 8 },
  resultMsg: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 10 },
});
