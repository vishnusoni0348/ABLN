import { NetworkTabBar, PersonAvatar } from "@/components/intro-ui";
import { Tag } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { acceptRequest, declineRequest, useConnections } from "@/lib/connection-store";
import { formatDateTime } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLUE = "#2F6FDE";

export default function ConnectionRequest() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { incoming } = useConnections();
  const req = incoming.find((r) => r.id === id);
  const member = findMember(req?.name);

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/network"))} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={24} color={Colors.navy} />
      </Pressable>
      <Text style={styles.headerTitle}>Connection Request</Text>
      <View style={styles.back} />
    </View>
  );

  // Already accepted or declined (or a stale link).
  if (!req) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        {header}
        <View style={styles.missing}>
          <Text style={styles.name}>Request no longer available</Text>
          <Text style={styles.role}>This request has already been answered.</Text>
        </View>
        <NetworkTabBar />
      </View>
    );
  }

  const accept = () => {
    acceptRequest(req.id);
    router.replace("/my-connections");
  };
  const decline = () => {
    declineRequest(req.id);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      {header}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <PersonAvatar name={req.name} size={88} />
          <View style={styles.badge}>
            <Ionicons name="ribbon" size={11} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.name}>{req.name}</Text>
        {member ? (
          <>
            <Text style={styles.role}>{member.role}</Text>
            <Text style={styles.role}>{member.company}</Text>
            <View style={styles.locRow}>
              <Ionicons name="location" size={13} color={Colors.goldDark} />
              <Text style={styles.loc}>{member.location}</Text>
            </View>
            <View style={styles.tags}>
              {member.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.quote}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>{req.message}</Text>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.date}>{formatDateTime(req.sentAt)}</Text>
        </View>

        <View style={styles.btns}>
          <Pressable onPress={accept} style={({ pressed }) => [styles.flex, pressed && styles.pressed]} accessibilityRole="button">
            <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
              <Text style={styles.acceptText}>Accept</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={decline} style={({ pressed }) => [styles.flex, styles.btn, styles.decline, pressed && styles.pressed]} accessibilityRole="button">
            <Ionicons name="close" size={20} color={Colors.error} />
            <Text style={styles.declineText}>Decline</Text>
          </Pressable>
        </View>

        {member ? (
          <Pressable onPress={() => router.push({ pathname: "/member-profile", params: { name: member.name } })} hitSlop={8} style={styles.viewProfile} accessibilityRole="link">
            <Text style={styles.viewProfileText}>View Profile</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 16 },
  back: { width: 36, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24, alignItems: "center" },
  avatarWrap: { marginTop: 12 },
  badge: { position: "absolute", right: 2, bottom: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.white },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, marginTop: 12 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, marginTop: 4, textAlign: "center" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  loc: { color: Colors.goldDark, fontFamily: Fonts.regular, fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 14 },
  quote: { alignSelf: "stretch", flexDirection: "row", gap: 10, marginTop: 20, padding: 14, borderRadius: Radius.md, backgroundColor: "#EAF2FD" },
  quoteMark: { color: BLUE, fontFamily: Fonts.bold, fontSize: 32, lineHeight: 34 },
  quoteText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20 },
  dateRow: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  date: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  btns: { alignSelf: "stretch", flexDirection: "row", gap: 12, marginTop: 24 },
  btn: { height: 50, borderRadius: Radius.sm, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  acceptText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  decline: { borderWidth: 1.5, borderColor: Colors.error, backgroundColor: Colors.white },
  declineText: { color: Colors.error, fontFamily: Fonts.bold, fontSize: 15 },
  viewProfile: { marginTop: 22 },
  viewProfileText: { color: BLUE, fontFamily: Fonts.semiBold, fontSize: 14 },
});
