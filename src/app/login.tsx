import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type Mode = "mobile" | "email";

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: "account-group-outline", title: "Connect", desc: "with verified\nbusiness leaders" },
  { icon: "bullseye-arrow", title: "Explore", desc: "new business\nopportunities" },
  { icon: "chart-box-outline", title: "Grow", desc: "together in a trusted\ncommunity" },
];

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<Mode>("mobile");
  const [value, setValue] = useState("");
  const logoWidth = Math.min(width * 0.62, 260);

  const valid = mode === "mobile" ? value.length === 10 : /^\S+@\S+\.\S+$/.test(value.trim());

  const goNext = () => {
    if (!valid) return;
    router.push({
      pathname: "/otp",
      params: mode === "mobile" ? { mobile: value, flow: "login" } : { email: value.trim(), flow: "login" },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/login-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your ABLN account and{"\n"}continue your business journey.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.tabs}>
              <TabButton
                active={mode === "mobile"}
                label="Mobile Number"
                icon="phone-portrait-outline"
                onPress={() => {
                  setMode("mobile");
                  setValue("");
                }}
              />
              <TabButton
                active={mode === "email"}
                label="Email"
                icon="mail-outline"
                onPress={() => {
                  setMode("email");
                  setValue("");
                }}
              />
            </View>

            <Text style={styles.label}>{mode === "mobile" ? "Mobile Number" : "Email Address"}</Text>
            <View style={styles.inputRow}>
              {mode === "mobile" && (
                <>
                  <Pressable style={styles.code}>
                    <Text style={styles.codeText}>+91</Text>
                    <Ionicons name="chevron-down" size={18} color={Colors.navy} />
                  </Pressable>
                  <View style={styles.inputDivider} />
                </>
              )}
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={mode === "mobile" ? "Enter your mobile number" : "Enter your email address"}
                placeholderTextColor={Colors.textMuted}
                keyboardType={mode === "mobile" ? "number-pad" : "email-address"}
                autoCapitalize="none"
                maxLength={mode === "mobile" ? 10 : undefined}
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={goNext}
              disabled={!valid}
              style={({ pressed }) => [!valid && styles.btnDisabled, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={[Colors.champagne, Colors.gold, Colors.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryText}>Continue</Text>
                <Ionicons name="arrow-forward" size={24} color={Colors.white} style={styles.arrow} />
              </LinearGradient>
            </Pressable>

          </View>

          <View style={styles.spacer} />

          <LinearGradient
            colors={["rgba(6,27,51,0)", Colors.royalNavy, Colors.deepNavy]}
            locations={[0, 0.5, 1]}
            style={[styles.features, { paddingBottom: insets.bottom + 24 }]}
          >
            {FEATURES.map((f, i) => (
              <View key={f.title} style={styles.featureWrap}>
                {i > 0 && <View style={styles.featureSep} />}
                <View style={styles.feature}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name={f.icon} size={28} color={Colors.champagne} />
                  </View>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function TabButton({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Ionicons name={icon} size={22} color={Colors.navy} />
      <Text style={styles.tabText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0 },
  scroll: { flexGrow: 1 },
  back: { paddingHorizontal: 20, paddingVertical: 8, alignSelf: "flex-start" },
  header: { alignItems: "center", marginTop: 8, paddingHorizontal: 24 },
  divider: { width: 50, height: 1.5, backgroundColor: Colors.gold, marginTop: 14, marginBottom: 18 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 30 },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 8,
  },
  form: { paddingHorizontal: 24, marginTop: 26 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: { backgroundColor: "#F8EBC8", borderBottomColor: Colors.gold },
  tabText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 16 },
  label: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 17, marginTop: 22, marginBottom: 10 },
  inputRow: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  code: { flexDirection: "row", alignItems: "center", gap: 10 },
  codeText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 18 },
  inputDivider: { width: 1, height: 28, backgroundColor: Colors.border, marginHorizontal: 16 },
  input: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 16, height: "100%" },
  primaryBtn: {
    height: 58,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: Colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 20 },
  arrow: { position: "absolute", right: 22 },
  spacer: { flex: 1, minHeight: 24 },
  features: { flexDirection: "row", paddingHorizontal: 12, paddingTop: 72 },
  featureWrap: { flex: 1, flexDirection: "row" },
  featureSep: { width: 1, height: 70, backgroundColor: "rgba(232,198,106,0.5)", alignSelf: "center" },
  feature: { flex: 1, alignItems: "center", paddingHorizontal: 4 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(6,27,51,0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(232,198,106,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureTitle: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 17 },
  featureDesc: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 2,
  },
  pressed: { opacity: 0.85 },
  btnDisabled: { opacity: 0.55 },
});
