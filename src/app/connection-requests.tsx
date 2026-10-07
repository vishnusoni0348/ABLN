import { NetworkTabBar, PersonAvatar } from "@/components/intro-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { acceptRequest, declineRequest, useConnections } from "@/lib/connection-store";
import { formatDate } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ConnectionRequests() {
  const insets = useSafeAreaInsets();
  const { incoming } = useConnections();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/my-connections"))} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Connection Requests</Text>
        <View style={styles.back} />
      </View>

      {incoming.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.halo}>
            <Ionicons name="person-add-outline" size={44} color={Colors.gold} />
          </View>
          <Text style={styles.emptyTitle}>No pending requests</Text>
          <Text style={styles.emptyText}>New connection requests will show up here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>
            {incoming.length} {incoming.length === 1 ? "Request" : "Requests"}
          </Text>
          {incoming.map((r) => {
            const m = findMember(r.name);
            return (
              <Pressable
                key={r.id}
                style={styles.card}
                onPress={() => router.push({ pathname: "/connection-request", params: { id: r.id } })}
                accessibilityRole="button"
                accessibilityLabel={`View request from ${r.name}`}
              >
                <View style={styles.top}>
                  <PersonAvatar name={r.name} size={54} />
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {r.name}
                      </Text>
                      {m?.verified ? <Ionicons name="checkmark-circle" size={15} color="#2F6FDE" /> : null}
                    </View>
                    {m ? (
                      <Text style={styles.role} numberOfLines={1}>
                        {m.role} • {m.company}
                      </Text>
                    ) : null}
                    <Text style={styles.date}>{formatDate(r.sentAt)}</Text>
                  </View>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                  {r.message}
                </Text>
                <View style={styles.btns}>
                  <Pressable
                    style={({ pressed }) => [styles.btn, styles.accept, pressed && styles.pressed]}
                    onPress={() => acceptRequest(r.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Accept ${r.name}`}
                  >
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
                    <Text style={styles.acceptText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.btn, styles.decline, pressed && styles.pressed]}
                    onPress={() => declineRequest(r.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Decline ${r.name}`}
                  >
                    <Ionicons name="close" size={18} color={Colors.error} />
                    <Text style={styles.declineText}>Decline</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 16 },
  back: { width: 36, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  count: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13, marginTop: 8 },

  card: { padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5", shadowColor: Colors.navy, shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, flexShrink: 1 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  date: { color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 10, marginTop: 3 },
  message: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 12 },
  btns: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, height: 42, borderRadius: Radius.sm, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  accept: { backgroundColor: Colors.gold },
  acceptText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 13 },
  decline: { borderWidth: 1.5, borderColor: Colors.error, backgroundColor: Colors.white },
  declineText: { color: Colors.error, fontFamily: Fonts.bold, fontSize: 13 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  halo: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#FDF0D8", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginTop: 20 },
  emptyText: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 8 },
});
