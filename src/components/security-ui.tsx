import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOFT_BLUE = "#F1F5FC";

export const maskMobile = (mobile: string) => {
  const digits = mobile.replace(/\D/g, "");
  return `${"•".repeat(Math.max(digits.length - 4, 0))} ${digits.slice(-4)}`.trim();
};

export const maskEmail = (email: string) => {
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 1)}${"•".repeat(Math.max(user.length - 1, 0))}@${domain}`;
};

/** Navy branded hero with a gold badge icon, overlapped by a rounded white body. */
export function SecurityScreen({
  icon,
  children,
  footer,
}: {
  icon: IconName;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboard(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboard(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.deepNavy, Colors.navy, Colors.royalNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.bar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={Colors.white} />
          </Pressable>
          <Text style={styles.barTitle}>Security</Text>
          <View style={{ width: 26 }} />
        </View>
        {keyboard ? null : (
          <View style={styles.brandRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>ABLN</Text>
              <Text style={styles.brandSub}>
                Agarwal Business{"\n"}Leaders Network
              </Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name={icon} size={46} color={Colors.gold} />
            </View>
          </View>
        )}
        <LinearGradient
          colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.wave}
        />
      </LinearGradient>
      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: footer ? 24 : insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? (
          <View
            style={[
              styles.footer,
              { paddingBottom: (keyboard ? 0 : insets.bottom) + 12 },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

export function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.h}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

/** Read-only card showing the value that is about to be replaced. */
export function CurrentCard({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.current}>
      <View style={styles.currentIcon}>
        <Ionicons name={icon} size={22} color={Colors.goldDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.currentLabel}>{label}</Text>
        <Text style={styles.currentValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function NoteCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.note}>
      <Ionicons name="information-circle" size={20} color="#2F6FED" />
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.box, !!error && { borderColor: Colors.error }]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={Colors.textSecondary}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Pressable
          onPress={() => setShow((s) => !s)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={show ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={Colors.textSecondary}
          />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  {
    label: "One uppercase and one lowercase letter",
    test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p),
  },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character (e.g. ! @ # $ % ^ & *)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export const passwordScore = (p: string) =>
  PASSWORD_RULES.filter((r) => r.test(p)).length;

const STRENGTH = [
  { label: "", color: "#E3E8EF" },
  { label: "Weak", color: Colors.error },
  { label: "Fair", color: "#F08A24" },
  { label: "Good", color: Colors.gold },
  { label: "Strong", color: Colors.success },
];

/** Four-segment strength meter plus the live rule checklist. */
export function StrengthMeter({ password }: { password: string }) {
  const score = passwordScore(password);
  const level = STRENGTH[password ? score : 0];
  return (
    <View style={{ marginTop: 12 }}>
      <View style={styles.meterRow}>
        <View style={styles.meter}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.seg,
                {
                  backgroundColor:
                    i <= score && password ? level.color : "#E3E8EF",
                },
              ]}
            />
          ))}
        </View>
        {password ? (
          <Text style={[styles.meterLabel, { color: level.color }]}>
            {level.label}
          </Text>
        ) : null}
      </View>
      <View style={styles.rules}>
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(password);
          return (
            <View key={r.label} style={styles.rule}>
              <Ionicons
                name={ok ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={ok ? Colors.success : Colors.textMuted}
              />
              <Text style={styles.ruleText}>{r.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  hero: { paddingHorizontal: 20, paddingBottom: 34, overflow: "hidden" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barTitle: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 17 },
  brandRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  brand: {
    color: Colors.gold,
    fontFamily: Fonts.bold,
    fontSize: 32,
    letterSpacing: 1,
  },
  brandSub: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
    marginTop: 2,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(212,167,44,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  wave: {
    position: "absolute",
    left: -20,
    right: -20,
    bottom: -8,
    height: 22,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    opacity: 0.9,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -22,
    overflow: "hidden",
  },
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    backgroundColor: Colors.white,
  },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  sub: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  current: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: SOFT_BLUE,
    borderRadius: Radius.md,
    padding: 14,
    marginTop: 20,
  },
  currentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF6E6",
    alignItems: "center",
    justifyContent: "center",
  },
  currentLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  currentValue: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: 16,
    marginTop: 2,
  },
  note: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: SOFT_BLUE,
    borderRadius: Radius.md,
    padding: 14,
    marginTop: 20,
  },
  noteText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  fieldLabel: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: 14,
    marginBottom: 8,
  },
  box: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    color: Colors.navy,
    fontFamily: Fonts.regular,
    fontSize: 15,
    paddingVertical: 0,
  },
  error: {
    color: Colors.error,
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 4,
  },
  meterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  meter: { flex: 1, flexDirection: "row", gap: 6 },
  seg: { flex: 1, height: 5, borderRadius: 3 },
  meterLabel: { fontFamily: Fonts.bold, fontSize: 12 },
  rules: {
    backgroundColor: SOFT_BLUE,
    borderRadius: Radius.md,
    padding: 12,
    gap: 7,
    marginTop: 10,
  },
  rule: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
});
