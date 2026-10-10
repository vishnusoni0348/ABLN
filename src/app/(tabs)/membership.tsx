import { ScreenHeader } from "@/components/member-ui";
import { MemberCard, SectionTitle } from "@/components/membership-ui";
import { GoldButton } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const BENEFITS: { icon: IconName; label: string }[] = [
  { icon: "heart-outline", label: "Exclusive\nPartner Offers" },
  { icon: "people-outline", label: "Business\nNetworking" },
  { icon: "calendar-outline", label: "Priority Event\nAccess" },
  { icon: "rocket-outline", label: "Growth\nOpportunities" },
];

export default function Membership() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title="Membership" hideBack />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <MemberCard onPress={() => router.push("/membership-status")} />

        <SectionTitle title="Your Membership Benefits" action="See All" onAction={() => router.push("/compare-plans")} />
        <View style={styles.grid}>
          {BENEFITS.map((b) => (
            <View key={b.label} style={styles.benefit}>
              <Ionicons name={b.icon} size={30} color={Colors.gold} />
              <Text style={styles.benefitText}>{b.label}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.push("/choose-plan")} style={({ pressed }) => pressed && styles.pressed} accessibilityRole="button" accessibilityLabel="Explore membership plans">
          <ImageBackground source={require("../../../assets/images/event-conference.jpg")} style={styles.banner} imageStyle={styles.bannerImg}>
            <LinearGradient colors={["rgba(3,18,37,0.55)", "rgba(3,18,37,0.9)"]} style={StyleSheet.absoluteFill} />
            <Text style={styles.bannerText}>{"Be a part of a\nstronger business\ncommunity"}</Text>
            <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.bannerGo}>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </LinearGradient>
          </ImageBackground>
        </Pressable>

        <View style={styles.upgrade}>
          <View style={styles.flex}>
            <Text style={styles.upgradeTitle}>Need to Upgrade?</Text>
            <Text style={styles.upgradeSub}>Unlock more benefits with Premium Membership</Text>
          </View>
          <GoldButton label="View Plans" onPress={() => router.push("/choose-plan")} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },
  top: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  benefit: { width: "48.5%", minHeight: 96, padding: 14, gap: 10, borderRadius: Radius.md, backgroundColor: "#F3F5F9" },
  benefitText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },
  banner: { height: 104, borderRadius: Radius.md, overflow: "hidden", justifyContent: "center", paddingHorizontal: 16 },
  bannerImg: { borderRadius: Radius.md },
  bannerText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22 },
  bannerGo: { position: "absolute", right: 14, bottom: 14, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  upgrade: { flexDirection: "row", alignItems: "center", gap: 12 },
  upgradeTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  upgradeSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 4 },
});
