import { BusinessCardView } from "@/components/business-card";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { setCard, useBusinessCard, VISIBILITY_OPTIONS, Visibility } from "@/lib/card-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CardVisibility() {
  const insets = useSafeAreaInsets();
  const card = useBusinessCard();
  const [choice, setChoice] = useState<Visibility>(card.visibility);

  const save = () => {
    setCard({ visibility: choice });
    Alert.alert("Preferences saved", "Your card visibility has been updated.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Card Visibility" />
        <BusinessCardView card={card} compact />

        <View>
          <Text style={styles.h}>Profile Visibility</Text>
          <Text style={styles.sub}>Control who can view your business card and profile details.</Text>
        </View>

        {VISIBILITY_OPTIONS.map((o) => {
          const on = choice === o.key;
          return (
            <Pressable key={o.key} onPress={() => setChoice(o.key)} style={[styles.opt, on && styles.optOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <View style={styles.optIcon}>
                <Ionicons name={o.icon} size={20} color={on ? Colors.goldDark : Colors.royalNavy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>{o.title}</Text>
                <Text style={styles.optDesc}>{o.desc}</Text>
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
            </Pressable>
          );
        })}

        <Pressable onPress={save} accessibilityRole="button" style={{ marginTop: 6 }}>
          <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.save}>
            <Text style={styles.saveText}>Save Preferences</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, gap: 12 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17, marginTop: 8 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 4 },
  opt: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white },
  optOn: { borderColor: Colors.gold, backgroundColor: "#FEF6E6" },
  optIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F2F5FA", alignItems: "center", justifyContent: "center" },
  optTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  optDesc: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: Colors.goldDark, backgroundColor: Colors.gold },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  save: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  saveText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
