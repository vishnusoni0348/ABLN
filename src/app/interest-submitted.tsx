import { InfoRow, TopBar } from "@/components/interest-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InterestSubmitted() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { interests } = useOpportunities();
  const interest = interests.find((i) => i.id === id);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TopBar title="Interest Submitted" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.art}>
          <Ionicons name="paper-plane" size={74} color={Colors.gold} style={styles.plane} />
          <View style={styles.check}>
            <Ionicons name="checkmark" size={26} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.title}>Expression of Interest Sent!</Text>
        <Text style={styles.sub}>Your interest has been submitted to the opportunity owner.</Text>

        <View style={styles.box}>
          <InfoRow icon="notifications-outline">The owner will review your request and get back to you.</InfoRow>
          <InfoRow icon="mail-outline">You will be notified about any updates.</InfoRow>
          <InfoRow icon="people-outline">You can track the status in My Interests section.</InfoRow>
        </View>

        <Pressable onPress={() => router.replace({ pathname: "/opportunity-details", params: { id: interest?.oppId } })} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
            <Text style={styles.primaryText}>View Opportunity</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => router.replace("/my-interests")} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Go to My Interests</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  art: { alignSelf: "center", width: 190, height: 190, borderRadius: 95, backgroundColor: "#FEF3DA", alignItems: "center", justifyContent: "center", marginTop: 16 },
  plane: { transform: [{ rotate: "-20deg" }] },
  check: { position: "absolute", right: 36, bottom: 40, width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.success, borderWidth: 3, borderColor: Colors.white, alignItems: "center", justifyContent: "center" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, textAlign: "center", marginTop: 8 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingHorizontal: 24, marginTop: -6 },
  box: { gap: 14, padding: 16, borderRadius: Radius.md, backgroundColor: "#FEF6E3", marginTop: 8 },
  primary: { height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  primaryText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  secondary: { height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  secondaryText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
});
