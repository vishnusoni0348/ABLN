import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

/** Row of five stars, filled up to `value`. */
export function StarRow({ value, size = 32 }: { value: number; size?: number }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= value ? "star" : "star-outline"} size={size} color={n <= value ? Colors.gold : "#D9C28A"} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", gap: 8, justifyContent: "center", fontFamily: Fonts.regular } });
