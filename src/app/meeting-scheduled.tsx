import { Avatar } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { findMeeting, formatLong, formatRange, MEETING_TYPES } from "@/lib/meeting-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const BLUE = "#2F6FDE";
const CONFETTI = [
  { top: 8, left: 34, color: "#F5A623", size: 7 },
  { top: 0, right: 40, color: "#F5A623", size: 6 },
  { top: 34, right: 12, color: "#2F6FDE", size: 7 },
  { top: 78, left: 14, color: "#E94E9B", size: 6 },
  { bottom: 6, left: 40, color: "#22A06B", size: 7 },
  { bottom: 0, right: 30, color: "#22A06B", size: 6 },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const calStamp = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

export default function MeetingScheduled() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meeting = findMeeting(id);
  const member = findMember(meeting?.name);

  if (!meeting) {
    return (
      <View style={[styles.container, styles.missing, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Meeting not found</Text>
        <Pressable onPress={() => router.back()} style={styles.outline} accessibilityRole="button">
          <Text style={styles.outlineText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const type = MEETING_TYPES.find((t) => t.key === meeting.type)!;
  const end = new Date(meeting.start.getTime() + meeting.minutes * 60000);
  const rows: { icon: IconName; label: string; value: string }[] = [
    { icon: "calendar-outline", label: "Date", value: formatLong(meeting.start) },
    { icon: "time-outline", label: "Time", value: formatRange(meeting.start, meeting.minutes) },
    { icon: type.icon, label: "Meeting Type", value: type.label },
    ...(meeting.topic ? [{ icon: "document-text-outline" as IconName, label: "Topic", value: meeting.topic }] : []),
    ...(meeting.note ? [{ icon: "reader-outline" as IconName, label: "Note", value: meeting.note }] : []),
  ];

  const addToCalendar = () => {
    const title = encodeURIComponent(`Meeting with ${meeting.name}`);
    const details = encodeURIComponent([meeting.topic, meeting.note].filter(Boolean).join("\n"));
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${calStamp(meeting.start)}/${calStamp(end)}&details=${details}`;
    Linking.openURL(url).catch(() => Alert.alert("Couldn't open calendar", "Please try again."));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {CONFETTI.map((c, i) => (
            <View key={i} style={[styles.dot, { width: c.size, height: c.size, borderRadius: c.size / 2, backgroundColor: c.color }, c]} />
          ))}
          <View style={styles.halo}>
            <Ionicons name="calendar" size={54} color={BLUE} />
            <View style={styles.tick}>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
            </View>
          </View>
        </View>
        <Text style={styles.title}>Meeting Scheduled{"\n"}Successfully!</Text>
        <Text style={styles.lead}>Your meeting with {meeting.name} has been scheduled.</Text>

        <View style={styles.card}>
          <View style={styles.who}>
            <Avatar name={meeting.name} photo={member?.photo} size={52} />
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{meeting.name}</Text>
                {member?.verified ? <Ionicons name="checkmark-circle" size={15} color={BLUE} /> : null}
              </View>
              {member ? <Text style={styles.sub} numberOfLines={1}>{member.role}</Text> : null}
              {member ? <Text style={styles.sub} numberOfLines={1}>{member.company}</Text> : null}
            </View>
          </View>
          {rows.map((r) => (
            <View key={r.label} style={styles.row}>
              <Ionicons name={r.icon} size={20} color={BLUE} />
              <View style={styles.flex}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable onPress={addToCalendar} style={({ pressed }) => [{ marginTop: 18 }, pressed && styles.pressed]} accessibilityRole="button">
          <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>Add to Calendar</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={() => router.replace({ pathname: "/member-profile", params: { name: meeting.name } })}
          style={({ pressed }) => [styles.cta, styles.outlineBtn, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.outlineBtnText}>View Profile</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.85 },
  container: { flex: 1, backgroundColor: Colors.white },
  missing: { alignItems: "center", justifyContent: "center", gap: 16 },
  scroll: { paddingHorizontal: 16 },
  hero: { alignSelf: "center", width: 190, height: 160, alignItems: "center", justifyContent: "center", marginTop: 24 },
  dot: { position: "absolute" },
  halo: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#EAF1FC", alignItems: "center", justifyContent: "center" },
  tick: { position: "absolute", right: 22, bottom: 24, width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.white },
  title: { textAlign: "center", color: "#1F2A8A", fontFamily: Fonts.bold, fontSize: 22, lineHeight: 29, marginTop: 8 },
  lead: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 8 },
  card: { marginTop: 22, padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white },
  who: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, flexShrink: 1 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 14 },
  rowLabel: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  rowValue: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 1 },
  cta: { height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  outlineBtn: { marginTop: 10, borderWidth: 1.5, borderColor: "#1F2A8A", backgroundColor: Colors.white },
  outlineBtnText: { color: "#1F2A8A", fontFamily: Fonts.bold, fontSize: 15 },
  outline: { height: 44, paddingHorizontal: 24, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  outlineText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
});
