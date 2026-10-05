import { Avatar, GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { AppNotification, KIND_LABEL, markAllRead, markRead, NotificationKind, removeNotification, useNotifications } from "@/lib/notification-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Filter = "all" | "unread" | NotificationKind;

const FILTERS: Filter[] = ["all", "unread", "connections", "introductions", "opportunities", "events", "membership"];

const soon = (what: string) => Alert.alert(what, "This will be available soon.");

function Row({ n, onPress, onMore }: { n: AppNotification; onPress: () => void; onMore: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onMore}
      style={({ pressed }) => [styles.row, !n.read && styles.rowUnread, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {n.person?.photo ? (
        <Avatar name={n.person.name} photo={n.person.photo} size={48} />
      ) : (
        <View style={styles.iconBox}>
          <Ionicons name={n.icon} size={22} color={Colors.goldDark} />
        </View>
      )}
      <View style={styles.rowInfo}>
        <Text style={styles.rowText}>
          <Text style={styles.rowTitle}>{n.title}</Text> {n.body}
        </Text>
        <Text style={styles.time}>{n.time}</Text>
      </View>
      {n.read ? (
        <Pressable hitSlop={10} onPress={onMore} accessibilityLabel="More actions">
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
        </Pressable>
      ) : (
        <View style={styles.dot} />
      )}
    </Pressable>
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const items = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<AppNotification | null>(null);

  const unread = items.filter((n) => !n.read).length;
  const label = (f: Filter) => (f === "all" ? "All" : f === "unread" ? `Unread${unread ? ` (${unread})` : ""}` : KIND_LABEL[f]);

  const shown = items.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.kind === filter));
  const groups = (["Today", "Yesterday"] as const).map((g) => ({ g, rows: shown.filter((n) => n.group === g) })).filter((x) => x.rows.length > 0);

  const open = (n: AppNotification) => {
    markRead(n.id);
    router.push({ pathname: "/notification-detail", params: { id: n.id } });
  };

  const viewProfile = () => {
    setActive(null);
    soon("Member profile");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Modal visible={!!active} transparent animationType="slide" onRequestClose={() => setActive(null)}>
        <Pressable style={styles.backdrop} onPress={() => setActive(null)} />
        {active ? (
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHead}>
              {active.person?.photo ? (
                <Avatar name={active.person.name} photo={active.person.photo} size={44} />
              ) : (
                <View style={[styles.iconBox, { width: 44, height: 44 }]}>
                  <Ionicons name={active.icon} size={20} color={Colors.goldDark} />
                </View>
              )}
              <Text style={styles.sheetHeadText}>
                <Text style={styles.rowTitle}>{active.title}</Text> {active.body}
              </Text>
            </View>
            <SheetAction
              icon={active.read ? "mail-unread-outline" : "checkmark"}
              label={active.read ? "Mark as Unread" : "Mark as Read"}
              onPress={() => {
                markRead(active.id, !active.read);
                setActive(null);
              }}
            />
            {active.person ? (
              <>
                <SheetAction icon="person-outline" label="View Profile" onPress={viewProfile} />
                <SheetAction
                  icon="paper-plane-outline"
                  label="Send Message"
                  onPress={() => {
                    setActive(null);
                    soon("Messages");
                  }}
                />
              </>
            ) : null}
            <SheetAction
              icon="notifications-off-outline"
              label="Remove from Notifications"
              danger
              onPress={() => {
                removeNotification(active.id);
                setActive(null);
              }}
            />
            <Pressable style={styles.cancel} onPress={() => setActive(null)} accessibilityRole="button">
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}
      </Modal>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/network"))} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={26} color={Colors.navy} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={markAllRead} hitSlop={8} disabled={unread === 0} accessibilityRole="button">
          <Text style={[styles.markAll, unread === 0 && styles.markAllOff]}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {items.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
            {FILTERS.map((f) => {
              const on = filter === f;
              const color = on ? Colors.white : Colors.navy;
              const text = <Text style={[styles.chipText, { color }]}>{label(f)}</Text>;
              return (
                <Pressable key={f} onPress={() => setFilter(f)} accessibilityRole="button" accessibilityState={{ selected: on }}>
                  {on ? (
                    <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.chip}>
                      {text}
                    </LinearGradient>
                  ) : (
                    <View style={[styles.chip, styles.chipOff]}>{text}</View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {groups.map(({ g, rows }) => (
          <View key={g} style={styles.group}>
            <Text style={styles.groupTitle}>{g}</Text>
            {rows.map((n) => (
              <Row key={n.id} n={n} onPress={() => open(n)} onMore={() => setActive(n)} />
            ))}
          </View>
        ))}

        {shown.length === 0 && items.length > 0 ? (
          <View style={styles.emptySmall}>
            <Ionicons name="notifications-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nothing here</Text>
            <Text style={styles.emptyText}>No {filter === "unread" ? "unread" : label(filter).toLowerCase()} notifications.</Text>
            <Pressable onPress={() => setFilter("all")} hitSlop={8}>
              <Text style={styles.link}>Show all</Text>
            </Pressable>
          </View>
        ) : null}

        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.bellCircle}>
              <Ionicons name="notifications" size={64} color={Colors.gold} />
            </View>
            <Text style={styles.emptyHead}>You’re all caught up!</Text>
            <Text style={styles.emptyBody}>No new notifications at the moment. We’ll notify you about new connections, introductions, opportunities, events and more.</Text>
            <Pressable onPress={() => router.replace("/network")} style={styles.exploreWrap} accessibilityRole="button">
              <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.explore}>
                <Text style={styles.exploreText}>Explore Network</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SheetAction({ icon, label, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  const color = danger ? Colors.error : Colors.navy;
  return (
    <Pressable style={styles.action} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  title: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  markAll: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  markAllOff: { color: Colors.textMuted },
  scroll: { paddingHorizontal: 16, gap: 14, flexGrow: 1 },

  bleed: { marginHorizontal: -16, flexGrow: 0 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: { height: 36, paddingHorizontal: 16, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  chipOff: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipText: { fontFamily: Fonts.medium, fontSize: 12 },

  group: { gap: 8 },
  groupTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white },
  rowUnread: { backgroundColor: "#FEF6E6" },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1, minWidth: 0 },
  rowText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  rowTitle: { fontFamily: Fonts.bold },
  time: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2F6FDE" },

  emptySmall: { alignItems: "center", gap: 6, paddingVertical: 40 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  emptyText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  link: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 24 },
  bellCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyHead: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  emptyBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, textAlign: "center" },
  exploreWrap: { alignSelf: "stretch", marginTop: 16 },
  explore: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  exploreText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetHead: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 12 },
  sheetHeadText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  action: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  actionText: { fontFamily: Fonts.medium, fontSize: 14 },
  cancel: { marginTop: 8, height: 50, borderRadius: Radius.md, backgroundColor: "#EEF1F5", alignItems: "center", justifyContent: "center" },
  cancelText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
});
