import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Descriptions are placeholder copy until the final plan details are defined.
const PLANS: { key: string; icon: IconName; title: string; desc: string; tag?: string }[] = [
  { key: "founding", icon: "ribbon-outline", title: "Founding 100", desc: "For the first 100 founding members of ABLN.", tag: "Limited" },
  { key: "regular", icon: "person-outline", title: "Regular", desc: "Standard ABLN membership for individual business owners." },
  { key: "premium", icon: "diamond-outline", title: "Premium", desc: "Enhanced membership with extra visibility and benefits." },
  { key: "corporate", icon: "business-outline", title: "Corporate / Family Business", desc: "Membership for companies and family-run businesses." },
];

export default function MembershipPlans() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState("regular");

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/white-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={Colors.navy} />
          </Pressable>
          <Text style={styles.title}>Select Membership Plan</Text>
        </View>

        <Text style={styles.subtitle}>Choose the plan that fits your business.</Text>

        <View style={styles.list}>
          {PLANS.map((p) => {
            const on = selected === p.key;
            return (
              <Pressable key={p.key} onPress={() => setSelected(p.key)} style={[styles.card, on && styles.cardOn]}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <View style={styles.iconWrap}>
                  <Ionicons name={p.icon} size={26} color={Colors.navy} />
                </View>
                <View style={styles.flex}>
                  <View style={styles.titleRow}>
                    <Text style={styles.planTitle}>{p.title}</Text>
                    {p.tag ? (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{p.tag}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.planDesc}>{p.desc}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Pressable onPress={() => router.push({ pathname: "/payment-summary", params: { plan: selected } })} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient
            colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Continue</Text>
            <Ionicons name="arrow-forward" size={24} color={Colors.navy} style={styles.arrow} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  header: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  back: { position: "absolute", left: 0 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  list: { marginTop: 24, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  cardOn: { borderColor: Colors.champagne, backgroundColor: "#FDF4E0" },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: Colors.gold },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.gold },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FBF1DE",
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  planTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  planDesc: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, marginTop: 2 },
  tag: { backgroundColor: "#E3F5EB", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: Colors.success, fontFamily: Fonts.medium, fontSize: 12 },
  spacer: { flex: 1, minHeight: 32 },
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
