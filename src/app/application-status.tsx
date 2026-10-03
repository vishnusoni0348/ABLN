import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type State = "done" | "current" | "pending";

const STEPS: { title: string; desc: string; state: State }[] = [
  { title: "Application Submitted", desc: "Completed", state: "done" },
  { title: "Under Review", desc: "Our team is reviewing your application.", state: "current" },
  { title: "More Information Required", desc: "(If needed)", state: "pending" },
  { title: "Approved", desc: "You will receive an email notification.", state: "pending" },
  { title: "Payment Pending", desc: "Complete your membership payment.", state: "pending" },
  { title: "Active", desc: "Access all ABLN features.", state: "pending" },
  { title: "Rejected", desc: "You will be notified with reasons.", state: "pending" },
];

export default function ApplicationStatus() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/white-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={Colors.navy} />
          </Pressable>
          <Text style={styles.title}>Application Status</Text>
        </View>

        <View style={styles.list}>
          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1;
            return (
              <View key={s.title} style={styles.row}>
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.dot,
                      s.state === "done" && styles.dotDone,
                      s.state === "current" && styles.dotCurrent,
                    ]}
                  >
                    {s.state === "done" ? (
                      <Ionicons name="checkmark" size={18} color={Colors.white} />
                    ) : (
                      <Text style={[styles.dotNum, s.state === "current" && styles.dotNumCurrent]}>{i + 1}</Text>
                    )}
                  </View>
                  {!last ? <View style={[styles.connector, s.state === "done" && styles.connectorDone]} /> : null}
                </View>
                <Pressable
                  disabled={s.title !== "Approved"}
                  onPress={() => router.push("/membership-approved")}
                  style={[styles.item, s.state === "current" && styles.itemCurrent]}
                >
                  <Text style={[styles.itemTitle, s.state === "pending" && styles.itemTitlePending]}>{s.title}</Text>
                  <Text style={styles.itemDesc}>{s.desc}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  header: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  back: { position: "absolute", left: 0 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  list: { marginTop: 28 },
  row: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: 36 },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF1F5",
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  dotCurrent: { backgroundColor: Colors.goldDark, borderColor: Colors.goldDark },
  dotNum: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 15 },
  dotNumCurrent: { color: Colors.white },
  connector: { flex: 1, width: 1.5, backgroundColor: Colors.border, marginVertical: 4 },
  connectorDone: { backgroundColor: Colors.success },
  item: {
    flex: 1,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemCurrent: { backgroundColor: "#FDF4E0", borderColor: Colors.champagne },
  itemTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  itemTitlePending: { fontFamily: Fonts.semiBold },
  itemDesc: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, marginTop: 2 },
});
