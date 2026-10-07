import { BackHeader, GoldButton, NetworkTabBar, OutlineButton, PersonAvatar, StatusPill, Tip } from "@/components/intro-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { canRemind, formatDateTime, sendReminder, setIntroStatus, useIntroRequest, type IntroRequest } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Step = { icon: IconName; title: string; body: string; state: "done" | "current" | "todo" | "failed" };

function buildSteps(r: IntroRequest): Step[] {
  const sent: Step = { icon: "checkmark", title: "Request Sent", body: `${formatDateTime(r.sentAt)}\nYour introduction request has been sent to ${r.introducer}.`, state: "done" };
  if (r.status === "review") {
    return [
      sent,
      { icon: "hourglass-outline", title: "Under Review", body: `${r.introducer} is reviewing your request.`, state: "current" },
      { icon: "stop", title: "Accepted", body: "You will be introduced to both members.", state: "todo" },
      { icon: "stop", title: "Introduction Completed", body: "Start your conversation and explore opportunities.", state: "todo" },
    ];
  }
  if (r.status === "accepted") {
    return [
      sent,
      { icon: "checkmark", title: "Under Review", body: `${r.introducer} reviewed your request.`, state: "done" },
      { icon: "checkmark", title: "Accepted", body: `${r.introducer} accepted your request.`, state: "done" },
      { icon: "hourglass-outline", title: "Introduction Completed", body: "Start your conversation and explore opportunities.", state: "current" },
    ];
  }
  if (r.status === "withdrawn") {
    return [
      sent,
      { icon: "checkmark", title: "Accepted", body: `${r.introducer} accepted your request.`, state: "done" },
      { icon: "close", title: "Withdrawn", body: `${r.introducer} withdrew this introduction.`, state: "failed" },
    ];
  }
  if (r.status === "cancelled") {
    return [sent, { icon: "close", title: "Cancelled", body: "You cancelled this introduction request.", state: "failed" }];
  }
  return [
    sent,
    { icon: "checkmark", title: "Under Review", body: `${r.introducer} reviewed your request.`, state: "done" },
    { icon: "close", title: "Declined", body: r.declineReason ? `${r.introducer}: “${r.declineReason}”` : `${r.introducer} was unable to make this introduction.`, state: "failed" },
  ];
}

const DOT: Record<Step["state"], { bg: string; fg: string }> = {
  done: { bg: Colors.gold, fg: Colors.white },
  current: { bg: Colors.gold, fg: Colors.white },
  todo: { bg: "#C9D1DC", fg: Colors.white },
  failed: { bg: Colors.error, fg: Colors.white },
};

export default function IntroductionDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const req = useIntroRequest(id);

  if (!req) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingHorizontal: 16 }]}>
        <BackHeader title="Introduction Details" fallback="/my-introductions" />
        <Text style={styles.empty}>Request not found</Text>
      </View>
    );
  }

  const steps = buildSteps(req);
  const remind = () => {
    sendReminder(req.id);
    Alert.alert("Reminder sent", `We've reminded ${req.introducer} to review your request.`);
  };
  const sendAgain = () => router.replace({ pathname: "/request-introduction", params: { name: req.introducer, target: req.target, reason: req.reason, message: req.message } });
  const cancel = () =>
    Alert.alert("Cancel request?", `Your introduction request to ${req.introducer} will be withdrawn.`, [
      { text: "Keep Request", style: "cancel" },
      {
        text: "Cancel Request",
        style: "destructive",
        onPress: () => {
          setIntroStatus(req.id, "cancelled");
          router.replace("/my-introductions");
        },
      },
    ]);
  const people = [
    { name: req.requester, role: "Requester" },
    { name: req.introducer, role: "Introducer" },
    { name: req.target, role: "Target" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <BackHeader title="Introduction Details" fallback="/my-introductions" />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.people}>
          {people.map((p, i) => (
            <View key={p.role} style={styles.personWrap}>
              <View style={styles.person}>
                <PersonAvatar name={p.name} size={58} />
                <Text style={styles.pName} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={styles.pRole}>{p.role}</Text>
              </View>
              {i < people.length - 1 ? <Ionicons name="link" size={16} color={Colors.gold} style={styles.link} /> : null}
            </View>
          ))}
        </View>

        <View style={styles.statusHead}>
          <Text style={[styles.heading, { marginVertical: 0 }]}>Request Status</Text>
          <StatusPill status={req.status} />
        </View>
        {steps.map((s, i) => (
          <View key={s.title} style={[styles.step, s.state === "current" && styles.stepCurrent]}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: DOT[s.state].bg }]}>
                <Ionicons name={s.icon} size={s.state === "todo" ? 12 : 16} color={DOT[s.state].fg} />
              </View>
              {i < steps.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepBody}>{s.body}</Text>
            </View>
          </View>
        ))}

        <View style={{ marginTop: 16 }}>
          <Tip>{"You'll be notified once there is an update on your request."}</Tip>
        </View>
        {canRemind(req) ? <GoldButton label="Send Reminder" onPress={remind} style={{ marginTop: 16 }} /> : null}
        {req.status === "review" && req.remindedAt ? <Text style={styles.reminded}>Reminder sent on {formatDateTime(req.remindedAt)}</Text> : null}
        {req.status === "review" ? <OutlineButton label="Cancel Request" onPress={cancel} style={styles.cancel} /> : null}
        {req.status === "declined" || req.status === "cancelled" ? <GoldButton label="Send Again" onPress={sendAgain} style={{ marginTop: 16 }} /> : null}
      </ScrollView>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: "center", marginTop: 40, color: Colors.textSecondary, fontFamily: Fonts.medium },
  people: { flexDirection: "row", marginTop: 10, marginBottom: 6 },
  personWrap: { flex: 1, flexDirection: "row", alignItems: "flex-start" },
  person: { flex: 1, alignItems: "center", gap: 3 },
  pName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12, textAlign: "center", marginTop: 4 },
  pRole: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  link: { position: "absolute", right: -8, top: 20, zIndex: 1 },
  statusHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 10 },
  reminded: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 12 },
  cancel: { marginTop: 16, borderColor: Colors.error },
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 18, marginBottom: 10 },
  step: { flexDirection: "row", gap: 12, paddingHorizontal: 8, borderRadius: Radius.md },
  stepCurrent: { backgroundColor: "#FDF3DA" },
  rail: { alignItems: "center", width: 32 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 8 },
  line: { width: 1.5, flex: 1, minHeight: 12, backgroundColor: Colors.border },
  stepText: { flex: 1, paddingVertical: 10 },
  stepTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  stepBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
