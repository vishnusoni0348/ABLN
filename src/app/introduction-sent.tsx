import { GoldButton, NetworkTabBar, OutlineButton, Tip } from "@/components/intro-ui";
import { Colors, Fonts } from "@/constants/theme";
import { formatTime, useIntroRequest } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function IntroductionSent() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const req = useIntroRequest(id);

  const steps: { icon: IconName; title: string; body: string; done?: boolean }[] = [
    { icon: "paper-plane", title: "Request Sent", body: req ? `Today, ${formatTime(req.sentAt)}` : "Today", done: true },
    { icon: "hourglass-outline", title: "Under Review", body: `${req?.introducer ?? "Your introducer"} will review your request.` },
    { icon: "people-outline", title: "Introduction", body: "If accepted, you will be introduced to both members." },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/network")} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to network">
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Introduction Request</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.halo}>
          <Ionicons name="paper-plane" size={52} color="#2F6FDE" />
          <View style={styles.check}>
            <Ionicons name="checkmark" size={14} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.title}>Introduction Request Sent!</Text>
        <Text style={styles.lead}>
          Your request has been sent to {req?.introducer ?? "your introducer"} to introduce you to {req?.target ?? "the member"}.
        </Text>

        <View style={styles.timeline}>
          {steps.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.rail}>
                <View style={[styles.dot, s.done && styles.dotDone]}>
                  <Ionicons name={s.icon} size={18} color={s.done ? Colors.white : Colors.textSecondary} />
                </View>
                {i < steps.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Tip>{"We'll notify you once there is an update on your request."}</Tip>
        <GoldButton label="View Request Status" onPress={() => router.replace({ pathname: "/introduction-details", params: { id } })} style={{ marginTop: 14 }} />
        <OutlineButton label="Back to Network" onPress={() => router.replace("/network")} style={{ marginTop: 10 }} />
      </ScrollView>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 16 },
  back: { width: 36, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24, alignItems: "stretch" },
  halo: { alignSelf: "center", width: 112, height: 112, borderRadius: 56, backgroundColor: "#FDF3DA", alignItems: "center", justifyContent: "center", marginTop: 16 },
  check: { position: "absolute", right: 12, bottom: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.white },
  title: { textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, marginTop: 16 },
  lead: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 8, paddingHorizontal: 8 },
  timeline: { marginTop: 22, marginBottom: 14 },
  step: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: 40 },
  dot: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: "#F5F7FA", alignItems: "center", justifyContent: "center" },
  dotDone: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  line: { width: 1.5, flex: 1, minHeight: 22, backgroundColor: Colors.border },
  stepText: { flex: 1, paddingBottom: 18 },
  stepTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  stepBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
