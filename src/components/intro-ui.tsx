import { Avatar, GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { STATUS_LABEL, type IntroStatus } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const STATUS_TONE: Record<IntroStatus, { bg: string; fg: string }> = {
  review: { bg: GOLD_BG, fg: Colors.goldDark },
  accepted: { bg: "#DDF3E8", fg: Colors.success },
  declined: { bg: "#FBE3E3", fg: Colors.error },
  cancelled: { bg: "#EEF1F5", fg: Colors.textSecondary },
  withdrawn: { bg: "#EEF1F5", fg: Colors.textSecondary },
};

export function GoldButton({ label, onPress, disabled, style, icon }: { label: string; onPress: () => void; disabled?: boolean; style?: object; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [style, pressed && { opacity: 0.85 }, disabled && { opacity: 0.5 }]} accessibilityRole="button">
      <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {icon ? <Ionicons name={icon} size={18} color={Colors.white} /> : null}
        <Text style={styles.goldText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, style, icon }: { label: string; onPress: () => void; style?: object; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, styles.outline, style, pressed && { opacity: 0.85 }]} accessibilityRole="button">
      {icon ? <Ionicons name={icon} size={18} color={Colors.goldDark} /> : null}
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

export function StatusPill({ status }: { status: IntroStatus }) {
  const tone = STATUS_TONE[status];
  const label = STATUS_LABEL[status];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.pillText, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

export function Tip({ children }: { children: string }) {
  return (
    <View style={styles.tip}>
      <View style={styles.tipIcon}>
        <Ionicons name="bulb-outline" size={18} color={Colors.gold} />
      </View>
      <Text style={styles.tipText}>{children}</Text>
    </View>
  );
}

export function PersonAvatar({ name, size }: { name: string; size: number }) {
  return <Avatar name={name} photo={findMember(name)?.photo} size={size} />;
}

export function BackHeader({ title, fallback = "/network" }: { title: string; fallback?: "/network" | "/my-introductions" }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={24} color={Colors.navy} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.back} />
    </View>
  );
}

const NAV: { icon: IconName; iconOn: IconName; label: string; on?: boolean; to?: "/home" | "/network" }[] = [
  { icon: "home-outline", iconOn: "home", label: "Home", to: "/home" },
  { icon: "people-outline", iconOn: "people", label: "Network", on: true, to: "/network" },
  { icon: "briefcase-outline", iconOn: "briefcase", label: "Opportunities" },
  { icon: "calendar-outline", iconOn: "calendar", label: "Events" },
  { icon: "chatbox-ellipses-outline", iconOn: "chatbox-ellipses", label: "Messages" },
  { icon: "grid-outline", iconOn: "grid", label: "More" },
];

// Stack screens sit above the tabs, so they carry their own copy of the bar with Network active.
export function NetworkTabBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {NAV.map((t) => (
        <Pressable key={t.label} onPress={() => t.to && router.navigate(t.to)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: !!t.on }}>
          <Ionicons name={t.on ? t.iconOn : t.icon} size={24} color={t.on ? Colors.goldDark : Colors.textSecondary} />
          <Text style={[styles.tabLabel, t.on && styles.tabLabelOn]} numberOfLines={1}>
            {t.label}
          </Text>
          <View style={[styles.tabUnderline, t.on && styles.tabUnderlineOn]} />
        </Pressable>
      ))}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  goldText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  outline: { borderWidth: 1.5, borderColor: Colors.gold, backgroundColor: Colors.white },
  outlineText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 15 },

  pill: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { fontFamily: Fonts.semiBold, fontSize: 11 },

  tip: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#EEF3FA", borderRadius: Radius.md, padding: 12 },
  tipIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },

  header: { flexDirection: "row", alignItems: "center", height: 48 },
  back: { width: 36, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },

  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, shadowColor: Colors.navy, shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },

  tabBar: { flexDirection: "row", paddingTop: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  tab: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, alignItems: "center", gap: 3 },
  tabLabel: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 10, textAlign: "center", alignSelf: "stretch" },
  tabLabelOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  tabUnderline: { width: 32, height: 3, borderRadius: 2, backgroundColor: "transparent", marginTop: 2 },
  tabUnderlineOn: { backgroundColor: Colors.goldDark },
});
