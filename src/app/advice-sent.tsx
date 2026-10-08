import { GoldBtn, OutlineBtn } from "@/components/expert-ui";
import { Avatar, CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { rupees } from "@/data/experts";
import { findMember } from "@/data/members";
import { ADVICE_STATUS_LABEL, cancelAdviceRequest, useAdviceRequest } from "@/lib/advice-store";
import { formatDate } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdviceSent() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const req = useAdviceRequest(id);

  if (!req) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Request not found</Text>
        <OutlineBtn label="My Advice Requests" onPress={() => router.replace("/my-advice")} style={{ marginTop: 16, paddingHorizontal: 24 }} />
      </View>
    );
  }

  const cancelled = req.status === "cancelled";
  const rows: [string, string][] = [
    ["Advice type", req.type === "paid" ? `Paid (${rupees(req.price ?? 0)})` : "Free"],
    ["Date", formatDate(req.date)],
    ["Time", req.slot],
    ["Status", ADVICE_STATUS_LABEL[req.status]],
  ];
  const cancel = () =>
    Alert.alert("Cancel request?", `Your advice request to ${req.expert} will be cancelled.`, [
      { text: "Keep Request", style: "cancel" },
      { text: "Cancel Request", style: "destructive", onPress: () => cancelAdviceRequest(req.id) },
    ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.halo, cancelled && { backgroundColor: "#EEF1F5" }]}>
          <Ionicons name={cancelled ? "close" : "paper-plane"} size={48} color={cancelled ? Colors.textSecondary : "#2F6FDE"} />
        </View>
        <Text style={styles.title}>{cancelled ? "Request Cancelled" : "Request Sent!"}</Text>
        <Text style={styles.lead}>
          {cancelled ? `You cancelled your advice request to ${req.expert}.` : `${req.expert} will review your request and respond shortly. We will notify you of any update.`}
        </Text>

        <View style={styles.card}>
          <View style={styles.who}>
            <Avatar name={req.expert} photo={findMember(req.expert)?.photo} size={48} />
            <Text style={styles.name}>{req.expert}</Text>
          </View>
          {rows.map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.key}>{k}</Text>
              <Text style={styles.val}>{v}</Text>
            </View>
          ))}
          {req.message ? (
            <View style={styles.msg}>
              <Text style={styles.key}>Your message</Text>
              <Text style={styles.val}>{req.message}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ marginTop: 16, gap: 10 }}>
          <GoldBtn label="My Advice Requests" onPress={() => router.replace("/my-advice")} />
          {cancelled ? null : <OutlineBtn label="Cancel Request" onPress={cancel} style={{ height: 50 }} />}
          <OutlineBtn label="Back to Network" onPress={() => router.replace("/network")} style={{ height: 50 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16 },
  halo: { alignSelf: "center", width: 104, height: 104, borderRadius: 52, backgroundColor: "#FDF3DA", alignItems: "center", justifyContent: "center", marginTop: 24 },
  title: { textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, marginTop: 16 },
  lead: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 8, paddingHorizontal: 8 },
  card: { marginTop: 22, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.white, ...CARD_SHADOW },
  who: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 6 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  key: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  val: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13, flexShrink: 1, textAlign: "right" },
  msg: { paddingTop: 10, gap: 4, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
});
