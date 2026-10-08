import { Avatar, CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { ADVICE_STATUS_LABEL, useAdviceRequests } from "@/lib/advice-store";
import { formatDate } from "@/lib/introduction-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyAdvice() {
  const insets = useSafeAreaInsets();
  const items = useAdviceRequests();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="My Advice Requests" />
      </View>
      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? <Text style={styles.empty}>No advice requests yet.</Text> : null}
        {items.map((r) => (
          <Pressable key={r.id} style={styles.card} onPress={() => router.push({ pathname: "/advice-sent", params: { id: r.id } })} accessibilityRole="button">
            <Avatar name={r.expert} photo={findMember(r.expert)?.photo} size={48} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{r.expert}</Text>
              <Text style={styles.meta}>{r.type === "paid" ? "Paid advice" : "Free advice"} • {formatDate(r.date)}, {r.slot}</Text>
            </View>
            <View style={[styles.pill, r.status === "cancelled" && styles.pillOff]}>
              <Text style={[styles.pillText, r.status === "cancelled" && { color: Colors.textSecondary }]}>{ADVICE_STATUS_LABEL[r.status]}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, gap: 12, paddingTop: 8 },
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 40 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  info: { flex: 1, minWidth: 0 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: "#FDF3DC" },
  pillOff: { backgroundColor: "#EEF1F5" },
  pillText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 10 },
});
