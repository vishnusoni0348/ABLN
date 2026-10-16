import { ResultBody } from "@/components/adviser-ui";
import { GoldButton, OutlineBtn } from "@/components/settings-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { approveAdviser, useAdviser } from "@/lib/adviser-store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const STEPS: { label: string; state: "done" | "active" | "todo" }[] = [
  { label: "Application submitted", state: "done" },
  { label: "Under review", state: "active" },
  { label: "Approval pending", state: "todo" },
];
const STEP_ICON: Record<string, IconName> = { done: "checkmark-circle", active: "radio-button-on", todo: "ellipse-outline" };
const STEP_COLOR: Record<string, string> = { done: Colors.success, active: Colors.navy, todo: Colors.textMuted };

/** Shows "Under Review" while pending and the celebration screen once approved. */
export default function AdviserStatus() {
  const { status } = useAdviser();
  const insets = useSafeAreaInsets();

  if (status === "none") return <Redirect href="/adviser-intro" />;

  const approved = status === "approved";
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <ScreenHeader title="Adviser Application" />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {approved ? (
          <ResultBody
            illustration={<Image source={require("../../assets/images/adviser-approved.png")} style={styles.art} contentFit="contain" />}
            title="You're Now an Adviser!"
            message="Your adviser profile is live. Start helping fellow ABLN members with your expertise and experience."
          />
        ) : (
          <ResultBody
            illustration={
              <View style={styles.reviewArt}>
                <Ionicons name="document-text-outline" size={72} color="#9DB4D6" />
                <View style={styles.clock}>
                  <Ionicons name="time" size={34} color={Colors.gold} />
                </View>
              </View>
            }
            title="Under Review"
            message="Our team is reviewing your adviser application. This usually takes 1–2 business days."
          >
            <View style={styles.timeline}>
              {STEPS.map((s) => (
                <View key={s.label} style={styles.stepRow}>
                  <Ionicons name={STEP_ICON[s.state]} size={22} color={STEP_COLOR[s.state]} />
                  <Text style={[styles.stepText, s.state === "todo" && { color: Colors.textSecondary }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </ResultBody>
        )}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {approved ? (
          <>
            <GoldButton label="View My Adviser Profile" onPress={() => router.replace("/adviser-profile")} />
            <OutlineBtn label="Explore Adviser Requests" color={Colors.goldDark} onPress={() => router.navigate("/network")} />
          </>
        ) : (
          <>
            <GoldButton label="Back to Profile" onPress={() => router.back()} />
            {/* Stand-in for back-office approval; stripped from production builds. */}
            {__DEV__ ? <OutlineBtn label="Simulate approval (dev)" onPress={approveAdviser} /> : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingBottom: 16 },
  art: { width: "100%", height: 260 },
  reviewArt: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#EEF3FB", alignItems: "center", justifyContent: "center" },
  clock: { position: "absolute", right: 14, bottom: 14, width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  timeline: { alignSelf: "stretch", gap: 14, marginTop: 28, padding: 18, borderRadius: Radius.lg, backgroundColor: "#F3F6FB" },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 15 },
  footer: { paddingHorizontal: 20, gap: 12 },
});
