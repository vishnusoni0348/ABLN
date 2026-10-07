import { GOLD_BG, Tag } from "@/components/member-ui";
import { usePickImage } from "@/components/form-fields";
import { GOLD_GRADIENT, OppThumb } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CATEGORIES, type Category, OPP_INDUSTRIES, OPP_LOCATIONS, VALUE_RANGES } from "@/data/opportunities";
import { addMine } from "@/lib/opportunity-store";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const STEPS = ["Basic\nDetails", "Business\nDetails", "Timeline &\nContact", "Review", "Submit"];
const TITLES = ["Create Opportunity", "Create Opportunity", "Create Opportunity", "Review Opportunity", ""];
const CONTACTS = ["Through ABLN Platform", "Email", "Phone", "WhatsApp"];
const VALUE_OPTIONS = VALUE_RANGES.map((r) => (r.label.startsWith("<") ? "Under ₹10L" : `₹${r.label}`));
const DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

type Form = {
  title: string;
  category: string;
  short: string;
  detailed: string;
  location: string;
  cover: string;
  industry: string;
  type: string;
  value: string;
  audience: string;
  requirements: string;
  tags: string[];
  deadline: string;
  start: string;
  contact: string;
  extra: string;
  direct: boolean;
};

const EMPTY: Form = {
  title: "",
  category: "",
  short: "",
  detailed: "",
  location: "",
  cover: "",
  industry: "",
  type: "",
  value: "",
  audience: "",
  requirements: "",
  tags: [],
  deadline: "",
  start: "",
  contact: CONTACTS[0],
  extra: "",
  direct: true,
};

