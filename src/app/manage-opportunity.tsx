import { Label } from "@/components/form-fields";
import { CARD_SHADOW } from "@/components/member-ui";
import { GOLD_GRADIENT, OppThumb, STATUS_PILL } from "@/components/opportunity-ui";
import { OutlineBtn, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { MineStatus } from "@/data/opportunities";
import { setMineStatus, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Choice = "pause" | "close";

const OPTIONS: Record<Choice, { title: string; text: string; color: string; bg: string; border: string; icon: "pause" | "stop"; status: MineStatus }> = {
  pause: {
    title: "Pause Opportunity",
    text: "Temporarily hide this opportunity from new applicants. You can resume it later anytime.",
    color: Colors.goldDark,
    bg: "#FEF6E3",
    border: Colors.gold,
    icon: "pause",
    status: "Paused",
  },
  close: {
    title: "Close Opportunity",
    text: "Permanently close this opportunity. It will no longer be visible to members and you cannot receive new applications.",
    color: Colors.error,
    bg: "#FDF1F1",
    border: Colors.error,
    icon: "stop",
    status: "Closed",
  },
};

const REASON_MAX = 300;

export default function ManageOpportunity() {
  const { id, action } = useLocalSearchParams<{ id?: string; action?: string }>();
  const { mine } = useOpportunities();
  const o = mine.find((m) => m.id === id);
  // A paused opportunity can only be closed from here; resuming has its own action.
  const choices: Choice[] = o?.status === "Paused" ? ["close"] : ["pause", "close"];
  const [picked, setPicked] = useState<Choice>(action === "close" ? "close" : "pause");
  const [reason, setReason] = useState("");
  const choice = choices.includes(picked) ? picked : choices[0];

  if (!o) {
    return (
      <SettingsScreen title="Close or Pause Opportunity" footer={<OutlineBtn label="My Opportunities" onPress={() => router.replace("/my-opportunities")} />}>
        <Text style={styles.missing}>Opportunity not found.</Text>
      </SettingsScreen>
    );
  }

  const pill = STATUS_PILL[o.status];

  const confirm = () => {
    // TODO: send the reason to the API once it is available.
    const from = o.status;
    setMineStatus(o.id, OPTIONS[choice].status);
    router.replace({ pathname: "/opportunity-status-updated", params: { id: o.id, action: choice, from } });
  };

  return (
    <SettingsScreen
      title="Close or Pause Opportunity"
      footer={
        <Pressable onPress={confirm} style={({ pressed }) => pressed && { opacity: 0.85 }} accessibilityRole="button">
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirm}>
            <Text style={styles.confirmText}>Confirm Action</Text>
          </LinearGradient>
        </Pressable>
      }
    >
      <View style={[styles.card, CARD_SHADOW]}>
        <OppThumb category={o.category} size={72} uri={o.cover} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {o.title}
          </Text>
          <View style={styles.cardFoot}>
            <Text style={styles.posted} numberOfLines={1}>{`Posted on ${o.postedLabel}`}</Text>
            <View style={[styles.pill, { backgroundColor: pill.bg }]}>
              <Text style={[styles.pillText, { color: pill.fg }]}>{pill.label}</Text>
            </View>
          </View>
        </View>
      </View>

      {choices.map((c) => {
        const opt = OPTIONS[c];
        const on = c === choice;
        return (
          <Pressable
            key={c}
            onPress={() => setPicked(c)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.option, on ? { backgroundColor: opt.bg, borderColor: opt.border } : null]}
          >
            <View style={[styles.optIcon, { backgroundColor: opt.color }]}>
              <Ionicons name={opt.icon} size={22} color={Colors.white} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.optTitle}>{opt.title}</Text>
              <Text style={styles.optText}>{opt.text}</Text>
            </View>
            <View style={[styles.radio, on && { borderColor: opt.color }]}>{on ? <View style={[styles.radioDot, { backgroundColor: opt.color }]} /> : null}</View>
          </Pressable>
        );
      })}

      <View style={styles.reasonBox}>
        <Label text="Reason" optional />
        <TextInput
          value={reason}
          onChangeText={(v) => setReason(v.slice(0, REASON_MAX))}
          multiline
          textAlignVertical="top"
          placeholder="Please tell us the reason for pausing or closing this opportunity..."
          placeholderTextColor={Colors.textMuted}
          style={styles.textarea}
        />
        <Text style={styles.count}>{`${reason.length}/${REASON_MAX}`}</Text>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  missing: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", paddingVertical: 40 },
  card: { flexDirection: "row", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 19 },
  cardFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 },
  posted: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  pill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontFamily: Fonts.bold, fontSize: 11 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  optIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  optTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  optText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  reasonBox: { marginTop: 4 },
  textarea: { minHeight: 110, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, padding: 12, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11, marginTop: 4 },
  confirm: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  confirmText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
