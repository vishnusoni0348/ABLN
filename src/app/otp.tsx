import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function Otp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { mobile, email, flow } = useLocalSearchParams<{ mobile?: string; email?: string; flow?: string }>();
  const isLogin = flow === "login";
  const viaEmail = isLogin && !mobile && !!email;
  const [otp, setOtp] = useState("");
  const [focused, setFocused] = useState(true);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const resend = () => {
    if (seconds > 0) return;
    setOtp("");
    setSeconds(RESEND_SECONDS);
  };

  const complete = otp.length === OTP_LENGTH;
  const activeIndex = Math.min(otp.length, OTP_LENGTH - 1);

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
            <Text style={styles.title}>{viaEmail ? "Verify Your Email" : "Verify Your Mobile Number"}</Text>
            <Text style={styles.subtitle}>We have sent a 6-digit OTP to</Text>
            <Text style={styles.number}>{viaEmail ? email : `+91 ${mobile ?? ""}`}</Text>
          </View>

          <Pressable style={styles.boxes} onPress={() => {
            inputRef.current?.blur();
            setTimeout(() => inputRef.current?.focus(), 50);
          }}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[styles.box, focused && i === activeIndex && !complete && styles.boxActive]}
              >
                <Text style={styles.digit}>{otp[i] ?? ""}</Text>
              </View>
            ))}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, OTP_LENGTH))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={OTP_LENGTH}
              autoFocus
              caretHidden
              style={styles.hiddenInput}
            />
          </Pressable>

          <View style={styles.links}>
            <Text style={styles.hint}>Didn&apos;t receive the code?</Text>
            <Pressable onPress={resend} disabled={seconds > 0} hitSlop={8}>
              <Text style={[styles.link, seconds > 0 && styles.linkDisabled]}>
                {seconds > 0 ? `Resend OTP (00:${String(seconds).padStart(2, "0")})` : "Resend OTP"}
              </Text>
            </Pressable>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.link}>{viaEmail ? "Change Email" : "Change Mobile Number"}</Text>
            </Pressable>
          </View>

          <View style={styles.spacer} />

          <Pressable
            disabled={!complete}
            onPress={() =>
              isLogin ? router.replace("/home") : router.push({ pathname: "/verify-email", params: { email } })
            }
            style={({ pressed }) => [styles.btnWrap, !complete && styles.btnDisabled, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={[Colors.champagne, Colors.gold, Colors.goldDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryText}>Verify</Text>
              <Ionicons name="arrow-forward" size={24} color={Colors.white} style={styles.arrow} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  back: { paddingVertical: 8, alignSelf: "flex-start" },
  header: { alignItems: "center", marginTop: 40 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, textAlign: "center" },
  subtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 16, marginTop: 14 },
  number: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginTop: 6 },
  boxes: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  box: {
    width: 48,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: { borderColor: Colors.gold, borderWidth: 2 },
  digit: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  hiddenInput: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0 },
  links: { alignItems: "center", marginTop: 32, gap: 14 },
  hint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15 },
  link: { color: "#1A6FE0", fontFamily: Fonts.semiBold, fontSize: 16 },
  linkDisabled: { opacity: 0.8 },
  spacer: { flex: 1, minHeight: 32 },
  btnWrap: {},
  btnDisabled: { opacity: 0.55 },
  primaryBtn: {
    height: 58,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 20 },
  arrow: { position: "absolute", right: 22 },
  pressed: { opacity: 0.85 },
});
