import { SearchBox, showSearch } from "@/components/form-fields";
import { BottomSheet } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { ComponentProps, ReactNode, useState } from "react";
import { Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FLAGS: Record<string, string> = { "+91": "🇮🇳", "+971": "🇦🇪", "+65": "🇸🇬", "+1": "🇺🇸", "+44": "🇬🇧" };

/** ISO "YYYY-MM-DD" <-> Date helpers (local time, no timezone drift). */
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromIso = (v: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
export const formatDob = (v: string) => {
  const d = fromIso(v);
  return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "";
};

type BoxProps = { label: string; icon: IconName; required?: boolean; error?: string; onPress?: () => void; trailing?: ReactNode; style?: StyleProp<ViewStyle>; disabled?: boolean; children: ReactNode };

/** Outlined field with the icon on the left and a small label above the value. */
export function BoxField({ label, icon, required, error, onPress, trailing, style, disabled, children }: BoxProps) {
  const Wrap = onPress ? Pressable : View;
  return (
    <View style={[styles.group, style]}>
      <Wrap onPress={onPress} accessibilityRole={onPress ? "button" : undefined} accessibilityLabel={onPress ? label : undefined} style={[styles.box, !!error && styles.boxError, disabled && styles.boxDisabled]}>
        <Ionicons name={icon} size={22} color={disabled ? Colors.textSecondary : Colors.navy} />
        <View style={styles.body}>
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.req}> *</Text> : null}
          </Text>
          {children}
        </View>
        {disabled ? <Ionicons name="lock-closed" size={16} color={Colors.textMuted} /> : trailing}
      </Wrap>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

type TextBoxProps = Omit<BoxProps, "children" | "onPress" | "trailing"> & Pick<TextInputProps, "value" | "onChangeText" | "keyboardType" | "autoCapitalize" | "autoCorrect" | "maxLength" | "placeholder">;

export function TextBox({ label, icon, required, error, style, disabled, ...input }: TextBoxProps) {
  return (
    <BoxField label={label} icon={icon} required={required} error={error} style={style} disabled={disabled}>
      <TextInput accessibilityLabel={label} placeholderTextColor={Colors.textMuted} style={[styles.value, disabled && styles.valueDisabled]} editable={!disabled} {...input} />
    </BoxField>
  );
}

function OptionSheet({ visible, title, options, value, onClose, onPick, render }: { visible: boolean; title: string; options: string[]; value?: string; onClose: () => void; onPick: (v: string) => void; render?: (o: string) => string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((o) => (render ? render(o) : o).toLowerCase().includes(q)) : options;
  const close = () => {
    setQuery("");
    onClose();
  };
  return (
    <BottomSheet visible={visible} title={title} onClose={close}>
      {showSearch(options) ? <SearchBox value={query} onChangeText={setQuery} /> : null}
      <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!shown.length ? <Text style={styles.noResults}>No results found</Text> : null}
        {shown.map((o) => (
          <Pressable
            key={o}
            style={styles.option}
            onPress={() => {
              onPick(o);
              close();
            }}
          >
            <Text style={[styles.optionText, (o === value || render?.(o) === value) && styles.optionOn]}>{render ? render(o) : o}</Text>
            {o === value || render?.(o) === value ? <Ionicons name="checkmark" size={20} color={Colors.goldDark} /> : null}
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

type PickBoxProps = Omit<BoxProps, "children" | "onPress" | "trailing"> & { value?: string; placeholder: string; options: string[]; onChange: (v: string) => void; render?: (o: string) => string };

export function PickBox({ value, placeholder, options, onChange, render, ...box }: PickBoxProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BoxField {...box} onPress={() => setOpen(true)} trailing={<Ionicons name="chevron-down" size={20} color={Colors.navy} />}>
        <Text style={[styles.value, !value && { color: Colors.textMuted }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      </BoxField>
      <OptionSheet visible={open} title={box.label} options={options} value={value} onClose={() => setOpen(false)} onPick={onChange} render={render} />
    </>
  );
}

type PhoneBoxProps = Omit<BoxProps, "children" | "onPress" | "trailing" | "icon"> & { dialCode: string; dialCodes: string[]; onDialCode: (v: string) => void; value: string; onChangeText: (v: string) => void };

export function PhoneBox({ dialCode, dialCodes, onDialCode, value, onChangeText, ...box }: PhoneBoxProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BoxField {...box} icon="call-outline">
        <View style={styles.phoneRow}>
          <Pressable onPress={() => setOpen(true)} disabled={box.disabled} accessibilityRole="button" accessibilityLabel="Dial code" style={styles.dial}>
            <Text style={styles.flag}>{FLAGS[dialCode] ?? "🌐"}</Text>
            <Text style={styles.dialText}>{dialCode}</Text>
            {box.disabled ? null : <Ionicons name="chevron-down" size={14} color={Colors.navy} />}
          </Pressable>
          <TextInput accessibilityLabel={box.label} value={value} onChangeText={onChangeText} editable={!box.disabled} keyboardType="phone-pad" maxLength={14} placeholderTextColor={Colors.textMuted} style={[styles.value, box.disabled && styles.valueDisabled]} />
        </View>
      </BoxField>
      <OptionSheet visible={open} title="Dial Code" options={dialCodes} value={dialCode} onClose={() => setOpen(false)} onPick={onDialCode} render={(o) => `${FLAGS[o] ?? "🌐"}  ${o}`} />
    </>
  );
}

type DateBoxProps = Omit<BoxProps, "children" | "onPress" | "trailing"> & { value: string; onChange: (iso: string) => void };

export function DateBox({ value, onChange, ...box }: DateBoxProps) {
  const [open, setOpen] = useState(false);
  const current = fromIso(value) ?? new Date(1990, 0, 1);
  const [draft, setDraft] = useState(current);
  const max = new Date();

  const onPick = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (e.type === "set" && d) onChange(toIso(d));
    } else if (d) setDraft(d);
  };

  return (
    <>
      <BoxField
        {...box}
        onPress={() => {
          setDraft(current);
          setOpen(true);
        }}
        trailing={<Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />}
      >
        <Text style={[styles.value, !value && { color: Colors.textMuted }]} numberOfLines={1}>
          {formatDob(value) || "Select date"}
        </Text>
      </BoxField>
      {open && Platform.OS === "android" ? <DateTimePicker value={current} mode="date" maximumDate={max} onChange={onPick} /> : null}
      {Platform.OS === "ios" ? (
        <BottomSheet visible={open} title={box.label} onClose={() => setOpen(false)}>
          <DateTimePicker value={draft} mode="date" display="spinner" maximumDate={max} onChange={onPick} />
          <Pressable
            onPress={() => {
              onChange(toIso(draft));
              setOpen(false);
            }}
            accessibilityRole="button"
            style={styles.done}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </BottomSheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  boxDisabled: { backgroundColor: "#F1F4F8" },
  valueDisabled: { color: Colors.textSecondary },
  group: { marginTop: 12 },
  box: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  boxError: { borderColor: Colors.error },
  body: { flex: 1, minWidth: 0 },
  label: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 11 },
  req: { color: Colors.error },
  value: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15, paddingVertical: 0, marginTop: 2, flex: 1 },
  error: { color: Colors.error, fontFamily: Fonts.regular, fontSize: 12, marginTop: 4 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },
  dial: { flexDirection: "row", alignItems: "center", gap: 4, height: 26, paddingHorizontal: 8, borderRadius: 8, backgroundColor: "#EEF2FA" },
  flag: { fontSize: 16 },
  dialText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  sheetList: { maxHeight: 360 },
  noResults: { color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 15, textAlign: "center", paddingVertical: 24 },
  option: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 16 },
  optionOn: { fontFamily: Fonts.bold },
  done: { height: 50, borderRadius: Radius.md, backgroundColor: Colors.navy, alignItems: "center", justifyContent: "center", marginTop: 8 },
  doneText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
