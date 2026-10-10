import { EventThumb } from "@/components/event-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS, calendarUrl, formatEventDate } from "@/data/events";
import { setEvents } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.action, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={20} color={Colors.royalNavy} />
      <Text style={styles.actionText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.navy} />
    </Pressable>
  );
}

export default function EventRegistered() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = EVENTS.find((x) => x.id === id);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.replace("/events")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={Colors.navy} />
        </Pressable>
        <Text style={styles.topTitle}>Registration Successful</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 16 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.art}>
          <View style={styles.halo}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={48} color={Colors.white} />
            </View>
          </View>
        </View>
        <Text style={styles.title}>You&apos;re Registered!</Text>
        <Text style={styles.sub}>Your registration for this event{"\n"}has been confirmed.</Text>

        {e ? (
          <>
            <View style={styles.card}>
              <EventThumb event={e} style={styles.thumb} />
              <View style={styles.flex}>
                <Text style={styles.eventTitle}>{e.title}</Text>
                <Text style={styles.meta}>{formatEventDate(e.date)}</Text>
                <Text style={styles.meta}>{e.time}</Text>
                <Text style={styles.meta}>{e.location}</Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Registered</Text>
                </View>
              </View>
            </View>

            <Action icon="calendar-outline" label="Add to Calendar" onPress={() => Linking.openURL(calendarUrl(e))} />
            <Action icon="document-text-outline" label="View My Registrations" onPress={() => {
          setEvents({ tab: "Registered" });
          router.replace("/events");
        }} />
            <Action icon="share-social-outline" label="Share Event" onPress={() => Share.share({ message: `${e.title} — ${formatEventDate(e.date)}, ${e.time}, ${e.location}` })} />
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={() => router.replace("/events")} style={({ pressed }) => pressed && styles.pressed} accessibilityRole="button">
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>Explore More Events</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  topTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  scroll: { paddingHorizontal: 16, gap: 12 },

  art: { alignItems: "center", marginTop: 24 },
  halo: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#DDF3E8", alignItems: "center", justifyContent: "center" },
  check: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, textAlign: "center", marginTop: 8 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, textAlign: "center", marginBottom: 8 },

  card: { flexDirection: "row", gap: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5" },
  thumb: { width: 100, height: 112 },
  eventTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 19 },
  meta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 4 },
  pill: { alignSelf: "flex-start", marginTop: 8, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.sm, backgroundColor: "#E8F7EF" },
  pillText: { color: Colors.success, fontFamily: Fonts.semiBold, fontSize: 12 },

  action: { flexDirection: "row", alignItems: "center", gap: 12, height: 52, paddingHorizontal: 14, borderRadius: Radius.sm, borderWidth: 1, borderColor: "#EEF1F5" },
  actionText: { flex: 1, color: Colors.navy, fontFamily: Fonts.medium, fontSize: 14 },

  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: Colors.white },
  cta: { height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
