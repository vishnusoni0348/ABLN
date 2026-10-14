import { GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { CITIES, distanceKm, INDUSTRIES, type Member, placeLabel } from "@/data/members";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { type ComponentProps, type ReactNode, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ConnectionFilters = {
  roles: string[];
  verifiedOnly: boolean;
  location: string;
  radius: number;
  industry: string;
  chapter: string;
};

export const EMPTY_CONNECTION_FILTERS: ConnectionFilters = { roles: [], verifiedOnly: false, location: "", radius: 50, industry: "", chapter: "" };

const DESIGNATIONS = ["Founder", "Co-Founder", "Director", "CEO", "CTO", "CFO", "Manager", "Advisor", "Investor", "Other"];
const RADIUS_STOPS = [5, 25, 50, 100, 200];
const CHAPTERS = CITIES.map((c) => `${c} Chapter`);

type IconName = ComponentProps<typeof Ionicons>["name"];

export function matchesFilters(m: Member, f: ConnectionFilters) {
  const known = DESIGNATIONS.slice(0, -1);
  const role = known.includes(m.role) ? m.role : "Other";
  return (
    (!f.roles.length || f.roles.includes(role)) &&
    (!f.verifiedOnly || m.verified) &&
    (!f.location || distanceKm(f.location, m.city) <= f.radius) &&
    (!f.industry || m.industry === f.industry) &&
    (!f.chapter || f.chapter === `${m.city} Chapter`)
  );
}

export function activeFilterCount(f: ConnectionFilters) {
  return (f.roles.length ? 1 : 0) + (f.verifiedOnly ? 1 : 0) + (f.location ? 1 : 0) + (f.industry ? 1 : 0) + (f.chapter ? 1 : 0);
}

function Section({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={20} color={Colors.navy} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/** Dropdown with an optional search box; picking an option calls onSelect and collapses. */
function SelectField({ placeholder, value, options, searchable, onSelect }: { placeholder: string; value: string; options: { value: string; label: string }[]; searchable?: boolean; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const shown = options.filter((o) => o.label.toLowerCase().includes(text.trim().toLowerCase()));
  const label = options.find((o) => o.value === value)?.label;
  return (
    <View>
      <Pressable style={styles.select} onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={placeholder}>
        {open && searchable ? (
          <TextInput autoFocus value={text} onChangeText={setText} placeholder={placeholder} placeholderTextColor={Colors.textMuted} style={styles.selectInput} autoCorrect={false} />
        ) : (
          <Text style={[styles.selectText, !label && { color: Colors.textSecondary }]} numberOfLines={1}>
            {label ?? placeholder}
          </Text>
        )}
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={Colors.navy} />
      </Pressable>
      {open ? (
        <ScrollView style={styles.dropdown} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {[{ value: "", label: "Any" }, ...shown].map((o) => (
            <Pressable
              key={o.value || "any"}
              style={styles.option}
              onPress={() => {
                onSelect(o.value);
                setText("");
                setOpen(false);
              }}
            >
              <Text style={[styles.optionText, o.value === value && styles.optionOn]}>{o.label}</Text>
              {o.value === value ? <Ionicons name="checkmark" size={18} color={Colors.goldDark} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

export function ConnectionFilterSheet({ visible, value, members, onClose, onApply }: { visible: boolean; value: ConnectionFilters; members: Member[]; onClose: () => void; onApply: (f: ConnectionFilters) => void }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(false);
  // Re-seed the draft each time the sheet opens.
  if (visible !== seen) {
    setSeen(visible);
    if (visible) setDraft(value);
  }

  const set = <K extends keyof ConnectionFilters>(k: K, v: ConnectionFilters[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleRole = (r: string) => set("roles", draft.roles.includes(r) ? draft.roles.filter((x) => x !== r) : [...draft.roles, r]);
  const count = members.filter((m) => matchesFilters(m, draft)).length;
  const stop = Math.max(0, RADIUS_STOPS.indexOf(draft.radius));
  const opts = (xs: string[], fmt: (s: string) => string = (s) => s) => xs.map((x) => ({ value: x, label: fmt(x) }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Filter Connections</Text>
          <Pressable style={styles.close} onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={Colors.navy} />
          </Pressable>
        </View>
        <Pressable style={styles.reset} onPress={() => setDraft(EMPTY_CONNECTION_FILTERS)} hitSlop={8}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Section icon="briefcase-outline" title="Post / Designation">
            <SelectField searchable placeholder="Search or select post/designation..." value="" options={opts(DESIGNATIONS)} onSelect={(v) => v && !draft.roles.includes(v) && toggleRole(v)} />
            <View style={styles.chips}>
              {DESIGNATIONS.map((r) => {
                const on = draft.roles.includes(r);
                return (
                  <Pressable key={r} onPress={() => toggleRole(r)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{r}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          <View style={styles.divider} />
          <Section icon="shield-checkmark-outline" title="Verified Members">
            {[false, true].map((v) => (
              <Pressable key={String(v)} style={styles.radioRow} onPress={() => set("verifiedOnly", v)} accessibilityRole="radio" accessibilityState={{ selected: draft.verifiedOnly === v }}>
                <Ionicons name={draft.verifiedOnly === v ? "radio-button-on" : "radio-button-off"} size={24} color={draft.verifiedOnly === v ? Colors.gold : Colors.textMuted} />
                <Text style={styles.radioText}>{v ? "Verified Members Only" : "All Members"}</Text>
                {v ? <Ionicons name="checkmark-circle" size={16} color="#2F6FDE" /> : null}
              </Pressable>
            ))}
          </Section>

          <View style={styles.divider} />
          <Section icon="location-outline" title="Location">
            <SelectField placeholder="Select location..." value={draft.location} options={opts(CITIES, placeLabel)} onSelect={(v) => set("location", v)} />
          </Section>

          <View style={styles.divider} />
          <Section icon="locate-outline" title="Radius">
            <View style={!draft.location && styles.disabled}>
              <Text style={styles.radiusValue}>{draft.radius} km</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={RADIUS_STOPS.length - 1}
                step={1}
                value={stop}
                onValueChange={(i) => set("radius", RADIUS_STOPS[Math.round(i)])}
                disabled={!draft.location}
                minimumTrackTintColor={Colors.gold}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.gold}
                accessibilityLabel="Radius in kilometres"
              />
              <View style={styles.scale}>
                {RADIUS_STOPS.map((s) => (
                  <Text key={s} style={styles.scaleText}>
                    {s} km
                  </Text>
                ))}
              </View>
            </View>
          </Section>

          <View style={styles.divider} />
          <Section icon="business-outline" title="Industry">
            <SelectField searchable placeholder="Search or select industry..." value={draft.industry} options={opts(INDUSTRIES)} onSelect={(v) => set("industry", v)} />
          </Section>

          <View style={styles.divider} />
          <Section icon="people-outline" title="Chapter">
            <SelectField placeholder="Select chapter..." value={draft.chapter} options={opts(CHAPTERS)} onSelect={(v) => set("chapter", v)} />
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.apply} onPress={() => onApply(draft)}>
            <Text style={styles.applyText}>Apply Filters ({count})</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, height: "92%", backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginTop: 10 },
  header: { alignItems: "center", justifyContent: "center", height: 52 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  close: { position: "absolute", right: 16 },
  reset: { alignSelf: "flex-end", paddingHorizontal: 20 },
  resetText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  scroll: { paddingHorizontal: 20, paddingBottom: 16 },
  section: { gap: 12, paddingVertical: 4 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  divider: { height: 1, backgroundColor: "#EEF1F5", marginVertical: 14 },

  select: { flexDirection: "row", alignItems: "center", gap: 8, height: 46, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  selectText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  selectInput: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, padding: 0 },
  dropdown: { maxHeight: 200, marginTop: 4, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  optionOn: { color: Colors.goldDark, fontFamily: Fonts.bold },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { height: 32, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "#EEF1FA", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  chipOn: { backgroundColor: GOLD_BG, borderColor: Colors.gold },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  chipTextOn: { color: Colors.goldDark, fontFamily: Fonts.semiBold },

  radioRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  radioText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },

  disabled: { opacity: 0.45 },
  radiusValue: { alignSelf: "flex-end", color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  slider: { width: "100%", height: 36 },
  scale: { flexDirection: "row", justifyContent: "space-between" },
  scaleText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  cancel: { flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1.5, borderColor: "#2F6FDE", alignItems: "center", justifyContent: "center" },
  cancelText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  apply: { flex: 1.5, height: 48, borderRadius: Radius.md, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
});
