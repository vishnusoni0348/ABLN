import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DETAILS = [
  { label: "Membership Plan", value: "Regular Membership" },
  { label: "Approval Date", value: "12 Dec 2024" },
];

export default function MembershipApproved() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.62, 260);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/white-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/images/abln-logo.png")}
            style={{ width: logoWidth, height: logoWidth * (773 / 2033) }}
            resizeMode="contain"
          />
          <View style={styles.divider} />
        </View>

        <View style={styles.badgeOuter}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badge}
          >
            <Ionicons name="checkmark" size={60} color={Colors.white} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>You’re Approved!</Text>
        <Text style={styles.subtitle}>
          Your ABLN membership application{"\n"}has been approved.
        </Text>

        <View style={styles.card}>
          {DETAILS.map((d, i) => (
            <View key={d.label} style={[styles.cardRow, i > 0 && styles.cardRowBorder]}>
              <Text style={styles.cardLabel}>{d.label}</Text>
              <Text style={styles.cardValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <Pressable
          onPress={() => router.push("/membership-plans")}
          style={({ pressed }) => [styles.btnWrap, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Complete Membership Payment</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}>
          <Text style={styles.outlineText}>View Plan Details</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  logoWrap: { alignItems: "center" },
  divider: { width: 50, height: 1.5, backgroundColor: Colors.gold, marginTop: 10 },
  badgeOuter: {
    alignSelf: "center",
    marginTop: 40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FBF1D6",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.goldLight,
    shadowColor: Colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 28, textAlign: "center", marginTop: 28 },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 10,
  },
  card: {
    marginTop: 28,
    paddingHorizontal: 18,
    borderRadius: Radius.md,
    backgroundColor: "#E9F0FA",
  },
  cardRow: { paddingVertical: 14 },
  cardRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  cardLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14 },
  cardValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginTop: 2 },
  spacer: { flex: 1, minHeight: 32 },
  btnWrap: { marginBottom: 14 },
  primaryBtn: {
    height: 58,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 19 },
  outlineBtn: {
    height: 58,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: "#1A6FE0",
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineText: { color: "#1A6FE0", fontFamily: Fonts.bold, fontSize: 18 },
  pressed: { opacity: 0.85 },
});
