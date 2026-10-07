import { GoldButton, NetworkTabBar, OutlineButton } from "@/components/intro-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { useConnections } from "@/lib/connection-store";
import { formatTime } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const CONFETTI = [
  { top: 8, left: 34, color: "#F5A623", size: 7 },
  { top: 0, right: 40, color: "#F5A623", size: 6 },
  { top: 34, right: 12, color: "#2F6FDE", size: 7 },
  { top: 78, left: 14, color: "#E94E9B", size: 6 },
  { bottom: 6, left: 40, color: "#22A06B", size: 7 },
  { bottom: 0, right: 30, color: "#22A06B", size: 6 },
  { top: 84, right: 4, color: "#E94E9B", size: 5 },
] as const;

export default function ConnectionSent() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const { sent } = useConnections();
  const member = findMember(name);
  const first = name ?? "the member";
  const at = name ? sent[name] : undefined;

  const steps: { icon: IconName; title: string; body: string; done?: boolean }[] = [
    { icon: "checkmark", title: "Request Sent", body: `Today, ${formatTime(at ?? new Date())}\nYour connection request has been sent.`, done: true },
    { icon: "time-outline", title: "Pending Response", body: `${first} will be notified about your request.` },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {CONFETTI.map((c, i) => (
            <View key={i} style={[styles.dot, { width: c.size, height: c.size, borderRadius: c.size / 2, backgroundColor: c.color }, c]} />
          ))}
          <View style={styles.halo}>
            <Ionicons name="paper-plane" size={56} color={Colors.success} />
          </View>
        </View>
        <Text style={styles.title}>Connection Request Sent!</Text>
        <Text style={styles.lead}>
          Your connection request has been sent to {first}.{"\n"}You&apos;ll be notified once they respond.
        </Text>

        <View style={styles.timeline}>
          {steps.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.rail}>
                <View style={[styles.stepIcon, s.done && styles.stepIconDone]}>
                  <Ionicons name={s.icon} size={s.done ? 20 : 22} color={s.done ? Colors.white : Colors.textSecondary} />
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

        <GoldButton
          label="View Profile"
          icon="paper-plane-outline"
          onPress={() => (member ? router.replace({ pathname: "/member-profile", params: { name: member.name } }) : router.back())}
          style={{ marginTop: 18 }}
        />
        <OutlineButton label="Continue Networking" icon="paper-plane-outline" onPress={() => router.replace("/network")} style={{ marginTop: 10 }} />
      </ScrollView>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 16 },
  back: { width: 36, height: 40, justifyContent: "center" },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  hero: { alignSelf: "center", width: 190, height: 170, alignItems: "center", justifyContent: "center", marginTop: 8 },
  dot: { position: "absolute" },
  halo: { width: 132, height: 132, borderRadius: 66, backgroundColor: "#E4F5EC", alignItems: "center", justifyContent: "center" },
  title: { textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, marginTop: 12 },
  lead: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 8 },
  timeline: { marginTop: 24, padding: 16, borderRadius: Radius.lg, backgroundColor: "#F5F8FC" },
  step: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: 40 },
  stepIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  stepIconDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  line: { width: 1.5, flex: 1, minHeight: 22, backgroundColor: Colors.border },
  stepText: { flex: 1, paddingBottom: 18, paddingTop: 2 },
  stepTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  stepBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
