import { WideBtn } from "@/components/ask-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const NEXT: { icon: IconName; text: string }[] = [
  { icon: "rocket-outline", text: "Your question is published in the Ask Network." },
  { icon: "people-outline", text: "Relevant experts and members can answer your question." },
  { icon: "notifications-outline", text: "You will be notified when you receive new answers." },
  { icon: "share-social-outline", text: "You can also share the question with specific experts." },
];

export default function AskSubmitted() {
  const insets = useSafeAreaInsets();
  const edited = !!useLocalSearchParams<{ edited?: string }>().edited;
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{edited ? "Question Updated" : "Question Submitted"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.halo}>
          <Ionicons name="paper-plane" size={64} color={Colors.gold} />
          <View style={styles.check}>
            <Ionicons name="checkmark" size={20} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.title}>{edited ? "Your Question Has Been Updated!" : "Your Question Has Been Posted!"}</Text>
        <Text style={styles.lead}>{edited ? "Your changes are saved and now visible on the Ask Network." : "Your question is now visible to the ABLN network. Experts and members will start sharing their insights soon."}</Text>

        <View style={styles.next}>
          <Text style={styles.nextTitle}>What happens next?</Text>
          {NEXT.map((n) => (
            <View key={n.text} style={styles.nextRow}>
              <View style={styles.nextIcon}>
                <Ionicons name={n.icon} size={16} color={Colors.goldDark} />
              </View>
              <Text style={styles.nextText}>{n.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <WideBtn label="View Question" onPress={() => router.replace("/ask-network")} style={styles.full} />
        <WideBtn label="Ask Another Question" outline onPress={() => router.replace("/ask-question")} style={styles.full} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { height: 52, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  scroll: { paddingHorizontal: 16, paddingBottom: 16 },
  halo: { alignSelf: "center", width: 140, height: 140, borderRadius: 70, backgroundColor: "#FDF3DA", alignItems: "center", justifyContent: "center", marginTop: 16 },
  check: { position: "absolute", right: 12, bottom: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: Colors.white },
  title: { textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, marginTop: 20 },
  lead: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 8, paddingHorizontal: 8 },
  next: { marginTop: 22, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FDF8EA", gap: 12 },
  nextTitle: { textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  nextIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  nextText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  footer: { gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  full: { flex: 0 },
});
