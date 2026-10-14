import { Avatar } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import {
  addDays,
  availableSlots,
  BOOKING_WINDOW_DAYS,
  dayName,
  formatClock,
  formatLong,
  MEETING_TYPES,
  type MeetingType,
  monthName,
  PERIODS,
  sameDay,
  scheduleMeeting,
  slotPeriod,
  startOfDay,
} from "@/lib/meeting-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLUE = "#2F6FDE";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function GoldButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [disabled && styles.disabled, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{ disabled }}>
      <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
        <Text style={styles.ctaText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function Sheet({ visible, onClose, children, footer }: { visible: boolean; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        {children}
        {footer}
      </View>
    </Modal>
  );
}

function dayLabel(d: Date, today: Date) {
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, addDays(today, 1))) return "Tomorrow";
  return dayName(d).slice(0, 3);
}

export default function ScheduleMeeting() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const member = findMember(name);
  const today = useMemo(() => startOfDay(new Date()), []);
  const lastDay = useMemo(() => addDays(today, BOOKING_WINDOW_DAYS), [today]);

  const [type, setType] = useState<MeetingType>("virtual");
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"form" | "date" | "time">("form");
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  if (!member) {
    return (
      <View style={[styles.container, styles.missing, { paddingTop: insets.top }]}>
        <Text style={styles.cardName}>Member not found</Text>
      </View>
    );
  }

  const hasSlots = (d: Date) => d >= today && d <= lastDay && availableSlots(member.name, d).length > 0;
  const quickDays: Date[] = [];
  for (let i = 0; i <= BOOKING_WINDOW_DAYS && quickDays.length < 5; i++) {
    const d = addDays(today, i);
    if (hasSlots(d)) quickDays.push(d);
  }

  const pickDay = (d: Date) => {
    setDay(d);
    setSlot(null);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const firstOfMonth = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstOfMonth }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  const canPrev = new Date(month.getFullYear(), month.getMonth() - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay;
  const shiftMonth = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  const slots = day ? availableSlots(member.name, day) : [];
  const confirm = () => {
    if (!slot) return;
    const m = scheduleMeeting({ name: member.name, type, start: slot, topic: topic.trim(), note: note.trim() });
    setStep("form");
    router.replace({ pathname: "/meeting-scheduled", params: { id: m.id } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Schedule a Meeting</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.memberCard}>
            <Avatar name={member.name} photo={member.photo} size={56} />
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName} numberOfLines={1}>{member.name}</Text>
                {member.verified ? <Ionicons name="checkmark-circle" size={16} color={BLUE} /> : null}
              </View>
              <Text style={styles.cardSub} numberOfLines={1}>{member.role}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{member.company}</Text>
            </View>
          </View>

          <Text style={styles.h2}>Meeting Type</Text>
          {MEETING_TYPES.map((t) => {
            const on = t.key === type;
            return (
              <Pressable key={t.key} onPress={() => setType(t.key)} style={[styles.typeRow, on && styles.typeRowOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                <Ionicons name={t.icon} size={22} color={BLUE} />
                <View style={styles.flex}>
                  <Text style={styles.typeTitle}>{t.title}</Text>
                  <Text style={styles.typeSub}>{t.sub}</Text>
                </View>
                {on ? <Ionicons name="checkmark-circle" size={22} color={Colors.gold} /> : <View style={styles.radio} />}
              </Pressable>
            );
          })}

          <Text style={styles.h2}>Meeting Details</Text>
          <Text style={styles.label}>Topic (Optional)</Text>
          <TextInput value={topic} onChangeText={setTopic} maxLength={80} placeholder="E.g. Discuss partnership opportunities" placeholderTextColor={Colors.textMuted} style={styles.input} />
          <Text style={[styles.label, { marginTop: 12 }]}>Additional Note (Optional)</Text>
          <TextInput value={note} onChangeText={setNote} maxLength={300} multiline placeholder="Add any specific details or agenda for this meeting..." placeholderTextColor={Colors.textMuted} style={[styles.input, styles.noteInput]} />
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <GoldButton label="Continue" onPress={() => setStep("date")} />
        </View>
      </KeyboardAvoidingView>

      <Sheet
        visible={step === "date"}
        onClose={() => setStep("form")}
        footer={<View style={{ marginTop: 14 }}><GoldButton label="Next" disabled={!day} onPress={() => setStep("time")} /></View>}
      >
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Select Date</Text>
          <Pressable onPress={() => setStep("form")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={Colors.navy} />
          </Pressable>
        </View>
        <View style={styles.monthRow}>
          <Pressable onPress={() => shiftMonth(-1)} disabled={!canPrev} hitSlop={10} accessibilityLabel="Previous month" style={!canPrev && styles.disabled}>
            <Ionicons name="chevron-back" size={20} color={Colors.navy} />
          </Pressable>
          <Text style={styles.monthText}>{monthName(month.getMonth())} {month.getFullYear()}</Text>
          <Pressable onPress={() => shiftMonth(1)} disabled={!canNext} hitSlop={10} accessibilityLabel="Next month" style={!canNext && styles.disabled}>
            <Ionicons name="chevron-forward" size={20} color={Colors.navy} />
          </Pressable>
        </View>
        <View style={styles.grid}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={[styles.cell, styles.weekday]}>{w}</Text>
          ))}
          {cells.map((d, i) => {
            if (!d) return <View key={`b${i}`} style={styles.cell} />;
            const ok = hasSlots(d);
            const on = !!day && sameDay(d, day);
            return (
              <Pressable key={d.getDate()} style={styles.cell} disabled={!ok} onPress={() => pickDay(d)} accessibilityRole="button" accessibilityLabel={`${formatLong(d)}${ok ? "" : ", unavailable"}`} accessibilityState={{ selected: on, disabled: !ok }}>
                <View style={[styles.dayBubble, on && styles.dayOn]}>
                  <Text style={[styles.dayText, !ok && styles.dayOff, on && styles.dayTextOn]}>{d.getDate()}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {quickDays.map((d) => {
            const on = !!day && sameDay(d, day);
            return (
              <Pressable key={d.toDateString()} onPress={() => pickDay(d)} style={[styles.quick, on && styles.quickOn]} accessibilityRole="button">
                <Text style={styles.quickTop}>{dayLabel(d, today)}</Text>
                <Text style={styles.quickBottom}>{d.getDate()} {monthName(d.getMonth()).slice(0, 3)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>

      <Sheet
        visible={step === "time"}
        onClose={() => setStep("form")}
        footer={<View style={{ marginTop: 14 }}><GoldButton label="Confirm Meeting" disabled={!slot} onPress={confirm} /></View>}
      >
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Select Time</Text>
          <Pressable onPress={() => setStep("form")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={Colors.navy} />
          </Pressable>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{day ? formatLong(day) : ""}</Text>
          <Pressable onPress={() => setStep("date")} style={styles.changeBtn} accessibilityRole="button">
            <Ionicons name="calendar-outline" size={14} color={BLUE} />
            <Text style={styles.changeText}>Change Date</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.slotScroll} showsVerticalScrollIndicator={false}>
          {slots.length === 0 ? <Text style={styles.empty}>No slots available on this date.</Text> : null}
          {PERIODS.map((p) => {
            const list = slots.filter((s) => slotPeriod(s) === p.key);
            if (!list.length) return null;
            return (
              <View key={p.key}>
                <Text style={styles.period}>{p.key}</Text>
                <View style={styles.slotWrap}>
                  {list.map((s) => {
                    const on = !!slot && s.getTime() === slot.getTime();
                    return (
                      <Pressable key={s.getTime()} onPress={() => setSlot(s)} style={[styles.slot, on && styles.slotOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
                        <Text style={styles.slotText}>{formatClock(s)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  container: { flex: 1, backgroundColor: Colors.white },
  missing: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 16, gap: 8 },
  back: { width: 32, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  footer: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: Colors.white },
  cta: { height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },

  memberCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", marginTop: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, flexShrink: 1 },
  cardSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },

  h2: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 20, marginBottom: 10 },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5", marginBottom: 10 },
  typeRowOn: { borderColor: Colors.gold, backgroundColor: "#FEF8E8" },
  typeTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  typeSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border },
  label: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12, marginBottom: 6 },
  input: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  noteInput: { minHeight: 80, textAlignVertical: "top" },

  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 12 },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { color: BLUE, fontFamily: Fonts.bold, fontSize: 17 },

  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingHorizontal: 8 },
  monthText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  cell: { width: `${100 / 7}%`, height: 40, alignItems: "center", justifyContent: "center" },
  weekday: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, textAlign: "center", height: 28 },
  dayBubble: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  dayOn: { backgroundColor: Colors.gold },
  dayText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  dayOff: { color: Colors.textMuted, fontFamily: Fonts.regular },
  dayTextOn: { color: Colors.white, fontFamily: Fonts.bold },
  quickRow: { gap: 8, paddingTop: 12 },
  quick: { minWidth: 70, paddingVertical: 8, paddingHorizontal: 10, borderRadius: Radius.md, backgroundColor: "#EEF2FA", alignItems: "center", borderWidth: 1, borderColor: "transparent" },
  quickOn: { borderColor: Colors.gold, backgroundColor: "#FEF8E8" },
  quickTop: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 11 },
  quickBottom: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10, marginTop: 2 },

  dateRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  dateText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  changeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  changeText: { color: BLUE, fontFamily: Fonts.semiBold, fontSize: 12 },
  slotScroll: { maxHeight: 340, marginTop: 4 },
  period: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, marginTop: 14 },
  slotWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  slot: { width: "31.5%", height: 40, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  slotOn: { borderColor: Colors.gold, backgroundColor: "#FEF3D6" },
  slotText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  empty: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", marginTop: 24 },
});
