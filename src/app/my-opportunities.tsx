import { EmptyState } from "@/components/empty-state";
import { CARD_SHADOW, ScreenHeader, Tag } from "@/components/member-ui";
import { GOLD_GRADIENT, Meta, OppThumb } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { MineStatus, MyOpportunity } from "@/data/opportunities";
import { BottomSheet, MenuRow } from "@/components/settings-ui";
import { removeMine, setMineStatus, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: MineStatus[] = ["Active", "Pending", "Paused", "Closed"];
const BADGE: Record<MineStatus, { bg: string; fg: string }> = {
  Active: { bg: "#DDF4E7", fg: Colors.success },
  Pending: { bg: "#FDEBC8", fg: Colors.goldDark },
  Paused: { bg: "#E9ECF3", fg: Colors.textSecondary },
  Closed: { bg: "#FBDADA", fg: Colors.error },
};

function MineCard({ o }: { o: MyOpportunity }) {
  const badge = BADGE[o.status];
  const [menu, setMenu] = useState(false);
  const run = (fn: () => void) => () => {
    setMenu(false);
    fn();
  };
  const manage = (action: "pause" | "close") => router.push({ pathname: "/manage-opportunity", params: { id: o.id, action } });
  const resume = () => {
    setMineStatus(o.id, "Active");
    router.push({ pathname: "/opportunity-status-updated", params: { id: o.id, action: "resume", from: "Paused" } });
  };
  const remove = () =>
    Alert.alert("Delete opportunity?", "This will permanently remove it and its interest requests.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeMine(o.id) },
    ]);

  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <View style={styles.cardTop}>
        <OppThumb category={o.category} size={88} uri={o.cover} />
        <View style={styles.flex}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {o.title}
            </Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.fg }]}>{o.status}</Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            <Tag>{o.category}</Tag>
            <Tag>{o.industry}</Tag>
          </View>
          <Meta icon="location">{o.location}</Meta>
          <Meta icon="cash">{o.valueLabel}</Meta>
          <Meta icon="calendar">{`Posted: ${o.postedLabel}`}</Meta>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.action, styles.flex]} onPress={() => router.push({ pathname: "/opportunity-details", params: { id: o.id } })} accessibilityRole="button">
          <Text style={styles.actionText}>View</Text>
        </Pressable>
        <Pressable style={[styles.action, styles.flex]} onPress={() => router.push({ pathname: "/create-opportunity", params: { id: o.id } })} accessibilityRole="button">
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.action, styles.flex]} onPress={() => setMenu(true)} accessibilityRole="button" accessibilityLabel="More actions">
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.navy} />
        </Pressable>
      </View>
      <BottomSheet visible={menu} title="Manage Opportunity" onClose={() => setMenu(false)}>
        <Text style={styles.sheetSub} numberOfLines={2}>
          {o.title}
        </Text>
        <MenuRow icon="eye-outline" title="View Details" sub="See how members see it" onPress={run(() => router.push({ pathname: "/opportunity-details", params: { id: o.id } }))} />
        <MenuRow icon="create-outline" title="Edit Opportunity" sub="Update details, timeline and contact" onPress={run(() => router.push({ pathname: "/create-opportunity", params: { id: o.id } }))} />
        {o.status === "Active" ? <MenuRow icon="pause-circle-outline" title="Pause Opportunity" sub="Temporarily hide it from members" onPress={run(() => manage("pause"))} /> : null}
        {o.status === "Paused" ? <MenuRow icon="play-circle-outline" title="Resume Opportunity" sub="Make it visible to members again" onPress={run(resume)} /> : null}
        {o.status === "Closed" ? null : <MenuRow icon="close-circle-outline" title="Close Opportunity" sub="Permanently stop receiving requests" onPress={run(() => manage("close"))} danger />}
        <MenuRow icon="trash-outline" title="Delete Opportunity" sub="Remove it permanently" onPress={run(remove)} danger />
      </BottomSheet>
    </View>
  );
}

export default function MyOpportunities() {
  const insets = useSafeAreaInsets();
  const { mine, incoming } = useOpportunities();
  const pending = incoming.filter((r) => !r.decision);
  const [tab, setTab] = useState<MineStatus>("Active");
  const list = mine.filter((m) => m.status === tab);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="My Opportunities"
          right={
            <Pressable
              onPress={() => router.push("/create-opportunity")}
              style={({ pressed }) => pressed && styles.pressed}
              accessibilityRole="button"
              accessibilityLabel="Create opportunity"
            >
              <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.add}>
                <Ionicons name="add" size={22} color={Colors.white} />
              </LinearGradient>
            </Pressable>
          }
        />

        <View style={styles.tabs}>
          {TABS.map((t) => {
            const on = t === tab;
            const count = mine.filter((m) => m.status === t).length;
            return (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{`${t} (${count})`}</Text>
              </Pressable>
            );
          })}
        </View>

        {pending.length ? (
          <Pressable style={({ pressed }) => [styles.requests, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/interest-request", params: { id: pending[0].id } })} accessibilityRole="button">
            <Ionicons name="people-outline" size={20} color={Colors.goldDark} />
            <Text style={styles.requestsText}>{`${pending.length} new interest ${pending.length === 1 ? "request" : "requests"}`}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.goldDark} />
          </Pressable>
        ) : null}

        {list.length ? (
          list.map((o) => <MineCard key={o.id} o={o} />)
        ) : (
          <EmptyState
            inline
            icon="briefcase-outline"
            title={`No ${tab} Opportunities`}
            text={tab === "Active" ? "Post an opportunity to find partners, investors and customers across ABLN." : `You have no ${tab.toLowerCase()} opportunities right now.`}
            cta={tab === "Active" ? { label: "Create Opportunity", onPress: () => router.push("/create-opportunity") } : undefined}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 14 },
  add: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  tabs: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, height: 38, borderRadius: 19, backgroundColor: "#F1F4FA", alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: Colors.gold },
  tabText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  tabTextOn: { color: Colors.white, fontFamily: Fonts.bold },

  requests: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.md, backgroundColor: "#FEF6E3" },
  requestsText: { flex: 1, color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  card: { padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white },
  cardTop: { flexDirection: "row", gap: 12 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  cardTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontFamily: Fonts.bold, fontSize: 10 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  action: { height: 38, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  actionText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  sheetSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: -4 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 40 },
});
