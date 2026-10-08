import { CARD_SHADOW, GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { Expert } from "@/data/experts";
import type { Member } from "@/data/members";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Alert, Modal, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function GoldBtn({ label, onPress, icon, disabled }: { label: string; onPress: () => void; icon?: IconName; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [(pressed || disabled) && { opacity: 0.8 }]} accessibilityRole="button">
      <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {icon ? <Ionicons name={icon} size={18} color={Colors.white} /> : null}
        <Text style={styles.goldText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineBtn({ label, onPress, icon, style }: { label: string; onPress: () => void; icon?: IconName; style?: object }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, styles.outline, style, pressed && { opacity: 0.85 }]} accessibilityRole="button">
      {icon ? <Ionicons name={icon} size={18} color={Colors.goldDark} /> : null}
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

export function TopBar({ member }: { member?: Member }) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const close = () => setOpen(false);
  const go = (fn: () => void) => () => {
    close();
    fn();
  };

  const items: { icon: IconName; title: string; sub: string; onPress: () => void; danger?: boolean }[] = member
    ? [
        { icon: "paper-plane-outline", title: "Share Profile", sub: "Share via WhatsApp, Email or Copy Link", onPress: go(() => Share.share({ message: `${member.name} - ${member.role}, ${member.company} on ABLN` }).catch(() => {})) },
        { icon: "person-outline", title: "View Member Profile", sub: "See their network profile", onPress: go(() => router.push({ pathname: "/member-profile", params: { name: member.name } })) },
        { icon: "bulb-outline", title: "My Advice Requests", sub: "Track your advice requests", onPress: go(() => router.push("/my-advice")) },
        {
          icon: "ban-outline",
          title: "Report / Block",
          sub: "Report this profile or block this member",
          danger: true,
          onPress: go(() =>
            Alert.alert("Report / Block", `What would you like to do with ${member.name}?`, [
              { text: "Report", onPress: () => Alert.alert("Thanks", "Your report has been submitted.") },
              { text: "Block", style: "destructive" },
              { text: "Cancel", style: "cancel" },
            ]),
          ),
        },
      ]
    : [];

  return (
    <View style={styles.topBar}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.round} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={22} color={Colors.navy} />
      </Pressable>
      {member ? (
        <Pressable onPress={() => setOpen(true)} hitSlop={12} style={styles.round} accessibilityRole="button" accessibilityLabel="More options">
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.navy} />
        </Pressable>
      ) : null}
      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          {items.map((a) => (
            <Pressable key={a.title} style={styles.actionRow} onPress={a.onPress} accessibilityRole="button">
              <View style={[styles.actionIcon, a.danger && { backgroundColor: "#FCEBEB" }]}>
                <Ionicons name={a.icon} size={18} color={a.danger ? Colors.error : "#2F6FDE"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, a.danger && { color: Colors.error }]}>{a.title}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={close} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

export function AvailablePill({ available }: { available: boolean }) {
  return (
    <View style={[styles.pill, !available && styles.pillOff]}>
      <Ionicons name={available ? "checkmark" : "time-outline"} size={12} color={available ? Colors.success : Colors.textSecondary} />
      <Text style={[styles.pillText, !available && { color: Colors.textSecondary }]}>{available ? "Available" : "Busy"}</Text>
    </View>
  );
}

export function StatsRow({ expert: e }: { expert: Expert }) {
  const stats: { icon: IconName; value: string; label: string }[] = [
    { icon: "thumbs-up-outline", value: `${e.yearsExp}+`, label: "Years Exp." },
    { icon: "chatbubble-ellipses-outline", value: `${e.answers}+`, label: "Answers" },
    { icon: "star-outline", value: e.rating ? e.rating.toFixed(1) : "-", label: "Rating" },
  ];
  return (
    <View style={styles.stats}>
      {stats.map((s, i) => (
        <View key={s.label} style={[styles.stat, i > 0 && styles.statDivider]}>
          <View style={styles.statTop}>
            <Ionicons name={s.icon} size={20} color={Colors.gold} />
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function Chip({ children }: { children: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 14 },
  goldText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  outline: { borderWidth: 1, borderColor: Colors.gold, backgroundColor: Colors.white },
  outlineText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 14 },

  topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  round: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.9)" },

  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 8 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  actionIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAF1FC", alignItems: "center", justifyContent: "center" },
  actionTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  actionSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  cancel: { height: 46, marginTop: 14, borderRadius: Radius.md, backgroundColor: Colors.softWhite, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },

  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "#E4F6EC" },
  pillOff: { backgroundColor: "#EEF1F5" },
  pillText: { color: Colors.success, fontFamily: Fonts.semiBold, fontSize: 11 },

  stats: { flexDirection: "row", borderRadius: Radius.md, backgroundColor: Colors.white, paddingVertical: 12, ...CARD_SHADOW },
  stat: { flex: 1, alignItems: "center" },
  statDivider: { borderLeftWidth: 1, borderLeftColor: "#EEF1F5" },
  statTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  statValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  statLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },

  chip: { backgroundColor: GOLD_BG, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
});
