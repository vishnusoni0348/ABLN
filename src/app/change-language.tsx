import { ScreenHeader } from "@/components/member-ui";
import { GoldButton, OutlineBtn } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { LANGUAGES, setLanguage } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangeLanguage() {
  const insets = useSafeAreaInsets();
  const { lang } = useLocalSearchParams<{ lang?: string }>();
  const target = LANGUAGES.find((l) => l.label === lang);

  const confirm = () => {
    if (target) setLanguage(target.label);
    router.dismiss(2);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <ScreenHeader title="Change Language" />
      </View>
      <View style={styles.body}>
        <View style={styles.halo}>
          <Ionicons name="globe-outline" size={72} color={Colors.gold} />
        </View>
        <Text style={styles.title}>Change Language?</Text>
        <Text style={styles.msg}>
          Your app language will be changed to <Text style={styles.name}>{target?.label ?? "the selected language"}</Text>.
        </Text>
        <Text style={styles.note}>You can change this anytime in Settings.</Text>
      </View>
      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <GoldButton label="Confirm Change" onPress={confirm} disabled={!target} />
        <OutlineBtn label="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 10 },
  halo: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, textAlign: "center" },
  msg: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 18, lineHeight: 26, textAlign: "center" },
  name: { color: Colors.navy, fontFamily: Fonts.bold },
  note: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 6 },
  actions: { paddingHorizontal: 16, gap: 12 },
});
