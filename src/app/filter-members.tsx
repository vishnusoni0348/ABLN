import { GOLD_BG, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CAN_OFFER, CITIES, COUNTRIES, EMPTY_FILTERS, EXPERTISE, type Filters, INDUSTRIES, LOOKING_FOR } from "@/data/members";
import { setDirectory, useDirectory } from "@/lib/directory-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const MEMBER_TYPES: Filters["memberType"][] = ["Individual", "Business", "Both"];

function Section({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={18} color={Colors.goldDark} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Select({ label, placeholder, value, options, onChange }: { label?: string; placeholder: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.selectWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <Pressable style={styles.select} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={placeholder}>
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
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
            {["", ...options].map((o) => {
              const on = o === value;
              return (
                <Pressable
                  key={o || "any"}
                  style={styles.option}
                  onPress={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, on && styles.optionOn]}>{o || "Any"}</Text>
                  {on ? <Ionicons name="checkmark" size={18} color={Colors.goldDark} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function ChipGroup({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (o: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <Pressable key={o} onPress={() => onToggle(o)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function FilterMembers() {
  const insets = useSafeAreaInsets();
  const { filters } = useDirectory();
  const [draft, setDraft] = useState<Filters>(filters);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const toggle = (key: "lookingFor" | "canOffer", o: string) =>
    setDraft((d) => ({ ...d, [key]: d[key].includes(o) ? d[key].filter((x) => x !== o) : [...d[key], o] }));

  const apply = () => {
    setDirectory({ filters: draft });
    router.navigate("/search-results");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="Filter Members"
          right={
            <Pressable onPress={() => setDraft(EMPTY_FILTERS)} hitSlop={8}>
              <Text style={styles.clear}>Clear All</Text>
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Section icon="location-outline" title="Location">
          <Select label="City" placeholder="Select city" value={draft.city} options={CITIES} onChange={(v) => set("city", v)} />
          <Select label="Country" placeholder="Select country" value={draft.country} options={COUNTRIES} onChange={(v) => set("country", v)} />
        </Section>

        <Section icon="business-outline" title="Industry">
          <Select placeholder="Select industry" value={draft.industry} options={INDUSTRIES} onChange={(v) => set("industry", v)} />
        </Section>

        <Section icon="ribbon-outline" title="Expertise">
          <Select placeholder="Select expertise" value={draft.expertise} options={EXPERTISE} onChange={(v) => set("expertise", v)} />
        </Section>

        <Section icon="search-outline" title="Looking For">
          <ChipGroup options={LOOKING_FOR} selected={draft.lookingFor} onToggle={(o) => toggle("lookingFor", o)} />
        </Section>

        <Section icon="gift-outline" title="Can Offer">
          <ChipGroup options={CAN_OFFER} selected={draft.canOffer} onToggle={(o) => toggle("canOffer", o)} />
        </Section>

        <Section icon="person-outline" title="Member Type">
          <View style={styles.chips}>
            {MEMBER_TYPES.map((t) => {
              const on = draft.memberType === t;
              return (
                <Pressable key={t} onPress={() => set("memberType", t)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                  {on ? <Ionicons name="radio-button-on" size={16} color={Colors.goldDark} /> : null}
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section icon="shield-checkmark-outline" title="Membership">
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Verified Members Only</Text>
            <Switch
              value={draft.verifiedOnly}
              onValueChange={(v) => set("verifiedOnly", v)}
              trackColor={{ false: "#D5D8E6", true: Colors.goldLight }}
              thumbColor={draft.verifiedOnly ? Colors.goldDark : Colors.white}
            />
          </View>
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.cancel, pressed && styles.pressed]} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.applyWrap, pressed && styles.pressed]} onPress={apply}>
          <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.apply}>
            <Text style={styles.applyText}>Apply Filters</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  top: { paddingHorizontal: 16 },
  clear: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 18 },

  section: { gap: 10 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  selectWrap: { gap: 6 },
  fieldLabel: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  selectText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  selectPlaceholder: { color: Colors.textSecondary },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#F6F7FA" },
  chipOn: { borderColor: Colors.gold, backgroundColor: GOLD_BG },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  chipTextOn: { color: Colors.goldDark, fontFamily: Fonts.semiBold },

  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchLabel: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  cancel: { flex: 1, height: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  cancelText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  applyWrap: { flex: 1.4 },
  apply: { height: 46, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, maxHeight: "70%" },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginBottom: 4 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  optionOn: { fontFamily: Fonts.bold, color: Colors.goldDark },
});
