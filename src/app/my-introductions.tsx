import { BackHeader, NetworkTabBar, PersonAvatar, StatusPill } from "@/components/intro-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { formatDate, useIntroRequests } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "sent" | "received";

export default function MyIntroductions() {
  const insets = useSafeAreaInsets();
  const all = useIntroRequests();
  const [tab, setTab] = useState<Tab>("sent");
  const sent = all.filter((r) => r.direction === "sent");
  const received = all.filter((r) => r.direction === "received");
  const items = tab === "sent" ? sent : received;

  const open = (id: string, t: Tab) => router.push({ pathname: t === "sent" ? "/introduction-details" : "/introduction-received", params: { id } });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <BackHeader title="My Introduction Requests" />
      </View>
      <View style={styles.tabs}>
        {([["sent", `Sent (${sent.length})`], ["received", `Received (${received.length})`]] as [Tab, string][]).map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={styles.tabWrap} accessibilityRole="tab" accessibilityState={{ selected: tab === key }}>
            {tab === key ? (
              <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tab}>
                <Text style={styles.tabOn}>{label}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.tab, styles.tabOff]}>
                <Text style={styles.tabOffText}>{label}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? <Text style={styles.empty}>No {tab} introduction requests yet.</Text> : null}
        {items.map((r) => {
          const other = tab === "sent" ? r.target : r.requester;
          const m = findMember(other);
          const via = tab === "sent" ? `Requested via ${r.introducer}` : `Wants an introduction to ${r.target}`;
          return (
            <Pressable key={r.id} onPress={() => open(r.id, tab)} style={styles.card} accessibilityRole="button" accessibilityLabel={`${other}, ${via}`}>
              <PersonAvatar name={other} size={52} />
              <View style={styles.info}>
                <View style={styles.top}>
                  <Text style={styles.name} numberOfLines={1}>
                    {other}
                  </Text>
                  <StatusPill status={r.status} />
                </View>
                <Text style={styles.sub} numberOfLines={1}>
                  {m?.company ?? "External contact"}
                </Text>
                <Text style={styles.via} numberOfLines={1}>
                  {via}
                </Text>
                <View style={styles.date}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.goldDark} />
                  <Text style={styles.dateText}>{formatDate(r.sentAt)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  tabs: { flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 6, padding: 4, borderRadius: Radius.md, backgroundColor: "#F1F4F8" },
  tabWrap: { flex: 1 },
  tab: { height: 40, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  tabOff: { backgroundColor: "transparent" },
  tabOn: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  tabOffText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 14 },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: "center", marginTop: 40, color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, shadowColor: Colors.navy, shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  info: { flex: 1, minWidth: 0 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  via: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, marginTop: 4 },
  date: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  dateText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
});
