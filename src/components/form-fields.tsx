import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ComponentProps, ReactNode, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function Label({ text, required, optional }: { text: string; required?: boolean; optional?: boolean }) {
  return (
    <Text style={styles.label}>
      {text}
      {required ? <Text style={styles.req}> *</Text> : null}
      {optional ? <Text style={styles.opt}> (Optional)</Text> : null}
    </Text>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  icon: IconName;
  required?: boolean;
  optional?: boolean;
  error?: string;
  prefix?: string;
};

export function Field({ label, icon, required, optional, error, prefix, style, ...input }: FieldProps) {
  return (
    <View style={styles.group}>
      <Label text={label} required={required} optional={optional} />
      <View style={[styles.box, !!error && styles.boxError]}>
        <Ionicons name={icon} size={22} color={Colors.navy} />
        {prefix ? (
          <>
            <Text style={styles.prefix}>{prefix}</Text>
            <View style={styles.sep} />
          </>
        ) : null}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, style]}
          {...input}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

type SelectProps = {
  label: string;
  icon: IconName;
  placeholder: string;
  value?: string;
  options: string[];
  onChange: (v: string) => void;
  required?: boolean;
  optional?: boolean;
  error?: string;
  disabled?: boolean;
};

export function Select({
  label,
  icon,
  placeholder,
  value,
  options,
  onChange,
  required,
  optional,
  error,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.group}>
      <Label text={label} required={required} optional={optional} />
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[styles.box, !!error && styles.boxError, disabled && { opacity: 0.55 }]}
      >
        <Ionicons name={icon} size={22} color={Colors.navy} />
        <Text style={[styles.input, !value && { color: Colors.textMuted }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={22} color={Colors.navy} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.navy} />
            </Pressable>
          </View>
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
                {o === value ? <Ionicons name="checkmark" size={20} color={Colors.goldDark} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

/** Multi-select dropdown that shows chosen items as removable chips. */
export function MultiSelect({
  label,
  icon,
  placeholder,
  values,
  options,
  onChange,
  required,
  optional,
  error,
}: Omit<SelectProps, "value" | "onChange" | "disabled"> & {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const toggle = (o: string) => onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
  return (
    <View style={styles.group}>
      <Label text={label} required={required} optional={optional} />
      <Pressable onPress={() => setOpen(true)} style={[styles.box, !!error && styles.boxError]}>
        <Ionicons name={icon} size={22} color={Colors.navy} />
        <Text style={[styles.input, !values.length && { color: Colors.textMuted }]} numberOfLines={1}>
          {values.length ? `${values.length} selected` : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={22} color={Colors.navy} />
      </Pressable>
      {values.length ? (
        <View style={styles.chips}>
          {values.map((v) => (
            <Pressable key={v} style={styles.chip} onPress={() => toggle(v)}>
              <Text style={styles.chipText}>{v}</Text>
              <Ionicons name="close" size={14} color={Colors.goldDark} />
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((o) => {
              const on = values.includes(o);
              return (
                <Pressable key={o} style={styles.option} onPress={() => toggle(o)}>
                  <Text style={[styles.optionText, on && styles.optionOn]}>{o}</Text>
                  <Ionicons
                    name={on ? "checkbox" : "square-outline"}
                    size={22}
                    color={on ? Colors.goldDark : Colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Picks an image from the library, enforcing the 2MB limit shown in the UI. */
export function usePickImage(onPicked: (uri: string) => void) {
  return async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access to upload an image.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
      Alert.alert("Image too large", "Please choose an image smaller than 2MB.");
      return;
    }
    onPicked(asset.uri);
  };
}

export function UploadCard({
  uri,
  onPick,
  circle,
  title,
  lines,
}: {
  uri?: string;
  onPick: () => void;
  circle: ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <View style={styles.uploadRow}>
      <Pressable onPress={onPick} style={styles.avatarRing}>
        {uri ? <Image source={{ uri }} style={styles.avatarImg} /> : circle}
      </Pressable>
      <View style={styles.uploadInfo}>
        <Text style={styles.uploadTitle}>{title}</Text>
        {lines.map((l) => (
          <Text key={l} style={styles.uploadLine}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: 16 },
  label: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginBottom: 8 },
  req: { color: Colors.error },
  opt: { fontFamily: Fonts.regular },
  box: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  boxError: { borderColor: Colors.error },
  input: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 16, paddingVertical: 0 },
  prefix: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 16 },
  sep: { width: 1, height: 20, backgroundColor: Colors.border },
  error: { color: Colors.error, fontFamily: Fonts.regular, fontSize: 12, marginTop: 4 },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    maxHeight: "65%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  done: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 16 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 16 },
  optionOn: { fontFamily: Fonts.bold },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FBF1D6",
  },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  uploadRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.champagne,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 76, height: 76, borderRadius: 38 },
  uploadInfo: {
    flex: 1,
    backgroundColor: "#FBF3E6",
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 4,
  },
  uploadTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  uploadLine: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
});