const parseDate = (s: string) => {
  const m = DATE_RE.exec(s.trim());
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? d : null;
};
const fmt = (d: Date, withTime?: boolean) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + (withTime ? `, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "");

// Returns an error per invalid field for the given step.
function validate(step: number, f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  const need = (k: keyof Form, msg: string) => {
    if (!String(f[k]).trim()) e[k] = msg;
  };
  if (step === 0) {
    need("title", "Enter a title");
    need("category", "Select a category");
    need("short", "Add a short description");
    need("location", "Select a location");
  }
  if (step === 1) {
    need("industry", "Select an industry");
    need("type", "Select an opportunity type");
    need("value", "Select a value range");
  }
  if (step === 2) {
    const d = parseDate(f.deadline);
    if (!d) e.deadline = "Select a deadline";
    else if (d.getTime() < new Date().setHours(0, 0, 0, 0)) e.deadline = "Deadline must be in the future";
  }
  return e;
}

function Stepper({ step }: { step: number }) {
  return (
    <View style={styles.stepper}>
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        const review = active && i === 3;
        return (
          <View key={label} style={styles.stepItem}>
            <View style={styles.stepRow}>
              <View style={[styles.stepLine, i === 0 && styles.hidden, i <= step && styles.stepLineOn]} />
              <View style={[styles.stepDot, (done || active) && styles.stepDotOn, review && styles.stepDotReview]}>
                {done ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : <Text style={[styles.stepNum, active && styles.stepNumOn]}>{i + 1}</Text>}
              </View>
              <View style={[styles.stepLine, i === STEPS.length - 1 && styles.hidden, i < step && styles.stepLineOn]} />
            </View>
            <Text style={[styles.stepLabel, active && styles.stepLabelOn]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Group({ label, required, optional, error, children }: { label: string; required?: boolean; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
        {optional ? <Text style={styles.opt}> (Optional)</Text> : null}
      </Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Input({ value, onChangeText, placeholder, icon, error }: { value: string; onChangeText: (t: string) => void; placeholder: string; icon?: IconName; error?: string }) {
  return (
    <View style={[styles.box, !!error && styles.boxError]}>
      {icon ? <Ionicons name={icon} size={18} color={Colors.navy} /> : null}
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textMuted} style={styles.input} />
    </View>
  );
}

const toStr = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

function DateField({ value, onChange, placeholder, minimumDate, error }: { value: string; onChange: (v: string) => void; placeholder: string; minimumDate?: Date; error?: string }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current = parseDate(value) ?? minimumDate ?? new Date();
  const [draft, setDraft] = useState(current);

  const onPick = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (e.type === "set" && d) onChange(toStr(d));
    } else if (d) setDraft(d);
  };

  return (
    <View>
      <Pressable
        style={[styles.box, !!error && styles.boxError]}
        onPress={() => {
          setDraft(current);
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Ionicons name="calendar-outline" size={18} color={Colors.navy} />
        <Text style={[styles.input, !value && styles.placeholder]}>{parseDate(value) ? fmt(parseDate(value)!) : placeholder}</Text>
        {value ? (
          <Pressable onPress={() => onChange("")} hitSlop={8} accessibilityLabel="Clear date">
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>
      {open && Platform.OS === "android" ? <DateTimePicker value={current} mode="date" minimumDate={minimumDate} onChange={onPick} /> : null}
      {Platform.OS === "ios" ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.dateHead}>
              <Text style={styles.sheetTitle}>{placeholder}</Text>
              <Pressable
                onPress={() => {
                  onChange(toStr(draft));
                  setOpen(false);
                }}
                hitSlop={8}
              >
                <Text style={styles.done}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker value={draft} mode="date" display="spinner" minimumDate={minimumDate} onChange={onPick} />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

function TextArea({ value, onChangeText, placeholder, max, error }: { value: string; onChangeText: (t: string) => void; placeholder: string; max: number; error?: string }) {
  return (
    <View style={[styles.box, styles.area, !!error && styles.boxError]}>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textMuted} style={[styles.input, styles.areaInput]} multiline maxLength={max} textAlignVertical="top" />
      <Text style={styles.counter}>{`${value.length}/${max}`}</Text>
    </View>
  );
}

function Dropdown({ value, placeholder, options, onChange, icon, error }: { value: string; placeholder: string; options: string[]; onChange: (v: string) => void; icon?: IconName; error?: string }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable style={[styles.box, !!error && styles.boxError]} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={placeholder}>
        {icon ? <Ionicons name={icon} size={18} color={Colors.navy} /> : null}
        <Text style={[styles.input, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.navy} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{placeholder}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((o) => (
              <Pressable
                key={o}
                style={styles.option}
                onPress={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                <Text style={[styles.optionText, o === value && styles.optionOn]}>{o}</Text>
                {o === value ? <Ionicons name="checkmark" size={18} color={Colors.goldDark} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function Chips({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (o: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const on = o === selected;
        return (
          <Pressable key={o} onPress={() => onSelect(o)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.h1}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

function ReviewField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.rField}>
      <Text style={styles.rLabel}>{label}</Text>
      {children}
    </View>
  );
}

const TIMELINE: { title: string; text: string }[] = [
  { title: "Under Review", text: "Our team is reviewing your opportunity." },
  { title: "Published", text: "You will be notified once it's live." },
  { title: "Interested Members", text: "Receive and manage expressions of interest." },
];

export default function CreateOpportunity() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [showErrors, setShowErrors] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [keyboardUp, setKeyboardUp] = useState(false);

  // Hide the footer while typing so the fields get the room, and the keyboard never covers them.
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardUp(true));
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const errors = showErrors ? validate(step, f) : {};

  const pickCover = usePickImage((uri) => set("cover", uri), [16, 9]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !f.tags.includes(t) && f.tags.length < 8) set("tags", [...f.tags, t]);
    setTagInput("");
  };

  const next = () => {
    if (Object.keys(validate(step, f)).length) return setShowErrors(true);
    setShowErrors(false);
    setStep(step + 1);
  };
  const back = () => (step === 0 ? router.back() : (setShowErrors(false), setStep(step - 1)));

  const submit = () => {
    const now = new Date();
    addMine({
      id: `m${now.getTime()}`,
      title: f.title.trim(),
      category: f.type as Category,
      industry: f.industry,
      location: f.location,
      valueLabel: f.value,
      postedLabel: fmt(now),
      cover: f.cover || undefined,
      status: "Pending",
    });
    setSubmittedAt(fmt(now, true));
    setStep(4);
  };

  const reset = () => {
    setF(EMPTY);
    setTagInput("");
    setShowErrors(false);
    setStep(0);
  };

  const requirements = f.requirements
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  const deadline = parseDate(f.deadline);
  const today = new Date();

  const footer =
    step === 4 ? (
      <View style={[styles.footer, styles.footerCol, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={() => router.replace("/my-opportunities")} style={({ pressed }) => pressed && styles.pressed}>
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
            <Text style={styles.primaryText}>View My Opportunities</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={reset} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Create Another Opportunity</Text>
        </Pressable>
      </View>
    ) : step === 0 ? (
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={next} style={({ pressed }) => [styles.flex, pressed && styles.pressed]}>
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
            <Text style={styles.primaryText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    ) : (
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={back} style={({ pressed }) => [styles.secondary, styles.flex, styles.row, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={18} color={Colors.navy} />
          <Text style={[styles.secondaryText, { color: Colors.navy }]}>Back</Text>
        </Pressable>
        <Pressable onPress={step === 3 ? submit : next} style={({ pressed }) => [styles.flex, pressed && styles.pressed]}>
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
            <Text style={styles.primaryText}>{step === 3 ? "Submit Opportunity" : "Next"}</Text>
            {step === 3 ? null : <Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          </LinearGradient>
        </Pressable>
      </View>
    );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "android" ? "padding" : undefined}>
      <StatusBar style="dark" />
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        {step < 4 ? (
          <Pressable onPress={back} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={Colors.navy} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.topTitle}>{TITLES[step]}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {step < 4 ? <Stepper step={step} /> : null}

        {step === 0 ? (
          <>
            <Heading title="Basic Details" sub="Let others know about your opportunity." />
            <Group label="Cover Photo" optional>
              <Pressable style={styles.cover} onPress={pickCover} accessibilityRole="button" accessibilityLabel={f.cover ? "Change cover photo" : "Add cover photo"}>
                {f.cover ? (
                  <>
                    <Image source={{ uri: f.cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <Pressable style={styles.coverRemove} onPress={() => set("cover", "")} hitSlop={8} accessibilityLabel="Remove cover photo">
                      <Ionicons name="close" size={16} color={Colors.navy} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Ionicons name="image-outline" size={28} color={Colors.goldDark} />
                    <Text style={styles.coverText}>Add Cover Photo</Text>
                    <Text style={styles.coverHint}>16:9, up to 2MB</Text>
                  </>
                )}
              </Pressable>
            </Group>
            <Group label="Opportunity Title" required error={errors.title}>
              <Input value={f.title} onChangeText={(v) => set("title", v)} placeholder="Enter opportunity title" error={errors.title} />
            </Group>
            <Group label="Opportunity Category" required error={errors.category}>
              <Dropdown value={f.category} placeholder="Select category" options={[...CATEGORIES]} onChange={(v) => setF((p) => ({ ...p, category: v, type: p.type || v }))} error={errors.category} />
            </Group>
            <Group label="Short Description" required error={errors.short}>
              <TextArea value={f.short} onChangeText={(v) => set("short", v)} placeholder="Provide a brief overview of the opportunity." max={300} error={errors.short} />
            </Group>
            <Group label="Detailed Description">
              <TextArea value={f.detailed} onChangeText={(v) => set("detailed", v)} placeholder="Share more details about the opportunity, goals, and expectations." max={1000} />
            </Group>
            <Group label="Location" required error={errors.location}>
              <Dropdown value={f.location} placeholder="Select location" options={OPP_LOCATIONS} onChange={(v) => set("location", v)} icon="location-outline" error={errors.location} />
            </Group>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Heading title="Business Details" sub="Provide more details about your business opportunity." />
            <Group label="Industry" required error={errors.industry}>
              <Dropdown value={f.industry} placeholder="Select industry" options={OPP_INDUSTRIES} onChange={(v) => set("industry", v)} error={errors.industry} />
            </Group>
            <Group label="Opportunity Type" required error={errors.type}>
              <Chips options={[...CATEGORIES]} selected={f.type} onSelect={(v) => set("type", v)} />
            </Group>
            <Group label="Value Range" required error={errors.value}>
              <Dropdown value={f.value} placeholder="Select value range" options={VALUE_OPTIONS} onChange={(v) => set("value", v)} icon="cash-outline" error={errors.value} />
            </Group>
            <Group label="Target Audience">
              <Input value={f.audience} onChangeText={(v) => set("audience", v)} placeholder="E.g., Distributors, Investors, Technology Partners" />
            </Group>
            <Group label="Key Requirements">
              <TextArea value={f.requirements} onChangeText={(v) => set("requirements", v)} placeholder="What are you looking for in a partner? (one per line)" max={500} />
            </Group>
            <Group label="Tags" optional>
              <View style={styles.box}>
                <Ionicons name="pricetag-outline" size={18} color={Colors.navy} />
                <TextInput value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} placeholder="Add tags" placeholderTextColor={Colors.textMuted} style={styles.input} returnKeyType="done" blurOnSubmit={false} />
                <Pressable onPress={addTag} hitSlop={8} accessibilityLabel="Add tag">
                  <Ionicons name="add-circle-outline" size={22} color={Colors.navy} />
                </Pressable>
              </View>
              {f.tags.length ? (
                <View style={styles.chips}>
                  {f.tags.map((t) => (
                    <Pressable key={t} style={[styles.chip, styles.chipOn, styles.row]} onPress={() => set("tags", f.tags.filter((x) => x !== t))} accessibilityLabel={`Remove ${t}`}>
                      <Text style={styles.chipTextOn}>{t}</Text>
                      <Ionicons name="close" size={14} color={Colors.goldDark} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </Group>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Heading title="Timeline & Contact" sub="Set important dates and your contact preference." />
            <Group label="Deadline" required error={errors.deadline}>
              <DateField value={f.deadline} onChange={(v) => set("deadline", v)} placeholder="Select deadline" minimumDate={today} error={errors.deadline} />
            </Group>
            <Group label="Expected Start Date">
              <DateField value={f.start} onChange={(v) => set("start", v)} placeholder="Select start date" minimumDate={today} />
            </Group>
            <Group label="Contact Preference" required>
              {CONTACTS.map((c) => {
                const on = c === f.contact;
                return (
                  <Pressable key={c} style={styles.radioRow} onPress={() => set("contact", c)} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                    <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <Text style={styles.radioLabel}>{c}</Text>
                  </Pressable>
                );
              })}
            </Group>
            <Group label="Additional Information" optional>
              <TextArea value={f.extra} onChangeText={(v) => set("extra", v)} placeholder="Any other information that helps potential partners understand this opportunity." max={500} />
            </Group>
            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <Text style={styles.switchTitle}>Allow direct contact from interested members</Text>
                <Text style={styles.switchSub}>If enabled, interested members can contact you directly.</Text>
              </View>
              <Switch value={f.direct} onValueChange={(v) => set("direct", v)} trackColor={{ false: "#D5D8E6", true: Colors.goldLight }} thumbColor={f.direct ? Colors.goldDark : Colors.white} />
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <View style={styles.review}>
            <View style={styles.banner}>
              <OppThumb category={(f.type || "Partnership") as Category} uri={f.cover} style={styles.bannerArt} />
              <Pressable style={styles.editBtn} onPress={() => setStep(0)} accessibilityRole="button" accessibilityLabel="Edit details">
                <Ionicons name="create-outline" size={14} color={Colors.navy} />
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.rTitle}>{f.title}</Text>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{f.type}</Text>
              </View>
            </View>
            <View style={styles.facts}>
              <View style={styles.fact}>
                <Ionicons name="location" size={16} color={Colors.goldDark} />
                <Text style={styles.factText}>{f.location.replace(", ", ",\n")}</Text>
              </View>
              <View style={styles.fact}>
                <Ionicons name="calendar" size={16} color={Colors.goldDark} />
                <Text style={styles.factText}>{`Deadline\n${deadline ? fmt(deadline) : ""}`}</Text>
              </View>
              <View style={styles.fact}>
                <Ionicons name="cash" size={16} color={Colors.goldDark} />
                <Text style={styles.factText}>{f.value}</Text>
              </View>
            </View>
            <ReviewField label="Description">
              <Text style={styles.rText}>{f.detailed.trim() || f.short}</Text>
            </ReviewField>
            {requirements.length ? (
              <ReviewField label="Key Requirements">
                {requirements.map((r) => (
                  <Text key={r} style={styles.rText}>{`•  ${r}`}</Text>
                ))}
              </ReviewField>
            ) : null}
            <View style={styles.rPair}>
              <ReviewField label="Industry">
                <Text style={styles.rText}>{f.industry}</Text>
              </ReviewField>
              <ReviewField label="Opportunity Type">
                <View style={styles.rTag}>
                  <Tag>{f.type}</Tag>
                </View>
              </ReviewField>
            </View>
            {f.audience.trim() ? (
              <ReviewField label="Target Audience">
                <Text style={styles.rText}>{f.audience}</Text>
              </ReviewField>
            ) : null}
            <ReviewField label="Contact">
              <Text style={styles.rText}>{`${f.contact}${f.direct ? " · Direct contact allowed" : ""}`}</Text>
            </ReviewField>
            {f.tags.length ? (
              <ReviewField label="Tags">
                <View style={styles.chips}>
                  {f.tags.map((t) => (
                    <View key={t} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </ReviewField>
            ) : null}
          </View>
        ) : null}

        {step === 4 ? (
          <View style={styles.success}>
            <View style={styles.successArt}>
              <View style={styles.doc}>
                <View style={[styles.docLine, { width: 40 }]} />
                <View style={[styles.docLine, { width: 52 }]} />
                <View style={[styles.docLine, { width: 34 }]} />
              </View>
              <View style={styles.check}>
                <Ionicons name="checkmark" size={30} color={Colors.white} />
              </View>
            </View>
            <Text style={styles.successTitle}>Opportunity Submitted Successfully!</Text>
            <Text style={styles.successSub}>Your opportunity has been submitted and is under review.</Text>

            <View style={styles.reviewBox}>
              <Ionicons name="hourglass-outline" size={30} color={Colors.goldDark} />
              <View style={styles.flex}>
                <Text style={styles.reviewTitle}>Under Review</Text>
                <Text style={styles.reviewText}>Our team will review your opportunity and publish it soon.</Text>
              </View>
            </View>

            <View style={styles.timeline}>
              {[{ title: "Submitted", text: submittedAt }, ...TIMELINE.slice(0)].map((t, i, all) => {
                const done = i === 0;
                const current = i === 1;
                return (
                  <View key={t.title} style={styles.tlRow}>
                    <View style={styles.tlRail}>
                      <View style={[styles.tlDot, done && styles.tlDone, current && styles.tlCurrent]}>
                        {done ? <Ionicons name="checkmark" size={13} color={Colors.white} /> : null}
                      </View>
                      {i < all.length - 1 ? <View style={styles.tlLine} /> : null}
                    </View>
                    <View style={styles.tlText}>
                      <Text style={styles.tlTitle}>{t.title}</Text>
                      <Text style={styles.tlSub}>{t.text}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {keyboardUp ? null : footer}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  hidden: { opacity: 0 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  topTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },

  stepper: { flexDirection: "row", marginTop: 6 },
  stepItem: { flex: 1, alignItems: "center" },
  stepRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  stepLine: { flex: 1, height: 1.5, backgroundColor: Colors.border },
  stepLineOn: { backgroundColor: Colors.royalNavy },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#EEF1F5", alignItems: "center", justifyContent: "center" },
  stepDotOn: { backgroundColor: Colors.royalNavy },
  stepDotReview: { backgroundColor: Colors.goldDark },
  stepNum: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 12 },
  stepNumOn: { color: Colors.white },
  stepLabel: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 9, lineHeight: 12, textAlign: "center", marginTop: 4 },
  stepLabelOn: { color: Colors.navy, fontFamily: Fonts.bold },

  heading: { gap: 2, marginTop: 4 },
  h1: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },

  group: { gap: 8 },
  label: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  req: { color: Colors.error },
  opt: { color: Colors.textSecondary, fontFamily: Fonts.regular },
  error: { color: Colors.error, fontFamily: Fonts.regular, fontSize: 11 },
  box: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  boxError: { borderColor: Colors.error },
  input: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, padding: 0 },
  placeholder: { color: Colors.textMuted },
  area: { alignItems: "stretch", flexDirection: "column", gap: 4, paddingVertical: 10, minHeight: 96 },
  areaInput: { minHeight: 56 },
  counter: { alignSelf: "flex-end", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10 },

  cover: { height: 130, borderRadius: Radius.md, borderWidth: 1, borderStyle: "dashed", borderColor: Colors.gold, backgroundColor: "#FEF6E3", alignItems: "center", justifyContent: "center", gap: 2, overflow: "hidden" },
  coverText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 13, marginTop: 4 },
  coverHint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  coverRemove: { position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { height: 36, paddingHorizontal: 16, borderRadius: Radius.sm, backgroundColor: "#EEF2FA", alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: GOLD_BG },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  chipTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 12 },

  radioRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.goldDark },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.goldDark },
  radioLabel: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  switchSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },

  review: { gap: 14 },
  banner: { borderRadius: Radius.md, overflow: "hidden" },
  bannerArt: { height: 120, borderRadius: Radius.md },
  editBtn: { position: "absolute", top: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  editText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 11 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  rTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, lineHeight: 22 },
  typePill: { backgroundColor: GOLD_BG, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typePillText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 10 },
  facts: { flexDirection: "row", gap: 8 },
  fact: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  factText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  rField: { gap: 4, flex: 1 },
  rLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  rText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  rPair: { flexDirection: "row", gap: 12 },
  rTag: { alignSelf: "flex-start" },
  tagPill: { backgroundColor: GOLD_BG, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  tagPillText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 11 },

  success: { alignItems: "center", gap: 12 },
  successArt: { width: 170, height: 150, alignItems: "center", justifyContent: "center", marginTop: 16, borderRadius: 85, backgroundColor: "#EAF0FB" },
  doc: { width: 78, height: 96, borderRadius: 8, backgroundColor: Colors.white, padding: 12, gap: 8, shadowColor: Colors.navy, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  docLine: { height: 5, borderRadius: 3, backgroundColor: "#DDE3EE" },
  check: { position: "absolute", right: 34, bottom: 14, width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  successTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, textAlign: "center" },
  successSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, textAlign: "center", paddingHorizontal: 24 },
  reviewBox: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: Radius.md, backgroundColor: "#FEF6E3" },
  reviewTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  reviewText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  timeline: { alignSelf: "stretch", paddingHorizontal: 8, marginTop: 4 },
  tlRow: { flexDirection: "row", gap: 14 },
  tlRail: { alignItems: "center", width: 22 },
  tlDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  tlDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  tlCurrent: { borderColor: Colors.goldDark },
  tlLine: { width: 2, flex: 1, minHeight: 22, backgroundColor: Colors.border },
  tlText: { flex: 1, paddingBottom: 14 },
  tlTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12 },
  tlSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  footerCol: { flexDirection: "column", gap: 10 },
  primary: { height: 48, borderRadius: Radius.md, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  primaryText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  secondary: { height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  secondaryText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, maxHeight: "70%" },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginBottom: 4 },
  dateHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  done: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 15 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  optionOn: { fontFamily: Fonts.bold, color: Colors.goldDark },
});
