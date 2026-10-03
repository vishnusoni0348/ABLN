import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
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

export default function Signup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const logoWidth = Math.min(width * 0.62, 260);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/light-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
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
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Start your journey with the Agarwal{"\n"}Business Leaders Network.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputRow}>
              <Pressable style={styles.code}>
                <Text style={styles.codeText}>+91</Text>
                <Ionicons name="chevron-down" size={18} color={Colors.navy} />
              </Pressable>
              <View style={styles.inputDivider} />
              <TextInput
                value={mobile}
                onChangeText={setMobile}
                placeholder="Enter mobile number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={10}
                style={styles.input}
              />
            </View>

            <Text style={[styles.label, styles.labelGap]}>Email Address</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <Pressable onPress={() => router.push({ pathname: "/otp", params: { mobile, email } })} style={({ pressed }) => pressed && styles.pressed}>
              <LinearGradient
                colors={[Colors.champagne, Colors.gold, Colors.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryText}>Continue</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.replace("/login")} hitSlop={8}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  form: { paddingHorizontal: 24, marginTop: 32 },
  label: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 17, marginBottom: 10 },
  labelGap: { marginTop: 22 },
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
    marginTop: 28,
    shadowColor: Colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 20 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
  loginText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15 },
  loginLink: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 15 },
  pressed: { opacity: 0.85 },
});
