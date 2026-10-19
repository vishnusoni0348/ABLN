import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

export function OnlineDot({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.dot, style]} />;
}

/** Themed destructive confirmation, used in place of the native Alert. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />
        <View style={styles.dialog}>
          <View style={styles.iconWrap}>
            <Ionicons name="trash-outline" size={26} color={Colors.error} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{message}</Text>
          <View style={styles.actions}>
            <View style={styles.action}>
              <Pressable onPress={onCancel} style={({ pressed }) => [styles.btn, styles.cancel, pressed && styles.pressed]} accessibilityRole="button">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
            <View style={styles.action}>
              <Pressable onPress={onConfirm} style={({ pressed }) => [styles.btn, styles.confirm, pressed && styles.pressed]} accessibilityRole="button">
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dot: { width: 13, height: 13, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  backdrop: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 22, alignItems: "center" },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FDE8E8", alignItems: "center", justifyContent: "center" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18, marginTop: 14, textAlign: "center" },
  body: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: "center" },
  actions: { flexDirection: "row", gap: 10, marginTop: 20, alignSelf: "stretch" },
  action: { flex: 1 },
  btn: { height: 46, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  cancel: { backgroundColor: "#EEF1F5" },
  cancelText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  confirm: { backgroundColor: Colors.error },
  confirmText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  pressed: { opacity: 0.85 },
});
