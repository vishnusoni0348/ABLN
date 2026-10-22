import { Avatar, CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { completeGuideSection, GuideSectionKey } from "@/lib/guide-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Step = {
  title: string;
  accent: string;
  sub: string;
  completes: GuideSectionKey[];
  points: { icon: IconName; title: string; sub: string }[];
  preview: ReactNode;
};

const STEPS: Step[] = [
  {
    title: "Build Meaningful",
    accent: "Connections",
    sub: "Discover and connect with business leaders, experts and potential partners across ABLN.",
    completes: ["network"],
    points: [
      { icon: "search", title: "Find the right members", sub: "Search by industry, location and expertise" },
      { icon: "shield-checkmark", title: "Explore verified profiles", sub: "Connect with trusted business leaders" },
      { icon: "people", title: "Connect with business leaders", sub: "Grow your network and create opportunities" },
    ],
    preview: <MemberPreview />,
  },
  {
    title: "Find Opportunities.",
    accent: "Join Events.",
    sub: "Explore business opportunities and upcoming events to collaborate, grow and stay ahead.",
    completes: ["opportunities"],
    points: [
      { icon: "briefcase", title: "Explore business collaborations", sub: "Discover verified opportunities" },
      { icon: "calendar", title: "Register for events", sub: "Join summits, webinars and networking events" },
    ],
    preview: <OpportunityPreview />,
  },
  {
    title: "Ask, Learn &",
    accent: "Unlock Benefits",
    sub: "Get expert advice from the network and access exclusive partner privileges.",
    completes: ["ask", "privileges"],
    points: [
      { icon: "chatbubble-ellipses", title: "Ask members for expertise", sub: "Get insights, solve challenges and learn" },
      { icon: "gift", title: "Access exclusive partner benefits", sub: "Save more and grow your business" },
    ],
    preview: <BenefitsPreview />,
  },
];

