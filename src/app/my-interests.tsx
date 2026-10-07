import { StatusPill, TopBar } from "@/components/interest-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { OppThumb } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findOpp, formatDate } from "@/lib/opportunity-lookup";
import { useOpportunities } from "@/lib/opportunity-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyInterests() {
  const insets = useSafeAreaInsets();
  const { interests, mine } = useOpportunities();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TopBar title="My Interests" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {interests.length === 0 ? <Text style={styles.none}>You have not expressed interest in any opportunity yet.</Text> : null}
        {interests.map((i) => {
          const o = findOpp(i.oppId, mine);
          if (!o) return null;
          const label = i.status === "Pending" ? (o.closed ? "Closed" : "Under Review") : i.status;
          return (
            <Pressable key={i.id} style={[styles.card, CARD_SHADOW]} onPress={() => router.push({ pathname: "/interest-status", params: { id: i.id } })} accessibilityRole="button" accessibilityLabel={`Interest status for ${o.title}`}>
              <OppThumb category={o.category} uri={o.cover} size={72} />
              <View style={styles.flex}>
                <Text style={styles.title} numberOfLines={2}>
                  {o.title}
                </Text>
                <Text style={styles.meta}>{`Submitted ${formatDate(i.submittedAt)}`}</Text>
                <View style={styles.pill}>
                  <StatusPill status={label === "Under Review" ? "Pending" : label === "Declined" ? "Closed" : label} label={label} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 48 },
  card: { flexDirection: "row", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },
  pill: { alignSelf: "flex-start", marginTop: 6 },
});
