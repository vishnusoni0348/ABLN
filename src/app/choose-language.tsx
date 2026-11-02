import { CARD_SHADOW } from "@/components/member-ui";
import { GoldButton, RadioDot, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { LANGUAGES, useSettings } from "@/lib/profile-store";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ChooseLanguage() {
  const { language } = useSettings();
  const [selected, setSelected] = useState<string>(language);

  // Picking the language that is already active needs no confirmation.
  const next = () => (selected === language ? router.back() : router.push({ pathname: "/change-language", params: { lang: selected } }));

  return (
    <SettingsScreen title="Choose Language" footer={<GoldButton label="Continue" onPress={next} />}>
      <Text style={styles.sub}>Select your preferred language.</Text>
      {LANGUAGES.map((l) => {
        const on = l.label === selected;
        return (
          <Pressable key={l.label} onPress={() => setSelected(l.label)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[styles.row, on && styles.rowOn]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{l.badge}</Text>
            </View>
            <Text style={[styles.label, on && { fontFamily: Fonts.bold }]}>{l.label}</Text>
            <RadioDot on={on} />
          </Pressable>
        );
      })}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5", ...CARD_SHADOW },
  rowOn: { borderColor: "#BFD3F5", backgroundColor: "#EEF4FE" },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EEF2FA", alignItems: "center", justifyContent: "center" },
  badgeText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  label: { flex: 1, color: Colors.navy, fontFamily: Fonts.medium, fontSize: 16 },
});
