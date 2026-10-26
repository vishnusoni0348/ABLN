import { StarRow } from "@/components/feedback-ui";
import { GoldButton, OutlineBtn, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { categoryOf, useFeedbackList } from "@/lib/feedback-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function FeedbackSuccess() {
  const latest = useFeedbackList()[0];
  const cat = latest ? categoryOf(latest.category) : null;

  return (
    <SettingsScreen
      title="Feedback"
      footer={
        <>
          <GoldButton label="Back to Home" onPress={() => router.replace("/home")} />
          <OutlineBtn label="View My Feedback" icon="document-text-outline" onPress={() => router.replace("/my-feedback")} />
        </>
      }
    >
      <View style={styles.hero}>
        <View style={styles.halo}>
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={56} color={Colors.white} />
          </View>
        </View>
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Thank You for{"\n"}Your Feedback!</Text>
        <Text style={styles.sub}>Your feedback has been submitted successfully. It helps us make ABLN better for everyone.</Text>
      </View>

      {latest && cat ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your rating</Text>
          <StarRow value={latest.rating} />
          <View style={styles.divider} />
          <View style={styles.cat}>
            <Ionicons name={cat.icon} size={18} color={Colors.goldDark} />
            <Text style={styles.catText}>{cat.label}</Text>
          </View>
        </View>
      ) : null}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingTop: 12 },
  halo: { width: 160, height: 160, borderRadius: 80, backgroundColor: "#FEF6E6", alignItems: "center", justifyContent: "center" },
  badge: { width: 112, height: 112, borderRadius: 56, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 6, borderColor: Colors.goldLight },
  titleBlock: { alignItems: "center", gap: 10, paddingHorizontal: 8 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 34, textAlign: "center" },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, textAlign: "center" },
  card: { alignItems: "center", gap: 12, padding: 16, borderRadius: Radius.lg, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5" },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  divider: { alignSelf: "stretch", height: 1, backgroundColor: "#EEF1F5" },
  cat: { flexDirection: "row", alignItems: "center", gap: 8 },
  catText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
});
