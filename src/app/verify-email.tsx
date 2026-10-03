import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = ["Check your email inbox", "Click on the verification link", "Come back to the app"];
const RESEND_SECONDS = 30;

export default function VerifyEmail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/light-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={Colors.navy} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={44} color="#1A6FE0" />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We have sent a verification link to</Text>
          <Text style={styles.email}>{email || "your email"}</Text>
        </View>

        <View style={styles.card}>
          {STEPS.map((s) => (
            <View key={s} style={styles.step}>
              <View style={styles.check}>
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => setSeconds(RESEND_SECONDS)}
          disabled={seconds > 0}
          hitSlop={8}
          style={styles.resend}
        >
          <Text style={styles.link}>
            {seconds > 0 ? `Resend Email (00:${String(seconds).padStart(2, "0")})` : "Resend Email"}
          </Text>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          onPress={() => router.replace("/application-intro")}
          style={({ pressed }) => [styles.verifiedBtn, pressed && styles.pressed]}
        >
          <Text style={styles.verifiedText}>I Have Verified My Email</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  back: { paddingVertical: 8, alignSelf: "flex-start" },
  header: { alignItems: "center", marginTop: 24 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E8F1FC",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, marginTop: 24 },
  subtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 16, marginTop: 12 },
  email: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginTop: 6 },
  card: {
    marginTop: 32,
    backgroundColor: Colors.softWhite,
    borderRadius: Radius.lg,
    padding: 20,
    gap: 18,
  },
  step: { flexDirection: "row", alignItems: "center", gap: 14 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 16, flexShrink: 1 },
  resend: { alignSelf: "center", marginTop: 28 },
  link: { color: "#1A6FE0", fontFamily: Fonts.semiBold, fontSize: 16 },
  spacer: { flex: 1, minHeight: 32 },
  verifiedBtn: {
    height: 58,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.navy,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  pressed: { opacity: 0.85 },
});
