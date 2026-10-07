import { OppHero, TopBar } from "@/components/interest-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EMPTY_FILTERS } from "@/data/opportunities";
import { findOpp } from "@/lib/opportunity-lookup";
import { addInterest, OFFERS, setOpportunities, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CounterInput({ value, onChangeText, placeholder, max, error }: { value: string; onChangeText: (t: string) => void; placeholder: string; max: number; error?: boolean }) {
  return (
    <View style={[styles.area, error && styles.areaError]}>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textMuted} style={styles.areaInput} multiline maxLength={max} textAlignVertical="top" />
      <Text style={styles.counter}>{`${value.length}/${max}`}</Text>
    </View>
  );
}

export default function ExpressInterest() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mine } = useOpportunities();
  const o = findOpp(id, mine);

  const [why, setWhy] = useState("");
  const [offers, setOffers] = useState<string[]>([]);
  const [extra, setExtra] = useState("");
  const [tried, setTried] = useState(false);

  if (!o) {
    return (
      <View style={styles.container}>
        <TopBar title="Express Interest" />
        <Text style={styles.none}>This opportunity is no longer available.</Text>
      </View>
    );
  }

  if (o.closed) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <TopBar title="Opportunity Closed" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <OppHero o={o} />
          <View style={styles.closedArt}>
            <View style={styles.closedDoc}>
              <View style={[styles.docLine, { width: 36 }]} />
              <View style={[styles.docLine, { width: 46 }]} />
              <View style={[styles.docLine, { width: 30 }]} />
            </View>
            <View style={styles.cross}>
              <Ionicons name="close" size={26} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.centerTitle}>This Opportunity Has Closed</Text>
          <Text style={styles.centerSub}>The owner is no longer accepting new expressions of interest.</Text>
          <View style={styles.closedBox}>
            <View style={styles.closedRow}>
              <Ionicons name="calendar-outline" size={22} color={Colors.goldDark} />
              <View>
                <Text style={styles.closedLabel}>Closed On</Text>
                <Text style={styles.closedValue}>{o.deadlineLabel}</Text>
              </View>
            </View>
            <View style={styles.closedRow}>
              <Ionicons name="people-outline" size={22} color={Colors.goldDark} />
              <View>
                <Text style={styles.closedLabel}>Total Interested Members</Text>
                <Text style={styles.closedValue}>{`${o.interested} Members`}</Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => {
              setOpportunities({ query: "", filters: { ...EMPTY_FILTERS, category: o.category } });
              router.replace("/opportunity-results");
            }}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
              <Text style={styles.primaryText}>Browse Similar Opportunities</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const errors = tried ? { why: !why.trim(), offers: offers.length === 0 } : { why: false, offers: false };
  const toggle = (v: string) => setOffers((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const submit = () => {
    setTried(true);
    if (!why.trim() || offers.length === 0) return;
    const interestId = addInterest({ oppId: o.id, why: why.trim(), offers, extra: extra.trim() });
    router.replace({ pathname: "/interest-submitted", params: { id: interestId } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "android" ? "padding" : undefined}>
      <StatusBar style="dark" />
      <TopBar title="Express Interest" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <OppHero o={o} />

        <View style={styles.group}>
          <Text style={styles.label}>
            Why are you interested?<Text style={styles.req}> *</Text>
          </Text>
          <CounterInput value={why} onChangeText={setWhy} placeholder="Tell the owner why this opportunity fits you." max={300} error={errors.why} />
          {errors.why ? <Text style={styles.error}>Please tell the owner why you are interested</Text> : null}
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>
            What can you offer?<Text style={styles.req}> *</Text>
          </Text>
          <View style={styles.grid}>
            {OFFERS.map((v) => {
              const on = offers.includes(v);
              return (
                <Pressable key={v} onPress={() => toggle(v)} style={[styles.option, on && styles.optionOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                  <View style={[styles.circle, on && styles.circleOn]}>{on ? <Ionicons name="checkmark" size={12} color={Colors.goldDark} /> : null}</View>
                  <Text style={[styles.optionText, on && styles.optionTextOn]}>{v}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.offers ? <Text style={styles.error}>Select at least one</Text> : null}
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>
            Additional Message<Text style={styles.opt}> (Optional)</Text>
          </Text>
          <CounterInput value={extra} onChangeText={setExtra} placeholder="Share more details about how you can add value to this opportunity..." max={500} />
        </View>

        <Pressable onPress={submit} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
            <Ionicons name="paper-plane-outline" size={18} color={Colors.white} />
            <Text style={styles.primaryText}>Submit Interest</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.footnote}>{`Interest closes on ${o.deadlineLabel}`}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 40 },
  scroll: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },

  group: { gap: 8 },
  label: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  req: { color: Colors.error },
  opt: { color: Colors.textSecondary, fontFamily: Fonts.regular },
  error: { color: Colors.error, fontFamily: Fonts.regular, fontSize: 11 },
  area: { minHeight: 96, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  areaError: { borderColor: Colors.error },
  areaInput: { minHeight: 56, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, padding: 0 },
  counter: { alignSelf: "flex-end", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  option: { width: "48%", flexDirection: "row", alignItems: "center", gap: 10, height: 44, paddingHorizontal: 12, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#F6F7FA" },
  optionOn: { backgroundColor: Colors.goldDark, borderColor: Colors.goldDark },
  circle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  circleOn: { borderColor: Colors.white },
  optionText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  optionTextOn: { color: Colors.white, fontFamily: Fonts.bold },

  primary: { height: 48, borderRadius: Radius.md, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  primaryText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  footnote: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, textAlign: "center" },

  closedArt: { alignSelf: "center", width: 130, height: 130, borderRadius: 65, backgroundColor: "#FBE6E6", alignItems: "center", justifyContent: "center", marginTop: 8 },
  closedDoc: { width: 60, height: 76, borderRadius: 8, backgroundColor: Colors.white, padding: 10, gap: 7, transform: [{ translateX: -6 }] },
  docLine: { height: 5, borderRadius: 3, backgroundColor: "#F3C9C9" },
  cross: { position: "absolute", right: 22, bottom: 24, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.error, alignItems: "center", justifyContent: "center" },
  centerTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, textAlign: "center" },
  centerSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, textAlign: "center", paddingHorizontal: 24, marginTop: -8 },
  closedBox: { gap: 14, padding: 14, borderRadius: Radius.md, backgroundColor: "#FEF6E3" },
  closedRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  closedLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  closedValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
});
