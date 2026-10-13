import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function OrDivider() {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>OR</Text>
      <View style={styles.orLine} />
    </View>
  );
}

export function GoogleButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
      <Ionicons name="logo-google" size={22} color="#DB4437" />
      <Text style={styles.text}>Continue with Google</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 22 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 14 },
  btn: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 22,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 17 },
  pressed: { opacity: 0.85 },
});
