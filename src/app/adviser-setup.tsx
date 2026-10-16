import { CheckRow, ModeCard, ProgressBar, StepHeading, SubHeading, ToggleChip } from "@/components/adviser-ui";
import { Field, Label, SearchBox, Select, filterOptions } from "@/components/form-fields";
import { Card, GoldButton, OutlineBtn, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import {
  ABOUT_MAX,
  DAYS,
  EXPERIENCE_OPTIONS,
  EXPERTISE_AREAS,
  MODES,
  SESSIONS,
  SLOTS,
  SessionMode,
  emptyApplication,
  submitAdviserApplication,
  useAdviser,
} from "@/lib/adviser-store";
import { useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ComponentProps, ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TOTAL = 4;
const MODE_ICONS: Record<SessionMode, IconName> = { Online: "laptop-outline", "In Person": "people-outline", Both: "calendar-outline" };
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function AdviserSetup() {
  const { status, application } = useAdviser();
  const { profile } = useSettings();
  const { step: startStep } = useLocalSearchParams<{ step?: string }>();
  const [step, setStep] = useState(Math.min(Math.max(Number(startStep) || 1, 1), TOTAL));
  const [form, setForm] = useState(() => application ?? { ...emptyApplication(), designation: profile.designation, company: profile.company });
  const [query, setQuery] = useState("");
  const [other, setOther] = useState("");
  const [tried, setTried] = useState(false);

  const patch = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  const editing = status === "approved";

  const errors = {
    expertise: form.expertise.length ? "" : "Select at least one area of expertise",
    experience: form.experience ? "" : "Select your total experience",
    designation: form.designation.trim() ? "" : "Enter your current designation",
    company: form.company.trim() ? "" : "Enter your current company",
    about: form.about.trim() ? "" : "Tell us about your experience",
    mode: form.mode ? "" : "Choose a preferred mode",
    days: form.days.length ? "" : "Select at least one day",
    slots: form.slots.length ? "" : "Select at least one time slot",
    session: form.session ? "" : "Choose a session type",
  };
  const stepKeys: Record<number, (keyof typeof errors)[]> = {
    1: ["expertise"],
    2: ["experience", "designation", "company", "about"],
    3: ["mode", "days", "slots", "session"],
    4: [],
  };
  const stepValid = (s: number) => stepKeys[s].every((k) => !errors[k]);
  const show = (k: keyof typeof errors) => (tried ? errors[k] : "");

  const back = () => {
    setTried(false);
    if (step === 1) router.back();
    else setStep(step - 1);
  };
  const next = () => {
    if (!stepValid(step)) return setTried(true);
    setTried(false);
    setStep(step + 1);
  };
  const submit = () => {
    const firstBad = [1, 2, 3].find((s) => !stepValid(s));
    if (firstBad) {
      setTried(true);
      return setStep(firstBad);
    }
    submitAdviserApplication(form);
    if (editing) router.back();
    else router.replace("/adviser-submitted");
  };

  const addOther = () => {
    const text = other.trim();
    if (text && !form.expertise.some((e) => e.toLowerCase() === text.toLowerCase())) patch({ expertise: [...form.expertise, text] });
    setOther("");
  };
  const custom = form.expertise.filter((e) => !EXPERTISE_AREAS.includes(e));
  const popular = filterOptions(EXPERTISE_AREAS, query);

  return (
    <SettingsScreen
      title={`Step ${step} of ${TOTAL}`}
      footer={
        <View style={styles.footer}>
          {step > 1 ? <OutlineBtn label="Back" icon="arrow-back" onPress={back} style={{ flex: 1 }} /> : null}
          <GoldButton label={step === TOTAL ? (editing ? "Save Changes" : "Submit") : "Next"} onPress={step === TOTAL ? submit : next} style={{ flex: 1 }} />
        </View>
      }
    >
      <ProgressBar step={step} total={TOTAL} />

      {step === 1 ? (
        <>
          <StepHeading title="Your Expertise" sub="Select the areas where you can provide guidance and support." />
          <SearchBox value={query} onChangeText={setQuery} placeholder="Search expertise areas..." />
          <SubHeading>Popular Areas</SubHeading>
          <View style={styles.wrap}>
            {popular.map((e) => (
              <ToggleChip key={e} label={e} on={form.expertise.includes(e)} onPress={() => patch({ expertise: toggle(form.expertise, e) })} />
            ))}
            {!popular.length ? <Text style={styles.empty}>No matching areas. Add it below instead.</Text> : null}
          </View>
          {show("expertise") ? <Text style={styles.error}>{show("expertise")}</Text> : null}

          <SubHeading>Other Expertise (Optional)</SubHeading>
          <View style={styles.otherRow}>
            <TextInput
              value={other}
              onChangeText={setOther}
              onSubmitEditing={addOther}
              returnKeyType="done"
              placeholder="Add your expertise area"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              style={styles.otherInput}
            />
            <Pressable onPress={addOther} disabled={!other.trim()} accessibilityRole="button" accessibilityLabel="Add expertise" hitSlop={8} style={!other.trim() && { opacity: 0.4 }}>
              <Ionicons name="add" size={24} color={Colors.navy} />
            </Pressable>
          </View>
          {custom.length ? (
            <View style={styles.wrap}>
              {custom.map((e) => (
                <ToggleChip key={e} label={e} on onPress={() => patch({ expertise: toggle(form.expertise, e) })} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {step === 2 ? (
        <>
          <StepHeading title="Your Experience" sub="Tell us about your professional experience and background." />
          <Select label="Total Experience" required icon="briefcase-outline" placeholder="Select experience" value={form.experience} options={EXPERIENCE_OPTIONS} onChange={(experience) => patch({ experience })} error={show("experience")} />
          <Field label="Current Designation" required icon="person-outline" placeholder="e.g. CEO, Founder, Consultant" value={form.designation} onChangeText={(designation) => patch({ designation })} error={show("designation")} />
          <Field label="Current Company" required icon="business-outline" placeholder="e.g. TechVision Pvt Ltd" value={form.company} onChangeText={(company) => patch({ company })} error={show("company")} />
          <View style={{ marginTop: 16 }}>
            <Label text="About Your Experience" required />
            <TextInput
              value={form.about}
              onChangeText={(about) => patch({ about: about.slice(0, ABOUT_MAX) })}
              multiline
              textAlignVertical="top"
              placeholder="Briefly describe your experience, key achievements and how you can help members."
              placeholderTextColor={Colors.textMuted}
              style={[styles.about, !!show("about") && { borderColor: Colors.error }]}
            />
            <Text style={styles.count}>
              {form.about.length}/{ABOUT_MAX}
            </Text>
            {show("about") ? <Text style={styles.error}>{show("about")}</Text> : null}
          </View>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <StepHeading title="Your Availability" sub="Set your availability for advisory sessions." />
          <SubHeading>Preferred Mode</SubHeading>
          <View style={styles.row}>
            {MODES.map((m) => (
              <ModeCard key={m} icon={MODE_ICONS[m]} label={m} on={form.mode === m} onPress={() => patch({ mode: m })} />
            ))}
          </View>
          {show("mode") ? <Text style={styles.error}>{show("mode")}</Text> : null}

          <SubHeading>Weekly Availability</SubHeading>
          <Text style={styles.hint}>Select the days and time slots when you are available for advisory sessions.</Text>
          <View style={styles.row}>
            {DAYS.slice(0, 4).map((d) => (
              <ToggleChip key={d} flex label={d} on={form.days.includes(d)} onPress={() => patch({ days: toggle(form.days, d) })} />
            ))}
          </View>
          <View style={styles.row}>
            {DAYS.slice(4).map((d) => (
              <ToggleChip key={d} flex label={d} on={form.days.includes(d)} onPress={() => patch({ days: toggle(form.days, d) })} />
            ))}
            <View style={{ flex: 1 }} />
          </View>
          {show("days") ? <Text style={styles.error}>{show("days")}</Text> : null}
          <View style={{ gap: 4 }}>
            {SLOTS.map((s) => (
              <CheckRow key={s.key} label={s.key} sub={s.time} on={form.slots.includes(s.key)} onPress={() => patch({ slots: toggle(form.slots, s.key) })} />
            ))}
          </View>
          {show("slots") ? <Text style={styles.error}>{show("slots")}</Text> : null}

          <SubHeading>Session Type</SubHeading>
          <View style={styles.row}>
            {SESSIONS.map((s) => (
              <ToggleChip key={s} flex label={s} on={form.session === s} onPress={() => patch({ session: s })} />
            ))}
          </View>
          {show("session") ? <Text style={styles.error}>{show("session")}</Text> : null}
        </>
      ) : null}

      {step === 4 ? (
        <>
          <StepHeading title="Review & Submit" sub="Please review your information before submitting." />
          <ReviewCard title="Expertise Areas" onEdit={() => setStep(1)}>
            <View style={styles.wrap}>
              {form.expertise.map((e) => (
                <View key={e} style={styles.tag}>
                  <Text style={styles.tagText}>{e}</Text>
                </View>
              ))}
            </View>
          </ReviewCard>
          <ReviewCard title="Experience" onEdit={() => setStep(2)}>
            <Line icon="calendar-outline" text={form.experience} />
            <Line icon="briefcase-outline" text={form.designation} />
            <Line icon="business-outline" text={form.company} />
            <Text style={styles.reviewAbout}>{form.about}</Text>
          </ReviewCard>
          <ReviewCard title="Availability" onEdit={() => setStep(3)}>
            <Line icon="laptop-outline" text={`${form.mode} · ${form.session}`} />
            <Line icon="calendar-outline" text={DAYS.filter((d) => form.days.includes(d)).join(", ")} />
            <Line icon="time-outline" text={SLOTS.filter((s) => form.slots.includes(s.key)).map((s) => `${s.key} (${s.time})`).join(", ")} />
          </ReviewCard>
        </>
      ) : null}
    </SettingsScreen>
  );
}

function ReviewCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <Card style={{ gap: 10 }}>
      <View style={styles.reviewHead}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Edit ${title}`} style={styles.editPill}>
          <Ionicons name="create-outline" size={14} color={Colors.navy} />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
      {children}
    </Card>
  );
}

function Line({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={styles.lineText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: "row", gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  row: { flexDirection: "row", gap: 10 },
  empty: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14 },
  error: { color: Colors.error, fontFamily: Fonts.regular, fontSize: 12 },
  hint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  otherRow: { flexDirection: "row", alignItems: "center", gap: 10, height: 52, paddingHorizontal: 16, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  otherInput: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15, paddingVertical: 0 },
  about: { minHeight: 130, padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  count: { color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 12, textAlign: "right", marginTop: 4 },
  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  editPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F2F5FA", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  editText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  tag: { backgroundColor: "#EAF1FD", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  line: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  lineText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  reviewAbout: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
});
