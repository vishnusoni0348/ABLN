import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const LABELS = ["Personal\nDetails", "Business\nDetails", "Business\nProfile", "Visibility"];

export function Stepper({ current }: { current: number }) {
  return (
    <View style={styles.row}>
      {LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={styles.item}>
            <View style={styles.circleRow}>
              <View style={[styles.line, i === 0 && styles.hidden, i <= current && styles.lineOn]} />
              <View style={[styles.circle, done && styles.circleDone, active && styles.circleActive]}>
                {done ? (
                  <Ionicons name="checkmark" size={16} color={Colors.goldDark} />
                ) : (
                  <Text style={[styles.num, active && styles.numActive]}>{i + 1}</Text>
                )}
              </View>
              <View
                style={[styles.line, i === LABELS.length - 1 && styles.hidden, i < current && styles.lineOn]}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginTop: 20 },
  item: { flex: 1, alignItems: "center" },
  circleRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  line: { flex: 1, height: 1.5, backgroundColor: Colors.border },
  lineOn: { backgroundColor: Colors.champagne },
  hidden: { opacity: 0 },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF1F5",
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: { backgroundColor: "#FBF1D6", borderColor: "#F1DFA8" },
  circleActive: { backgroundColor: Colors.goldDark, borderColor: Colors.goldDark },
  num: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 15 },
  numActive: { color: Colors.white },
  label: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
  },
  labelActive: { color: Colors.navy, fontFamily: Fonts.bold },
});
