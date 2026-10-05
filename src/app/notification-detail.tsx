import { Avatar, GOLD_BG, Tag } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { markRead, removeNotification, useNotifications } from "@/lib/notification-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const soon = (what: string) => Alert.alert(what, "This will be available soon.");

export default function NotificationDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const n = useNotifications().find((x) => x.id === id);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/notifications"));

  if (!n) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.name}>Notification not found</Text>
        <Pressable onPress={back} hitSlop={8}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const p = n.person;

  const remove = () =>
    Alert.alert("Remove notification?", "This can’t be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          back();
          removeNotification(n.id);
        },
      },
    ]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={back} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={26} color={Colors.navy} />
        </Pressable>
        <Pressable
          hitSlop={10}
          accessibilityLabel="More actions"
          onPress={() =>
            Alert.alert(n.title, undefined, [
              { text: "Mark as Unread", onPress: () => { markRead(n.id, false); back(); } },
              { text: "Remove from Notifications", style: "destructive", onPress: remove },
              { text: "Cancel", style: "cancel" },
            ])
          }
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.navy} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {p?.photo ? (
            <View>
              <Avatar name={p.name} photo={p.photo} size={96} />
              {n.kind === "connections" ? (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.bigIcon}>
              <Ionicons name={n.icon} size={44} color={Colors.goldDark} />
            </View>
          )}
          <Text style={styles.headline}>
            {n.title} {n.body}
          </Text>
          <Text style={styles.time}>{n.time}</Text>
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.goldDark} />
          <Text style={styles.noteText}>{n.detail}</Text>
        </View>

        {p ? (
          <Pressable style={styles.card} onPress={() => router.push({ pathname: "/member-profile", params: { name: p.name } })}>
            <Avatar name={p.name} photo={p.photo} size={52} />
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {p.name}
                </Text>
                {p.verified ? <Ionicons name="checkmark-circle" size={16} color="#2F6FDE" /> : null}
              </View>
              <Text style={styles.role} numberOfLines={1}>
                {p.role} • {p.company}
              </Text>
              <View style={styles.meta}>
                <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
                <Text style={styles.metaText}>{p.location}</Text>
              </View>
              <View style={styles.tagRow}>
                {p.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </View>
            </View>
          </Pressable>
        ) : null}

        {p ? (
          <>
            <Pressable onPress={() => router.push({ pathname: "/member-profile", params: { name: p.name } })} accessibilityRole="button">
              <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
                <Text style={styles.primaryText}>View Profile</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => soon("Messages")} style={styles.secondary} accessibilityRole="button">
              <Ionicons name="paper-plane-outline" size={18} color={Colors.goldDark} />
              <Text style={styles.secondaryText}>Send Message</Text>
            </Pressable>
            {n.kind === "connections" ? (
              <Pressable onPress={() => router.navigate("/network")} hitSlop={8} style={styles.linkWrap}>
                <Text style={styles.link}>View All Connections</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <Pressable onPress={() => router.navigate("/network")} accessibilityRole="button">
            <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
              <Text style={styles.primaryText}>Explore Network</Text>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center", gap: 10 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  scroll: { paddingHorizontal: 16, gap: 16 },
  hero: { alignItems: "center", gap: 8, paddingTop: 8 },
  check: { position: "absolute", right: 0, bottom: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white, alignItems: "center", justifyContent: "center" },
  bigIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  headline: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, lineHeight: 27, textAlign: "center", marginTop: 6 },
  time: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FEF6E6" },
  noteText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  card: { flexDirection: "row", gap: 12, padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  cardInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, flexShrink: 1 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  primary: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  primaryText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  secondary: { height: 52, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.gold, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 14 },
  linkWrap: { alignSelf: "center" },
  link: { color: "#2F6FDE", fontFamily: Fonts.semiBold, fontSize: 13 },
});
