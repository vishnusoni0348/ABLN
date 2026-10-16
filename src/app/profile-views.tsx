import { EmptyState } from "@/components/empty-state";
import { Avatar, CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Gradients, Radius } from "@/constants/theme";
import { PROFILE_VIEW_TOTALS, PROFILE_VIEWS, type ProfileViewer } from "@/data/profile-views";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "all" | "members" | "nonMembers";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "members", label: "Members" },
  { key: "nonMembers", label: "Non-Members" },
];

function Banner({ total }: { total: number }) {
  return (
    <View style={styles.bannerWrap}>
      <LinearGradient colors={[Colors.deepNavy, Colors.navy, Colors.royalNavy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Ionicons name="eye" size={30} color={Colors.goldDark} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerCount}>{total}</Text>
          <Text style={styles.bannerLabel}>People viewed your profile</Text>
          <Text style={styles.bannerSub}>in the last 30 days</Text>
        </View>
        <LinearGradient colors={[...Gradients.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bannerLine} />
      </LinearGradient>
    </View>
  );
}

function Skeleton() {
  return (
    <View style={styles.list} accessibilityLabel="Loading profile views">
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.bone, { width: 56, height: 56, borderRadius: 28 }]} />
          <View style={styles.info}>
            <View style={[styles.bone, { width: "45%", height: 12 }]} />
            <View style={[styles.bone, { width: "70%", height: 10, marginTop: 8 }]} />
            <View style={[styles.bone, { width: "50%", height: 10, marginTop: 6 }]} />
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.border} />
        </View>
      ))}
    </View>
  );
}

function ViewerRow({ v }: { v: ProfileViewer }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => v.member && router.push({ pathname: "/member-profile", params: { name: v.name } })}
      accessibilityRole="button"
      accessibilityLabel={`${v.name}, ${v.member ? "member" : "non-member"}, viewed ${v.ago}`}
    >
      <Avatar name={v.name} size={56} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {v.name}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {v.role}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {v.company}
        </Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.ago}>{v.ago}</Text>
        <View style={[styles.pill, v.member ? styles.pillMember : styles.pillGuest]}>
          <Text style={[styles.pillText, { color: v.member ? "#2F6FDE" : Colors.goldDark }]}>{v.member ? "Member" : "Non-Member"}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function ProfileViewsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState<ProfileViewer[]>([]);
  const totals = viewers.length ? PROFILE_VIEW_TOTALS : { all: 0, members: 0, nonMembers: 0 };

  // Simulates the fetch so the skeleton state is exercised until the API exists.
  useEffect(() => {
    const t = setTimeout(() => {
      setViewers(PROFILE_VIEWS);
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const shown = viewers.filter((v) => tab === "all" || (tab === "members" ? v.member : !v.member));
  const empty = !loading && viewers.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="Who Viewed My Profile" />
      </View>
      <FlatList
        data={loading || empty ? [] : shown}
        keyExtractor={(v) => v.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <Banner total={totals.all} />
            <View style={styles.tabs}>
              {TABS.map((t) => {
                const on = t.key === tab;
                return (
                  <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                    <Text style={[styles.tabText, on && styles.tabTextOn]}>{`${t.label} (${loading ? PROFILE_VIEW_TOTALS[t.key] : totals[t.key]})`}</Text>
                  </Pressable>
                );
              })}
            </View>
            {loading ? <Skeleton /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.list}>
            <ViewerRow v={item} />
          </View>
        )}
        ListEmptyComponent={
          empty ? (
            <EmptyState
              icon="eye-outline"
              title="No Profile Views Yet"
              text="When someone views your profile, they will appear here."
              cta={{ label: "Keep Building Your Network", onPress: () => router.push("/network") }}
            />
          ) : loading ? null : (
            <EmptyState inline icon="people-outline" title="No Views Here" text="No one in this group has viewed your profile recently." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  bannerWrap: { paddingHorizontal: 16, marginTop: 8 },
  banner: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20, borderRadius: Radius.lg, overflow: "hidden" },
  bannerIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: "#FEF6E6", alignItems: "center", justifyContent: "center" },
  bannerText: { flex: 1 },
  bannerLine: { position: "absolute", left: 0, right: 0, bottom: 0, height: 4 },
  bannerCount: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 34, lineHeight: 40 },
  bannerLabel: { color: Colors.white, fontFamily: Fonts.semiBold, fontSize: 14 },
  bannerSub: { color: Colors.goldLight, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tab: { paddingHorizontal: 14, height: 38, borderRadius: 19, backgroundColor: "#F1F4FA", alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: "#FDF0D2", borderWidth: 1, borderColor: Colors.goldLight },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12 },
  tabTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  list: { paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5", marginBottom: 10, ...CARD_SHADOW },
  info: { flex: 1, minWidth: 0 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginBottom: 2 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },
  side: { alignItems: "flex-end", gap: 10 },
  ago: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pillMember: { backgroundColor: "#EAF1FD" },
  pillGuest: { backgroundColor: "#FDF0D2" },
  pillText: { fontFamily: Fonts.semiBold, fontSize: 11 },
  bone: { backgroundColor: "#ECEFF4", borderRadius: 6 },
});
