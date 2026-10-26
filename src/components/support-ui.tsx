import { Colors, Fonts } from "@/constants/theme";
import type { TicketStatus } from "@/lib/support-store";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const STATUS_TONE: Record<TicketStatus, { bg: string; fg: string; icon: IconName }> = {
  Open: { bg: "#FDECEC", fg: Colors.error, icon: "time-outline" },
  "In Progress": { bg: "#FDF1D8", fg: "#E08A0B", icon: "time-outline" },
  Resolved: { bg: "#DFF4EA", fg: Colors.success, icon: "checkmark-circle" },
};

const CATEGORY_ICONS: Record<string, { icon: IconName; color: string; bg: string }> = {
  "Account & Profile": { icon: "person-outline", color: "#2F6FED", bg: "#E8F0FE" },
  "Events & Registration": { icon: "calendar-outline", color: Colors.error, bg: "#FDECEC" },
  "Digital Business Card": { icon: "card-outline", color: Colors.success, bg: "#DFF4EA" },
};
const DEFAULT_CATEGORY = { icon: "help-buoy-outline" as IconName, color: Colors.goldDark, bg: "#FDF1D8" };

export const categoryStyle = (category: string) => CATEGORY_ICONS[category] ?? DEFAULT_CATEGORY;

export function StatusPill({ status }: { status: TicketStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Ionicons name={tone.icon} size={13} color={tone.fg} />
      <Text style={[styles.pillText, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

export function CategoryBadge({ category, size = 44 }: { category: string; size?: number }) {
  const c = categoryStyle(category);
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={size / 2} color={c.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontFamily: Fonts.semiBold, fontSize: 11 },
  badge: { alignItems: "center", justifyContent: "center" },
});
