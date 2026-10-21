import { CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleProp, StyleSheet, Switch, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const SOFT_GOLD = "#FEF6E6";

/** Standard screen frame: pinned header, scrolling body and an optional pinned footer. */
export function SettingsScreen({ title, right, children, footer }: { title: string; right?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <ScreenHeader title={title} right={right} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: footer ? 16 : insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

export function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={styles.h}>{title}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

export function GoldButton({ label, onPress, disabled, style }: { label: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} style={[disabled && { opacity: 0.5 }, style]}>
      <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        <Text style={styles.btnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** Compact gold action for the header's right slot. */
export function HeaderSave({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Save" style={styles.headerSave}>
      <Text style={styles.headerSaveText}>Save</Text>
    </Pressable>
  );
}

export function InfoBanner({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <View style={styles.banner}>
      <Ionicons name="information-circle" size={20} color="#2F6FED" />
      <View style={{ flex: 1 }}>
        {title ? <Text style={styles.bannerTitle}>{title}</Text> : null}
        <Text style={styles.bannerText}>{children}</Text>
      </View>
    </View>
  );
}

export function SolidButton({ label, onPress, disabled, color = Colors.error, style }: { label: string; onPress: () => void; disabled?: boolean; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} style={[styles.btn, { backgroundColor: color }, disabled && { opacity: 0.5 }, style]}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

export function OutlineBtn({ label, onPress, color = Colors.navy, icon, style }: { label: string; onPress: () => void; color?: string; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.btn, styles.outline, { paddingHorizontal: 10 }, { borderColor: color }, style]}>
      {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.outlineText, { color, flexShrink: 1 }]}>{label}</Text>
    </Pressable>
  );
}

export function IconCircle({ icon, color = Colors.navy, size = 40 }: { icon: IconName; color?: string; size?: number }) {
  return (
    <View style={[styles.iconCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name={icon} size={size / 2 + 1} color={color} />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function MenuRow({ icon, title, sub, onPress, value, danger, badge }: { icon: IconName; title: string; sub?: string; onPress: () => void; value?: string; danger?: boolean; badge?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
      <IconCircle icon={icon} color={danger ? Colors.error : Colors.navy} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && { color: Colors.error }]}>{title}</Text>
        {sub ? <Text style={styles.rowSub} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.rowBadge}>
          <Text style={styles.rowBadgeText}>{badge}</Text>
        </View>
      ) : null}
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

export function ToggleRow({ icon, title, sub, value, onChange }: { icon: IconName; title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <IconCircle icon={icon} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub} numberOfLines={2}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#D9E0E8", true: Colors.gold }}
        thumbColor={Colors.white}
        accessibilityLabel={title}
      />
    </View>
  );
}

export function RadioCard({ icon, title, sub, on, onPress }: { icon?: IconName; title: string; sub?: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[styles.row, styles.radioCard, on && styles.radioCardOn]}>
      {icon ? <IconCircle icon={icon} color={on ? Colors.goldDark : Colors.navy} /> : null}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <RadioDot on={on} />
    </Pressable>
  );
}

export function RadioDot({ on }: { on: boolean }) {
  return <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioInner} /> : null}</View>;
}

export function ChipList({ items, tone = "blue" }: { items: string[]; tone?: "blue" | "gold" }) {
  return (
    <View style={styles.chips}>
      {items.map((i) => (
        <View key={i} style={[styles.chip, tone === "gold" && { backgroundColor: "#FBF1D6" }]}>
          <Text style={styles.chipText}>{i}</Text>
        </View>
      ))}
    </View>
  );
}

export function SegmentTabs<T extends string>({ tabs, value, onChange }: { tabs: { key: T; label: string; icon?: IconName }[]; value: T; onChange: (k: T) => void }) {
  return (
    <View style={styles.segment}>
      {tabs.map((t) => {
        const on = t.key === value;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[styles.segItem, on && styles.segOn]}>
            {t.icon ? <Ionicons name={t.icon} size={18} color={on ? Colors.goldLight : Colors.textSecondary} /> : null}
            <Text style={[styles.segText, on && styles.segTextOn]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Bottom sheet used for pickers and quick edit prompts. */
export function BottomSheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior="padding">
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={Colors.navy} />
            </Pressable>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Centered confirmation dialog with a success badge, message, optional reference chip and a single action. */
export function SuccessDialog({ visible, title, message, reference, actionLabel = "Done", onAction }: { visible: boolean; title: string; message: string; reference?: string; actionLabel?: string; onAction: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAction}>
      <View style={[styles.backdrop, styles.dialogWrap]}>
        <View style={styles.dialog}>
          <View style={styles.dialogHalo}>
            <View style={styles.dialogBadge}>
              <Ionicons name="checkmark" size={34} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMsg}>{message}</Text>
          {reference ? (
            <View style={styles.dialogRef}>
              <Text style={styles.dialogRefLabel}>Reference ID</Text>
              <Text style={styles.dialogRefValue}>#{reference}</Text>
            </View>
          ) : null}
          <GoldButton label={actionLabel} onPress={onAction} style={{ alignSelf: "stretch", marginTop: 6 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerSave: { backgroundColor: Colors.gold, borderRadius: Radius.md, paddingHorizontal: 18, height: 38, alignItems: "center", justifyContent: "center" },
  headerSaveText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  banner: { flexDirection: "row", gap: 10, backgroundColor: "#EAF1FD", borderRadius: Radius.md, padding: 14, alignItems: "flex-start" },
  bannerTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, marginBottom: 2 },
  bannerText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  dialogWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  dialog: { width: "100%", maxWidth: 360, backgroundColor: Colors.white, borderRadius: Radius.xl, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22, alignItems: "center", gap: 10 },
  dialogHalo: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#E6F6EF", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  dialogBadge: { width: 62, height: 62, borderRadius: 31, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center" },
  dialogTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, textAlign: "center" },
  dialogMsg: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, textAlign: "center" },
  dialogRef: { alignSelf: "stretch", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: SOFT_GOLD, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 },
  dialogRefLabel: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  dialogRefValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 6, gap: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: "#EEF1F5", gap: 10 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 4 },
  btn: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  btnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  outline: { borderWidth: 1.5, backgroundColor: Colors.white },
  outlineText: { fontFamily: Fonts.bold, fontSize: 15 },
  iconCircle: { backgroundColor: "#F2F5FA", alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, ...CARD_SHADOW },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  rowSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  rowBadge: { backgroundColor: "#FBF1D6", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  rowBadgeText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 11 },
  rowValue: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  radioCard: { borderWidth: 1, borderColor: "#EEF1F5", shadowOpacity: 0, elevation: 0 },
  radioCardOn: { borderColor: Colors.gold, backgroundColor: SOFT_GOLD },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.goldDark, backgroundColor: Colors.gold },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#EEF2FA", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  segment: { flexDirection: "row", backgroundColor: "#EEF2FA", borderRadius: Radius.md, padding: 4 },
  segItem: { flex: 1, height: 38, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  segOn: { backgroundColor: Colors.navy },
  segText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 13 },
  segTextOn: { color: Colors.white },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingHorizontal: 20, paddingTop: 18, gap: 12 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
});
