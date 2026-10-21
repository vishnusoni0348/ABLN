import { Heading, SecurityScreen } from "@/components/security-ui";
import { GoldButton } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { updateProfile } from "@/lib/profile-store";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function SecurityOtp() {
  const { type, value } = useLocalSearchParams<{ type: "mobile" | "email" | "password" | "reset"; value?: string }>();
  const [otp, setOtp] = useState("");
  const [focused, setFocused] = useState(true);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const complete = otp.length === OTP_LENGTH;
  const activeIndex = Math.min(otp.length, OTP_LENGTH - 1);
  const target = type === "email" ? "email address" : type === "password" ? "registered mobile number" : type === "reset" ? "registered mobile number or email" : "mobile number";

  const resend = () => {
    if (seconds > 0) return;
    setOtp("");
    setSeconds(RESEND_SECONDS);
  };

  // Demo verification: any 6-digit code is accepted until the OTP API is wired up.
  const verify = () => {
    if (!complete) return;
    if (type === "password" || type === "reset") {
      router.replace({ pathname: "/security-password", params: { mode: type === "reset" ? "reset" : "set", verified: "1" } });
      return;
    }
    if (!value) return;
    updateProfile(type === "email" ? { email: value } : { mobile: value });
    router.replace({ pathname: "/security-success", params: { type } });
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <SecurityScreen icon="chatbubble-ellipses" footer={<GoldButton label="Continue" onPress={verify} disabled={!complete} />}>
      <Heading title="Verify Identity" sub={`Enter the 6-digit code sent to your ${target}.`} />
      <Pressable
        style={styles.boxes}
        onPress={() => {
          inputRef.current?.blur();
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.box, focused && i === activeIndex && !complete && styles.boxActive]}>
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
          style={styles.hidden}
        />
      </Pressable>

      <View style={styles.resend}>
        <Text style={styles.hint}>Didn&apos;t receive the code?</Text>
        <Pressable onPress={resend} disabled={seconds > 0} hitSlop={8}>
          <Text style={[styles.resendText, seconds > 0 && styles.resendOff]}>{seconds > 0 ? `Resend in ${mm}:${ss}` : "Resend code"}</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.change}>
        <Text style={styles.changeText}>{type === "mobile" || type === "email" ? `Change ${target}` : "Go back"}</Text>
      </Pressable>
    </SecurityScreen>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: "row", justifyContent: "space-between", marginTop: 28 },
  box: { width: 46, height: 54, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  boxActive: { borderColor: Colors.gold, borderWidth: 2 },
  digit: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  hidden: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0 },
  resend: { alignItems: "center", gap: 4, backgroundColor: "#F1F5FC", borderRadius: Radius.md, paddingVertical: 14, marginTop: 24 },
  hint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  resendText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  resendOff: { color: Colors.textSecondary },
  change: { alignSelf: "center", marginTop: 20 },
  changeText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
});
