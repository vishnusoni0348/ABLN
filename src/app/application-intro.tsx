import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARDS = [
  { icon: require("../../assets/images/icon-connect.png"), title: "Connect", desc: "with relevant business leaders" },
  { icon: require("../../assets/images/icon-discover.png"), title: "Discover", desc: "business opportunities" },
  {
    icon: require("../../assets/images/icon-contribute.png"),
    title: "Contribute",
    desc: "share your expertise and help others",
  },
];

export default function ApplicationIntro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.62, 260);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/application-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />

      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={Colors.navy} />
        </Pressable>

        <View style={styles.header}>
          <Image
            source={require("../../assets/images/abln-logo.png")}
            style={{ width: logoWidth, height: logoWidth * (773 / 2033) }}
            resizeMode="contain"
          />
          <View style={styles.divider} />
          <Text style={styles.title}>Become a Part of</Text>
          <Text style={styles.titleGold}>ABLN</Text>
          <Text style={styles.subtitle}>
            Join a trusted business network built to help members discover the right people, opportunities and
            expertise.
          </Text>
        </View>

        <View style={styles.cards}>
          {CARDS.map((c) => (
            <View key={c.title} style={styles.card}>
              <Image source={c.icon} style={styles.icon} resizeMode="contain" />
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
              <View style={styles.cardLine} />
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <Pressable onPress={() => router.push("/application")} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Start Application</Text>
            <Ionicons name="arrow-forward" size={24} color={Colors.navy} style={styles.arrow} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  content: { flex: 1, paddingHorizontal: 20 },
  back: { paddingVertical: 8, alignSelf: "flex-start" },
  header: { alignItems: "center", marginTop: 8 },
  divider: { width: 50, height: 1.5, backgroundColor: Colors.gold, marginTop: 14, marginBottom: 22 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 34, lineHeight: 42, textAlign: "center" },
  titleGold: { color: Colors.gold, fontFamily: Fonts.bold, fontSize: 34, lineHeight: 42, textAlign: "center" },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 8,
  },
  cards: { flexDirection: "row", gap: 10, marginTop: 28 },
  card: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,252,246,0.96)",
    borderRadius: Radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: Colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  icon: { width: 76, height: 76, marginBottom: 8 },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  cardDesc: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
  },
  cardLine: { width: 22, height: 2, backgroundColor: Colors.gold, marginTop: 12 },
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
  pressed: { opacity: 0.85 },
});
