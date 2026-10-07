import { BackHeader, GoldButton, NetworkTabBar, OutlineButton, PersonAvatar } from "@/components/intro-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { formatDateTime, setIntroStatus, useIntroRequest } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function IntroductionReceived() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const req = useIntroRequest(id);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");

  if (!req) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingHorizontal: 16 }]}>
        <BackHeader title="Introduction Request" fallback="/my-introductions" />
        <Text style={styles.empty}>Request not found</Text>
      </View>
    );
  }

  const requester = findMember(req.requester);
  const target = findMember(req.target);
  const pending = req.status === "review";

  const accept = () => {
    setIntroStatus(req.id, "accepted");
    Alert.alert("Introduction made", `You have introduced ${req.requester} and ${req.target}.`, [{ text: "OK", onPress: () => router.replace("/my-introductions") }]);
  };
  const confirmDecline = () => {
    setIntroStatus(req.id, "declined", reason.trim() || undefined);
    setDeclining(false);
    router.replace("/my-introductions");
  };
  const withdraw = () =>
    Alert.alert("Withdraw introduction?", `${req.requester} will be told this introduction was withdrawn.`, [
      { text: "Keep", style: "cancel" },
      { text: "Withdraw", style: "destructive", onPress: () => setIntroStatus(req.id, "withdrawn") },
    ]);
  const moreInfo = () => Alert.alert("Request sent", `We've asked ${req.requester} for more information.`);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <BackHeader title="Introduction Request" fallback="/my-introductions" />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {pending ? (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>New Request</Text>
            </View>
          ) : null}
          <View style={styles.requester}>
            <PersonAvatar name={req.requester} size={64} />
            <View style={styles.flex}>
              <Text style={styles.name}>{req.requester}</Text>
              <Text style={styles.sub}>
                {requester?.role} • {requester?.company}
              </Text>
              <View style={styles.meta}>
                <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
                <Text style={styles.metaText}>{requester?.location}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.wants}>wants an introduction between</Text>
          <View style={styles.pair}>
            <View style={styles.pairCol}>
              <PersonAvatar name={req.requester} size={56} />
              <Text style={styles.pairName}>{req.requester}</Text>
              <Text style={styles.pairCo}>{requester?.company}</Text>
            </View>
            <View style={styles.handshake}>
              <Ionicons name="people" size={20} color={Colors.goldDark} />
            </View>
            <View style={styles.pairCol}>
              <PersonAvatar name={req.target} size={56} />
              <Text style={styles.pairName}>{req.target}</Text>
              <Text style={styles.pairCo}>{target?.company ?? "External contact"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.heading}>Reason for Introduction</Text>
        <View style={styles.quote}>
          <Text style={styles.quoteMark}>❝</Text>
          <Text style={styles.quoteText}>“{req.reason}”</Text>
        </View>

        {req.message ? (
          <>
            <Text style={styles.heading}>Additional Message</Text>
            <View style={styles.quote}>
              <Text style={styles.quoteMark}>❝</Text>
              <Text style={styles.quoteText}>“{req.message}”</Text>
            </View>
          </>
        ) : null}

        {pending ? (
          <>
            <GoldButton label="Accept & Introduce" onPress={accept} style={{ marginTop: 22 }} />
            <OutlineButton label="Decline" onPress={() => setDeclining(true)} style={{ marginTop: 10 }} />
            <Pressable onPress={moreInfo} style={styles.link} accessibilityRole="button">
              <Text style={styles.linkText}>Request More Information</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.record}>
            <Ionicons name={req.status === "accepted" ? "checkmark-circle" : "close-circle"} size={22} color={req.status === "accepted" ? Colors.success : Colors.error} />
            <View style={styles.flex}>
              <Text style={styles.recordTitle}>
                {req.status === "accepted" ? "Introduced" : req.status === "declined" ? "Declined" : req.status === "withdrawn" ? "Withdrawn" : "Cancelled by requester"}
              </Text>
              <Text style={styles.recordBody}>
                {req.resolvedAt ? formatDateTime(req.resolvedAt) : "Earlier"}
                {req.declineReason ? `
Your reason: “${req.declineReason}”` : ""}
              </Text>
            </View>
          </View>
        )}
        {req.status === "accepted" ? (
          <Pressable onPress={withdraw} style={styles.link} accessibilityRole="button">
            <Text style={[styles.linkText, { color: Colors.error }]}>Withdraw Introduction</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <Modal visible={declining} transparent animationType="fade" onRequestClose={() => setDeclining(false)}>
        <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Decline request?</Text>
            <Text style={styles.dialogBody}>{req.requester} will be notified. You can add a reason (optional).</Text>
            <TextInput value={reason} onChangeText={(t) => setReason(t.slice(0, 200))} placeholder="Reason for declining..." placeholderTextColor={Colors.textMuted} multiline style={styles.dialogInput} />
            <GoldButton label="Decline Request" onPress={confirmDecline} style={{ marginTop: 14 }} />
            <OutlineButton label="Cancel" onPress={() => setDeclining(false)} style={{ marginTop: 8 }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1, minWidth: 0 },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: "center", marginTop: 40, color: Colors.textSecondary, fontFamily: Fonts.medium },
  card: { borderRadius: Radius.lg, borderWidth: 1, borderColor: "#EEF1F5", padding: 14, marginTop: 6 },
  newBadge: { alignSelf: "flex-end", backgroundColor: "#FDF0D2", borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4 },
  newText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 11 },
  requester: { flexDirection: "row", gap: 12, alignItems: "center" },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  wants: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 14 },
  pair: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginTop: 14 },
  pairCol: { flex: 1, alignItems: "center", gap: 3 },
  pairName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12, marginTop: 4, textAlign: "center" },
  pairCo: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, textAlign: "center" },
  handshake: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center", marginTop: 8 },
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginTop: 20, marginBottom: 8 },
  quote: { flexDirection: "row", gap: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", padding: 12 },
  quoteMark: { color: Colors.gold, fontSize: 14 },
  quoteText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  link: { alignItems: "center", paddingVertical: 16 },
  linkText: { color: "#2F6FDE", fontFamily: Fonts.semiBold, fontSize: 14 },
  record: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 24, padding: 14, borderRadius: Radius.md, backgroundColor: "#F5F7FA" },
  recordTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  recordBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 18 },
  dialogTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  dialogBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 6 },
  dialogInput: { minHeight: 80, marginTop: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, textAlignVertical: "top" },
  done: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13, marginTop: 24 },
});
