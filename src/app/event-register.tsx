import { EventThumb } from "@/components/event-ui";
import { Field, Label } from "@/components/form-fields";
import { TopBar } from "@/components/interest-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS, formatEventDate, isRegistrationOpen } from "@/data/events";
import { addRegistration, useEvents } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_ATTENDEES = 5;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EventRegister() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { registrations } = useEvents();
  const e = EVENTS.find((x) => x.id === id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [attendees, setAttendees] = useState(1);
  const [requirements, setRequirements] = useState("");
  const [tried, setTried] = useState(false);

  if (!e || !isRegistrationOpen(e)) {
    return (
      <View style={styles.container}>
        <TopBar title="Register for Event" />
        <Text style={styles.none}>{e ? "Registration for this event is closed." : "This event is no longer available."}</Text>
      </View>
    );
  }

  const maxAttendees = Math.max(1, Math.min(MAX_ATTENDEES, e.seats - e.registered));
  const errors = {
    name: name.trim() ? "" : "Please enter your full name",
    email: EMAIL.test(email.trim()) ? "" : "Enter a valid email address",
    mobile: /^\d{10}$/.test(mobile) ? "" : "Enter a 10-digit mobile number",
  };
  const valid = !errors.name && !errors.email && !errors.mobile;
  const shown = (k: keyof typeof errors) => (tried ? errors[k] : "");

  const submit = () => {
    setTried(true);
    if (!valid) return;
    addRegistration({ eventId: e.id, name: name.trim(), email: email.trim(), mobile, company: company.trim(), designation: designation.trim(), attendees, requirements: requirements.trim() });
    router.replace({ pathname: "/event-registered", params: { id: e.id } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="dark" />
      <TopBar title="Register for Event" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.summary}>
          <EventThumb event={e} style={styles.thumb} />
          <View style={styles.flex}>
            <Text style={styles.eventTitle}>{e.title}</Text>
            <Text style={styles.eventMeta}>{formatEventDate(e.date)}</Text>
            <Text style={styles.eventMeta}>{e.time}</Text>
            <Text style={styles.eventMeta}>{e.location}</Text>
          </View>
        </View>

        <Text style={styles.heading}>Attendee Details</Text>
        <Field label="Full Name" icon="person-outline" required placeholder="Enter your full name" value={name} onChangeText={setName} error={shown("name")} autoCapitalize="words" />
        <Field label="Email Address" icon="mail-outline" required placeholder="Enter your email address" value={email} onChangeText={setEmail} error={shown("email")} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Field
          label="Mobile Number"
          icon="call-outline"
          required
          prefix="+91"
          placeholder="98765 43210"
          value={mobile}
          onChangeText={(t) => setMobile(t.replace(/\D/g, "").slice(0, 10))}
          error={shown("mobile")}
          keyboardType="number-pad"
        />
        <Field label="Company Name" icon="business-outline" placeholder="Enter your company name" value={company} onChangeText={setCompany} />
        <Field label="Designation" icon="briefcase-outline" placeholder="Enter your designation" value={designation} onChangeText={setDesignation} />

        <View style={styles.counterRow}>
          <Label text="Number of Attendees" required />
          <View style={styles.counter}>
            <Pressable onPress={() => setAttendees((n) => Math.max(1, n - 1))} style={styles.step} hitSlop={6} accessibilityRole="button" accessibilityLabel="Decrease attendees">
              <Ionicons name="remove" size={18} color={attendees <= 1 ? Colors.textMuted : Colors.navy} />
            </Pressable>
            <Text style={styles.count}>{attendees}</Text>
            <Pressable onPress={() => setAttendees((n) => Math.min(maxAttendees, n + 1))} style={styles.step} hitSlop={6} accessibilityRole="button" accessibilityLabel="Increase attendees">
              <Ionicons name="add" size={18} color={attendees >= maxAttendees ? Colors.textMuted : Colors.navy} />
            </Pressable>
          </View>
        </View>

        <View style={styles.area}>
          <Label text="Special Requirements" optional />
          <TextInput
            value={requirements}
            onChangeText={setRequirements}
            placeholder="Any dietary or accessibility requirements?"
            placeholderTextColor={Colors.textMuted}
            style={styles.areaInput}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={submit} style={({ pressed }) => pressed && styles.pressed} accessibilityRole="button">
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>{registrations.some((r) => r.eventId === e.id) ? "Update Registration" : "Confirm Registration"}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 },

  summary: { flexDirection: "row", gap: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  thumb: { width: 96, height: 96 },
  eventTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20, marginBottom: 4 },
  eventMeta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 3 },
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },

  counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counter: { flexDirection: "row", alignItems: "center", borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  step: { width: 40, height: 38, alignItems: "center", justifyContent: "center" },
  count: { width: 40, textAlign: "center", color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },

  area: { gap: 8 },
  areaInput: { minHeight: 80, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },

  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  cta: { height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