export default function AppTour() {
  const insets = useSafeAreaInsets();
  const { step: stepParam } = useLocalSearchParams<{ step?: string }>();
  const [index, setIndex] = useState(() => Math.min(Math.max(Number(stepParam) || 0, 0), STEPS.length - 1));
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const next = () => {
    step.completes.forEach(completeGuideSection);
    if (last) router.back();
    else setIndex(index + 1);
  };
  const prev = () => setIndex(index - 1);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back" style={styles.side}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>App Guide</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={[styles.side, { alignItems: "flex-end" }]}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={[styles.title, { color: Colors.goldDark }]}>{step.accent}</Text>
          <Text style={styles.sub}>{step.sub}</Text>

          {step.preview}

          <View style={{ gap: 8 }}>
            {step.points.map((p) => (
              <View key={p.title} style={styles.point}>
                <View style={styles.pointIcon}>
                  <Ionicons name={p.icon} size={20} color={Colors.goldDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pointTitle}>{p.title}</Text>
                  <Text style={styles.pointSub}>{p.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={styles.stepText}>
            Step {index + 1} of {STEPS.length}
          </Text>
          <View style={styles.segments} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: STEPS.length, now: index + 1 }}>
            {STEPS.map((s, i) => (
              <View key={s.accent} style={[styles.segment, i <= index && { backgroundColor: Colors.gold }]} />
            ))}
          </View>
          <View style={styles.buttons}>
            {last ? null : (
              <Pressable onPress={index === 0 ? () => router.back() : prev} accessibilityRole="button" style={[styles.btn, styles.outline]}>
                <Text style={styles.outlineText}>{index === 0 ? "Skip Tour" : "Back"}</Text>
              </Pressable>
            )}
            <Pressable onPress={next} accessibilityRole="button" style={{ flex: 1 }}>
              <LinearGradient colors={[Colors.goldDark, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                <Text style={styles.btnText}>{last ? "Finish Tour" : "Next"}</Text>
                <Ionicons name={last ? "checkmark" : "arrow-forward"} size={18} color={Colors.white} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function MemberPreview() {
  return (
    <View style={styles.previewWrap}>
      <View style={styles.memberCard}>
        <Avatar name="Amit Gupta" size={72} />
        <View style={styles.verified}>
          <Ionicons name="checkmark" size={11} color={Colors.goldDark} />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
        <Text style={styles.memberName}>Amit Gupta</Text>
        <Text style={styles.memberMeta}>CEO & Founder · Gupta Industries</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location" size={12} color={Colors.goldDark} />
          <Text style={styles.memberMeta}>Jaipur, Rajasthan</Text>
        </View>
      </View>
    </View>
  );
}

function PreviewCard({ icon, tag, tagColor, title, lines }: { icon: IconName; tag: string; tagColor: string; title: string; lines: string[] }) {
  return (
    <View style={styles.listCard}>
      <LinearGradient colors={[Colors.royalNavy, Colors.navy]} style={styles.thumb}>
        <Ionicons name={icon} size={30} color={Colors.goldLight} />
      </LinearGradient>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.tag, { color: tagColor }]}>{tag}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        {lines.map((l) => (
          <Text key={l} style={styles.memberMeta}>{l}</Text>
        ))}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </View>
  );
}

function OpportunityPreview() {
  return (
    <View style={{ gap: 10 }}>
      <PreviewCard icon="sunny" tag="Opportunity" tagColor="#2F6FED" title="Strategic Partnership in Renewable Energy" lines={["India · Renewable Energy"]} />
      <PreviewCard icon="mic" tag="Event" tagColor="#7A4FD0" title="ABLN Business Leadership Summit 2026" lines={["25 Nov 2026 | 10:00 AM - 6:00 PM", "Jaipur Convention Centre"]} />
    </View>
  );
}

function BenefitsPreview() {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.askCard}>
        <View style={styles.askTag}>
          <Ionicons name="help-circle" size={16} color="#2F6FED" />
          <Text style={[styles.cardTitle, { fontSize: 13 }]}>Ask Network</Text>
        </View>
        <View style={styles.question}>
          <Text style={[styles.pointTitle, { flex: 1, fontFamily: Fonts.medium }]}>What are the latest trends in AI for manufacturing businesses?</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.navy} />
        </View>
        <Text style={styles.memberMeta}>12 Answers from industry experts</Text>
      </View>
      <LinearGradient colors={["#FEF6E6", "#F8E2A8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.perkCard}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.tag, { color: Colors.goldDark }]}>ABLN Privileges</Text>
          <Text style={styles.cardTitle}>Exclusive Benefits for ABLN Members</Text>
          <Text style={styles.memberMeta}>Special discounts, priority access and premium services from our trusted partners.</Text>
        </View>
        <Ionicons name="gift" size={52} color={Colors.gold} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14 },
  side: { width: 60 },
  headerTitle: { color: Colors.white, fontFamily: Fonts.semiBold, fontSize: 16 },
  skip: { color: Colors.goldLight, fontFamily: Fonts.semiBold, fontSize: 14 },
  sheet: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, overflow: "hidden" },
  scroll: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 16, gap: 4 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 33 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, marginBottom: 16, marginTop: 8 },
  previewWrap: { alignItems: "center", paddingVertical: 4 },
  memberCard: { width: "62%", alignItems: "center", gap: 4, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  verified: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#FBF1D6", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  verifiedText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 10 },
  memberName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 2 },
  memberMeta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  listCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  thumb: { width: 76, height: 76, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  tag: { fontFamily: Fonts.bold, fontSize: 11 },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 19 },
  askCard: { gap: 8, padding: 12, borderRadius: Radius.lg, backgroundColor: "#EAF1FD" },
  askTag: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  question: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 12 },
  perkCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.champagne },
  point: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: Radius.md, backgroundColor: "#F8FAFD" },
  pointIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FBF1D6", alignItems: "center", justifyContent: "center" },
  pointTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  pointSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },
  footer: { paddingHorizontal: 18, paddingTop: 12, gap: 8, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  stepText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  segments: { flexDirection: "row", gap: 6 },
  segment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "#E3E9F1" },
  buttons: { flexDirection: "row", gap: 12, marginTop: 4 },
  btn: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  btnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  outline: { flex: 1, borderWidth: 1.5, borderColor: Colors.navy, backgroundColor: Colors.white },
  outlineText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
});
