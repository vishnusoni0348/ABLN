import { AvailablePill, Chip, GoldBtn, OutlineBtn, StatsRow, TopBar } from "@/components/expert-ui";
import { Avatar } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findExpert, rupees } from "@/data/experts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExpertCard() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const e = findExpert(name);

  if (!e) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.name}>Expert not found</Text>
        <OutlineBtn label="Go back" onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24 }} />
      </View>
    );
  }
  const m = e.member;
  const open = () => router.push({ pathname: "/expert-profile", params: { name: m.name } });
  const ask = () => router.push({ pathname: "/ask-expert", params: { name: m.name } });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient colors={["#FDF3DC", Colors.white]} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: insets.top }}>
        <TopBar member={m} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.avatarWrap}>
          <Avatar name={m.name} photo={m.photo} size={116} />
          {m.verified ? (
            <View style={styles.badge}>
              <Ionicons name="ribbon" size={14} color={Colors.white} />
            </View>
          ) : null}
          <View style={styles.pill}>
            <AvailablePill available={e.available} />
          </View>
        </View>

        <Text style={styles.name}>{m.name}</Text>
        <Text style={styles.role}>{m.role}</Text>
        <Text style={styles.role}>{m.company}</Text>
        <View style={styles.loc}>
          <Ionicons name="location" size={13} color={Colors.goldDark} />
          <Text style={styles.locText}>{m.location}, {m.country}</Text>
        </View>

        <View style={styles.block}>
          <StatsRow expert={e} />
        </View>

        <View style={styles.chips}>
          {e.areas.slice(0, 4).map((a) => (
            <Chip key={a}>{a}</Chip>
          ))}
        </View>

        <View style={styles.advice}>
          <View style={[styles.adviceCard, { backgroundColor: "#E4F6EC" }]}>
            <View style={[styles.adviceIcon, { backgroundColor: Colors.success }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.white} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.adviceTitle}>Free Advice</Text>
              <Text style={[styles.adviceSub, { color: Colors.success }]}>{e.freeAdvice ? "Available" : "Not offered"}</Text>
            </View>
          </View>
          <View style={[styles.adviceCard, { backgroundColor: "#FDF3DC" }]}>
            <View style={[styles.adviceIcon, { backgroundColor: Colors.gold }]}>
              <Text style={styles.rupee}>{"₹"}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.adviceTitle}>Paid Advice</Text>
              <Text style={styles.adviceSub}>{e.paidPrice ? `${rupees(e.paidPrice)} / ${e.paidMinutes} min` : "Not offered"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quote}>
          <Ionicons name="people" size={20} color={Colors.gold} />
          <Text style={styles.quoteText}>{e.tagline}</Text>
        </View>

        <GoldBtn label="Ask a Question" icon="chatbubble-outline" onPress={ask} />
        <View style={{ height: 12 }} />
        <OutlineBtn label="View Full Profile" icon="document-text-outline" onPress={open} style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16, alignItems: "stretch" },

  avatarWrap: { alignSelf: "center", width: 116, height: 116, marginTop: 4 },
  badge: { position: "absolute", right: 2, bottom: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.gold, borderWidth: 2, borderColor: Colors.white, alignItems: "center", justifyContent: "center" },
  pill: { position: "absolute", right: -92, top: 20 },

  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24, textAlign: "center", marginTop: 14 },
  role: { color: "#2F6FDE", fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 2 },
  loc: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 8 },
  locText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },

  block: { marginTop: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },

  advice: { flexDirection: "row", gap: 10, marginTop: 16 },
  adviceCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: Radius.md },
  adviceIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  rupee: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 20 },
  adviceTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  adviceSub: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 11, marginTop: 2 },

  quote: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginVertical: 16, borderRadius: Radius.md, backgroundColor: "#FDF3DC" },
  quoteText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
});
