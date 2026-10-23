import { Avatar, CARD_SHADOW } from "@/components/member-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { canResend, Invite, inviteCounts, InviteStatus, removeInvite, resendInvite, useInvites } from "@/lib/referral-store";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Filter = "All" | "Sent" | "Joined" | "Pending";

const FILTERS: Filter[] = ["All", "Sent", "Joined", "Pending"];

const TONE: Record<InviteStatus, { icon: IconName; color: string; bg: string }> = {
  Joined: { icon: "checkmark-circle", color: Colors.success, bg: "#E6F6EF" },
  Pending: { icon: "time", color: Colors.goldDark, bg: "#FBF1D6" },
  Sent: { icon: "paper-plane", color: "#2F6FED", bg: "#EAF1FD" },
  Expired: { icon: "close-circle", color: Colors.error, bg: "#FCE9E9" },
};

// "Sent" lists everything that went out; "Pending" also covers invites not yet opened.
const matches = (i: Invite, f: Filter) => f === "All" || f === "Sent" || (f === "Joined" ? i.status === "Joined" : i.status === "Pending" || i.status === "Sent");

export default function InvitationStatus() {
  const invites = useInvites();
  const [filter, setFilter] = useState<Filter>("All");
  const counts = useMemo(() => inviteCounts(invites), [invites]);
  const shown = invites.filter((i) => matches(i, filter));
  const filterCount = (f: Filter) => invites.filter((i) => matches(i, f)).length;

  const resend = (i: Invite) => {
    resendInvite(i.id);
    Alert.alert("Invite resent", `A fresh invitation has been sent to ${i.name}.`);
  };

  const menu = (i: Invite) =>
    Alert.alert(i.name, i.role, [
      ...(canResend(i.status) ? [{ text: "Resend Invite", onPress: () => resend(i) }] : []),
      { text: "Remove Invitation", style: "destructive" as const, onPress: () => removeInvite(i.id) },
      { text: "Cancel", style: "cancel" as const },
    ]);

  return (
    <SettingsScreen title="Invitation Status">
      <View>
        <Text style={styles.title}>Invitation Status</Text>
        <Text style={styles.sub}>Track your invited members and their status.</Text>
      </View>

      <View style={styles.stats}>
        <Stat icon="paper-plane" color="#2F6FED" bg="#EAF1FD" value={counts.sent} label="Sent" />
        <Stat icon="people" color={Colors.success} bg="#E6F6EF" value={counts.joined} label="Joined" />
        <Stat icon="time" color={Colors.goldDark} bg="#FBF1D6" value={counts.pending} label="Pending" />
        <Stat icon="close-circle" color={Colors.error} bg="#FCE9E9" value={counts.expired} label="Expired" />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[styles.pill, on && styles.pillOn]}>
              <Text style={[styles.pillText, on && styles.pillTextOn]} numberOfLines={1}>
                {f} ({filterCount(f)})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {shown.length === 0 ? (
        <Text style={styles.empty}>No invitations here yet.</Text>
      ) : (
        <View style={styles.list}>
          {shown.map((i, idx) => (
            <InviteRow key={i.id} invite={i} last={idx === shown.length - 1} onResend={() => resend(i)} onMenu={() => menu(i)} />
          ))}
        </View>
      )}
    </SettingsScreen>
  );
}

function Stat({ icon, color, bg, value, label }: { icon: IconName; color: string; bg: string; value: number; label: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: bg }]} accessible accessibilityLabel={`${value} ${label}`}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InviteRow({ invite: i, last, onResend, onMenu }: { invite: Invite; last: boolean; onResend: () => void; onMenu: () => void }) {
  const tone = TONE[i.status];
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Avatar name={i.name} size={52} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>
            {i.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: tone.bg }]}>
            <Ionicons name={tone.icon} size={13} color={tone.color} />
            <Text style={[styles.badgeText, { color: tone.color }]}>{i.status}</Text>
          </View>
          <Pressable onPress={onMenu} hitSlop={10} accessibilityRole="button" accessibilityLabel={`More actions for ${i.name}`}>
            <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>
        <Text style={styles.role} numberOfLines={1}>
          {i.role}
        </Text>
        <View style={styles.rowBottom}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.date}>{i.date}</Text>
          {canResend(i.status) ? (
            <Pressable onPress={onResend} accessibilityRole="button" accessibilityLabel={`Resend invite to ${i.name}`} style={styles.resend}>
              <Ionicons name="paper-plane-outline" size={13} color="#2F6FED" />
              <Text style={styles.resendText}>Resend Invite</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 4 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 12, borderRadius: Radius.md },
  statValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  statLabel: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: "#EEF2FA", alignItems: "center", justifyContent: "center" },
  pillOn: { backgroundColor: Colors.gold },
  pillText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 13 },
  pillTextOn: { color: Colors.white },
  list: { backgroundColor: Colors.white, borderRadius: Radius.lg, paddingHorizontal: 14, ...CARD_SHADOW },
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, paddingVertical: 32 },
  row: { flexDirection: "row", gap: 12, paddingVertical: 14, alignItems: "flex-start" },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  rowBody: { flex: 1, minWidth: 0, gap: 3 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: Fonts.bold, fontSize: 12 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  rowBottom: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  date: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  resend: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#2F6FED", backgroundColor: "#F4F8FF" },
  resendText: { color: "#2F6FED", fontFamily: Fonts.semiBold, fontSize: 12 },
});
