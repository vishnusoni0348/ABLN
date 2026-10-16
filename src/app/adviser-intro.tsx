import { GoldButton } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const BENEFITS: { icon: IconName; label: string }[] = [
  { icon: "people-outline", label: "Support fellow members" },
  { icon: "ribbon-outline", label: "Build your professional reputation" },
  { icon: "git-network-outline", label: "Expand your network" },
];

export default function AdviserIntro() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // The illustration is 2:3 and its figure ends around 55% of the height; the copy starts just below it.
  const heroHeight = width * 1.5;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image source={require("../../assets/images/adviser-hero.png")} style={{ position: "absolute", top: 0, width, height: heroHeight }} contentFit="cover" />
      <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back" style={[styles.back, { top: insets.top + 8 }]}>
        <Ionicons name="chevron-back" size={26} color={Colors.white} />
      </Pressable>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: width * 0.86 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Share Your Expertise{"\n"}Make an Impact</Text>
        <Text style={styles.sub}>Become an Adviser and guide fellow ABLN members with your knowledge and experience.</Text>
        <View style={styles.list}>
          {BENEFITS.map((b) => (
            <View key={b.label} style={styles.item}>
              <View style={styles.itemIcon}>
                <Ionicons name={b.icon} size={22} color={Colors.goldDark} />
              </View>
              <Text style={styles.itemText}>{b.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <GoldButton label="Get Started" onPress={() => router.push("/adviser-setup")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  back: { position: "absolute", left: 12, zIndex: 2, padding: 4 },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 30, lineHeight: 37, textAlign: "center" },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 12 },
  list: { gap: 14, marginTop: 24 },
  item: { flexDirection: "row", alignItems: "center", gap: 14 },
  itemIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#FBF1D6", alignItems: "center", justifyContent: "center" },
  itemText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: Colors.white },
});
