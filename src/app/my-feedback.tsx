import { StarRow } from "@/components/feedback-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { GoldButton, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { categoryOf, useFeedbackList } from "@/lib/feedback-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function MyFeedback() {
  const list = useFeedbackList();

  return (
    <SettingsScreen title="My Feedback" footer={<GoldButton label="Share More Feedback" onPress={() => router.replace("/feedback")} />}>
      {list.length === 0 ? (
        <Text style={styles.empty}>You haven&apos;t shared any feedback yet.</Text>
      ) : (
        list.map((f) => {
          const cat = categoryOf(f.category);
          return (
            <View key={f.id} style={styles.card}>
              <View style={styles.top}>
                <View style={styles.cat}>
                  <Ionicons name={cat.icon} size={16} color={Colors.goldDark} />
                  <Text style={styles.catText}>{cat.label}</Text>
                </View>
                <Text style={styles.date}>{f.date}</Text>
              </View>
              <StarRow value={f.rating} size={20} />
              {f.comment ? <Text style={styles.comment}>{f.comment}</Text> : null}
            </View>
          );
        })
      )}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, paddingVertical: 40 },
  card: { gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cat: { flexDirection: "row", alignItems: "center", gap: 6 },
  catText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  date: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  comment: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
});
