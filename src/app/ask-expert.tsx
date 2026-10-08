import { AvailablePill, GoldBtn, OutlineBtn } from "@/components/expert-ui";
import { Avatar, CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findExpert, rupees, SLOTS } from "@/data/experts";
import { addAdviceRequest } from "@/lib/advice-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_MSG = 500;
type Advice = "free" | "paid";

const dayLabel = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function AskExpert() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const e = findExpert(name);
  const [advice, setAdvice] = useState<Advice>("free");
  const [dayIdx, setDayIdx] = useState(0);
  const [pickDay, setPickDay] = useState(false);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [msg, setMsg] = useState("");

  const [days] = useState(() => Array.from({ length: 7 }, (_, i) => new Date(Date.now() + i * 86400000)));

  if (!e) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.cardTitle}>Expert not found</Text>
        <OutlineBtn label="Go back" onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24 }} />
      </View>
    );
  }

  const m = e.member;
  const paidOk = e.paidPrice !== undefined;
  const dateText = dayIdx === 0 ? `Today, ${dayLabel(days[0])}` : dayLabel(days[dayIdx]);
  const confirm = () => {
    const id = addAdviceRequest({ expert: m.name, type: advice, price: advice === "paid" ? e.paidPrice : undefined, date: days[dayIdx], slot, message: msg.trim() });
    router.replace({ pathname: "/advice-sent", params: { id } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top, paddingHorizontal: 16 }}>
        <ScreenHeader title={`Ask ${m.name}`} />
        <Text style={styles.sub}>Choose how you want to get advice from this expert.</Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: 16 }]}>
        <View style={styles.who}>
          <Avatar name={m.name} photo={m.photo} size={56} />
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>{m.name}</Text>
            <Text style={styles.meta}>{m.role}</Text>
            <Text style={styles.meta}>{m.company}</Text>
          </View>
          <AvailablePill available={e.available} />
        </View>

        <Text style={styles.label}>Select Advice Type</Text>
        <View style={styles.row}>
          <Option selected={advice === "free"} onPress={() => setAdvice("free")} icon="chatbubble-ellipses-outline" title="Free Advice" sub="Get general guidance on your questions." />
          <Option
            selected={advice === "paid"}
            onPress={() => paidOk && setAdvice("paid")}
            disabled={!paidOk}
            icon="cash-outline"
            title="Paid Advice"
            price={paidOk ? `${rupees(e.paidPrice ?? 0)} / ${e.paidMinutes} minutes` : "Not offered"}
            sub="Detailed consultation and personalized advice."
          />
        </View>

        <Text style={styles.label}>Select Date & Time</Text>
        <Pressable style={styles.dateBox} onPress={() => setPickDay((v) => !v)} accessibilityRole="button">
          <Ionicons name="calendar-outline" size={18} color={Colors.navy} />
          <Text style={styles.dateText}>{dateText}</Text>
          <Ionicons name={pickDay ? "chevron-up" : "chevron-down"} size={18} color={Colors.textSecondary} />
        </Pressable>
        {pickDay ? (
          <View style={styles.dayList}>
            {days.map((d, i) => (
              <Pressable
                key={d.toDateString()}
                onPress={() => {
                  setDayIdx(i);
                  setPickDay(false);
                }}
                style={styles.dayRow}
              >
                <Text style={[styles.dateText, i === dayIdx && { color: Colors.goldDark, fontFamily: Fonts.bold }]}>{i === 0 ? `Today, ${dayLabel(d)}` : dayLabel(d)}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.slots}>
          {SLOTS.map((s) => (
            <Pressable key={s} onPress={() => setSlot(s)} style={[styles.slot, slot === s && styles.slotOn]} accessibilityRole="button" accessibilityState={{ selected: slot === s }}>
              <Text style={[styles.slotText, slot === s && { color: Colors.goldDark, fontFamily: Fonts.bold }]}>{s}</Text>
              {slot === s ? <View style={styles.dot} /> : null}
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>
          Add a Message <Text style={styles.optional}>(Optional)</Text>
        </Text>
        <View style={styles.msgBox}>
          <TextInput
            value={msg}
            onChangeText={setMsg}
            maxLength={MAX_MSG}
            multiline
            placeholder="Briefly describe what you would like to discuss..."
            placeholderTextColor={Colors.textMuted}
            style={styles.msgInput}
          />
          <Text style={styles.count}>
            {msg.length}/{MAX_MSG}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <GoldBtn label="Confirm & Send Request" icon="paper-plane-outline" onPress={confirm} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Option({ selected, onPress, disabled, icon, title, price, sub }: { selected: boolean; onPress: () => void; disabled?: boolean; icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; price?: string; sub: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, selected && styles.optionOn, disabled && { opacity: 0.5 }]} accessibilityRole="radio" accessibilityState={{ selected, disabled }}>
      <View style={styles.optionHead}>
        <View style={styles.optionIcon}>
          <Ionicons name={icon} size={18} color={Colors.goldDark} />
        </View>
        <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      {price ? <Text style={styles.price}>{price}</Text> : null}
      <Text style={styles.optionSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16 },
  sub: { color: "#2F6FDE", fontFamily: Fonts.regular, fontSize: 13, marginTop: 2, marginBottom: 8 },

  who: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#EEF1F5" },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },

  label: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginTop: 20, marginBottom: 10 },
  optional: { color: Colors.textSecondary, fontFamily: Fonts.regular },
  row: { flexDirection: "row", gap: 10 },

  option: { flex: 1, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  optionOn: { borderColor: Colors.gold, backgroundColor: "#FDF8EA" },
  optionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  optionIcon: { width: 34, height: 34, borderRadius: Radius.sm, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.gold },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.gold },
  optionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, marginTop: 10 },
  price: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12, marginTop: 2 },
  optionSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 4 },

  dateBox: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  dateText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  dayList: { marginTop: 6, borderRadius: Radius.md, backgroundColor: Colors.white, ...CARD_SHADOW },
  dayRow: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },

  slots: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  slot: { width: "31%", flexGrow: 1, height: 42, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  slotOn: { borderColor: Colors.gold, backgroundColor: "#FDF8EA" },
  slotText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold },

  msgBox: { minHeight: 96, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  msgInput: { minHeight: 56, padding: 0, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, textAlignVertical: "top" },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11 },

  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
