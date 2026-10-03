import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const FEATURES: { icon: IconName; bold: string; rest: string }[] = [
  { icon: "account-group-outline", bold: "Discover", rest: " the right people" },
  { icon: "bullseye-arrow", bold: "Explore", rest: " business opportunities" },
  { icon: "lightbulb-on-outline", bold: "Get", rest: " valuable advice" },
  { icon: "handshake-outline", bold: "Build", rest: " meaningful connections" },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.72, 300);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/onboarding-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(3,18,37,0.9)", "rgba(3,18,37,0.8)", "rgba(3,18,37,0.35)", "rgba(3,18,37,0.92)"]}
        locations={[0, 0.45, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
        <Image
          source={require("../../assets/images/abln-logo.png")}
          style={{ width: logoWidth, height: logoWidth * (773 / 2033) }}
          resizeMode="contain"
        />
        <View style={styles.divider} />

        <Text style={styles.heading}>A Trusted Business{"\n"}Network for</Text>
        <Text style={styles.headingGold}>Agarwal Entrepreneurs</Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.icon} style={styles.featureRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={f.icon} size={26} color={Colors.champagne} />
              </View>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>{f.bold}</Text>
                {f.rest}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <Pressable onPress={() => router.push("/signup")} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={24} color={Colors.navy} style={styles.arrow} />
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push("/login")}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Login</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/home")}
          hitSlop={8}
          style={({ pressed }) => [styles.guestBtn, pressed && styles.pressed]}
        >
          <Text style={styles.guestText}>Continue as Guest</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  bg: { position: "absolute", top: 0, left: 0 },
  content: { flex: 1, paddingHorizontal: 24 },
  divider: { width: 60, height: 1.5, backgroundColor: Colors.gold, marginTop: 14, marginBottom: 22 },
  heading: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 40 },
  headingGold: { color: Colors.champagne, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 40 },
  features: { marginTop: 28, gap: 16 },
  featureRow: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(6,27,51,0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(232,198,106,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  featureText: { color: Colors.white, fontFamily: Fonts.regular, fontSize: 18, flexShrink: 1 },
  featureBold: { fontFamily: Fonts.bold },
  spacer: { flex: 1 },
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
  primaryText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  arrow: { position: "absolute", right: 22 },
  secondaryBtn: {
    height: 58,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  secondaryText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  guestBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 14, marginTop: 4 },
  guestText: { color: Colors.champagne, fontFamily: Fonts.semiBold, fontSize: 16 },
  pressed: { opacity: 0.85 },
});
