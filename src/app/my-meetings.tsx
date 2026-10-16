import { EmptyState } from "@/components/empty-state";
import { Avatar, CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { cancelMeeting, formatLong, isUpcoming, formatRange, MEETING_TYPES, useMeetings, type Meeting } from "@/lib/meeting-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "upcoming" | "past";

function MeetingRow({ m }: { m: Meeting }) {
  const type = MEETING_TYPES.find((t) => t.key === m.type)!;
  const member = findMember(m.name);
  const upcoming = isUpcoming(m);

  const cancel = () =>
    Alert.alert("Cancel meeting?", `Your meeting with ${m.name} will be removed.`, [
      { text: "Keep", style: "cancel" },
      { text: "Cancel meeting", style: "destructive", onPress: () => cancelMeeting(m.id) },
    ]);

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: "/meeting-scheduled", params: { id: m.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Meeting with ${m.name}, ${formatLong(m.start)}`}
    >
      <View style={styles.top}>
        <Avatar name={m.name} photo={member?.photo} size={48} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{m.name}</Text>
          {m.topic ? <Text style={styles.sub} numberOfLines={1}>{m.topic}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      </View>
      <View style={styles.meta}>
        <Ionicons name="calendar-outline" size={15} color="#2F6FDE" />
        <Text style={styles.metaText}>{formatLong(m.start)}</Text>
      </View>
      <View style={styles.meta}>
        <Ionicons name="time-outline" size={15} color="#2F6FDE" />
        <Text style={styles.metaText}>{formatRange(m.start, m.minutes)}</Text>
      </View>
      <View style={styles.meta}>
        <Ionicons name={type.icon} size={15} color="#2F6FDE" />
        <Text style={styles.metaText}>{type.label}</Text>
      </View>
      {upcoming ? (
        <Pressable onPress={cancel} hitSlop={8} style={styles.cancel} accessibilityRole="button" accessibilityLabel={`Cancel meeting with ${m.name}`}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export default function MyMeetingsScreen() {
  const insets = useSafeAreaInsets();
  const meetings = useMeetings();
  const [tab, setTab] = useState<Tab>("upcoming");

  const upcoming = meetings.filter(isUpcoming).sort((a, b) => a.start.getTime() - b.start.getTime());
  const past = meetings.filter((m) => !isUpcoming(m)).sort((a, b) => b.start.getTime() - a.start.getTime());
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="My Meetings" />
      </View>
      <View style={styles.tabs}>
        {([["upcoming", `Upcoming (${upcoming.length})`], ["past", `Past (${past.length})`]] as const).map(([key, label]) => {
          const on = key === tab;
          return (
            <Pressable key={key} onPress={() => setTab(key)} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={shown}
        keyExtractor={(m) => m.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <MeetingRow m={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={tab === "upcoming" ? "No upcoming meetings" : "No past meetings"}
            text={tab === "upcoming" ? "Schedule a meeting from a connection's profile and it will show up here." : "Meetings you have completed will appear here."}
            cta={tab === "upcoming" ? { label: "My Connections", onPress: () => router.push("/my-connections") } : undefined}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginVertical: 12 },
  tab: { paddingHorizontal: 16, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 12 },
  tabTextOn: { color: Colors.white },
  card: { padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white, ...CARD_SHADOW },
  top: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  info: { flex: 1, minWidth: 0 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  metaText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  cancel: { alignSelf: "flex-end", marginTop: 8 },
  cancelText: { color: "#D64545", fontFamily: Fonts.semiBold, fontSize: 12 },
});
