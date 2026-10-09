import { PersonAvatar } from "@/components/intro-ui";
import { GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts } from "@/constants/theme";
import { findMember } from "@/data/members";
import { timeAgo } from "@/data/questions";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function RoleBadge({ expert }: { expert: boolean }) {
  return expert ? (
    <View style={[styles.badge, { backgroundColor: GOLD_BG }]}>
      <Ionicons name="ribbon" size={10} color={Colors.goldDark} />
      <Text style={[styles.badgeText, { color: Colors.goldDark }]}>Expert</Text>
    </View>
  ) : (
    <View style={[styles.badge, { backgroundColor: "#EEF1F5" }]}>
      <Text style={[styles.badgeText, { color: Colors.textSecondary }]}>Member</Text>
    </View>
  );
}

export function roleLine(name: string) {
  const m = findMember(name);
  return m ? `${m.role}, ${m.company}` : "ABLN Member";
}

export function AuthorHead({ name, expert, hoursAgo, size = 44, right }: { name: string; expert: boolean; hoursAgo: number; size?: number; right?: ReactNode }) {
  return (
    <View style={styles.head}>
      <PersonAvatar name={name} size={size} />
      <View style={styles.flex}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <RoleBadge expert={expert} />
        </View>
        <Text style={styles.role} numberOfLines={1}>
          {roleLine(name)}
        </Text>
        <Text style={styles.time}>{timeAgo(hoursAgo)}</Text>
      </View>
      {right}
    </View>
  );
}

export function ActionPill({ icon, label, onPress, on }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void; on?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={styles.action} accessibilityRole="button" accessibilityState={{ selected: !!on }}>
      <Ionicons name={icon} size={18} color={on ? Colors.goldDark : Colors.navy} />
      <Text style={[styles.actionText, on && { color: Colors.goldDark, fontFamily: Fonts.bold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, flexShrink: 1 },
  role: { color: "#2F6FDE", fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },
  time: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontFamily: Fonts.semiBold, fontSize: 10 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
});
