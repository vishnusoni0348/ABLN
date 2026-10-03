import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApplicationSubmitted() {
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

        <View style={styles.tickOuter}>
          <View style={styles.tick}>
            <Ionicons name="checkmark" size={56} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Application Submitted</Text>
        <Text style={styles.subtitle}>Thank you for applying to ABLN.{"\n"}Your application is now under review.</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={styles.status}>Under Review</Text>
        </View>

        <Text style={styles.notify}>We will notify you once your application is reviewed.</Text>

        <View style={styles.spacer} />

        <Pressable
          onPress={() => router.push("/application-status")}
          style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
        >
          <Text style={styles.outlineText}>View Application Details</Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/home")} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Go to Home (Limited Access)</Text>
          </LinearGradient>
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
  tickOuter: {
    alignSelf: "center",
    marginTop: 40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#E3F5EB",
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
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
  statusCard: {
    marginTop: 28,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: Radius.md,
    backgroundColor: "#E9F0FA",
  },
  statusLabel: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15 },
  status: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24, marginTop: 4 },
  notify: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 22,
    paddingHorizontal: 20,
  },
  spacer: { flex: 1, minHeight: 32 },
  outlineBtn: {
    height: 58,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: "#1A6FE0",
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  outlineText: { color: "#1A6FE0", fontFamily: Fonts.bold, fontSize: 18 },
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
  pressed: { opacity: 0.85 },
});
