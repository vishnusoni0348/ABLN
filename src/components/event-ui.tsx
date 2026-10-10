import { CARD_SHADOW } from "@/components/member-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { type AppEvent, type Availability, type EventCategory, availability, formatEventDate, isRegistrationOpen } from "@/data/events";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { Animated, Image, ImageSourcePropType, Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Placeholder artwork per category until event photos come from the API.
const ART: Record<EventCategory, { icon: IconName; colors: [string, string] }> = {
  Networking: { icon: "people-outline", colors: ["#0B2A4A", "#2B5C94"] },
  Workshop: { icon: "construct-outline", colors: ["#3A2A08", "#B88618"] },
  Conference: { icon: "business-outline", colors: ["#2C2160", "#6B5BC2"] },
  Webinar: { icon: "videocam-outline", colors: ["#1E3A5F", "#4A7FB5"] },
  Meetup: { icon: "cafe-outline", colors: ["#0F3D3E", "#2E8B84"] },
  "Panel Discussion": { icon: "mic-outline", colors: ["#4A1D3A", "#A04A82"] },
  "Business Dinner": { icon: "restaurant-outline", colors: ["#3D1F1A", "#A8553F"] },
  Training: { icon: "school-outline", colors: ["#173B2A", "#3E8E62"] },
  Other: { icon: "calendar-outline", colors: ["#2B3440", "#64748B"] },
};

const AVATARS = [require("../../assets/images/member-amit.png"), require("../../assets/images/member-priya.png"), require("../../assets/images/member-rahul.png")];

const STATUS_COLOR: Record<Availability, string> = { "Seats Available": Colors.success, "Almost Full": "#F08A1C", Full: Colors.error, Closed: Colors.error };

export const openEvent = (id: string) => router.push({ pathname: "/event-details", params: { id } });

// Real photos by event id; events without one fall back to the category artwork.
const PHOTOS: Record<string, ImageSourcePropType> = { e1: require("../../assets/images/event-conference.jpg") };

export function EventThumb({ event, style }: { event: Pick<AppEvent, "id" | "category">; style?: StyleProp<ViewStyle> }) {
  const photo = PHOTOS[event.id];
  const art = ART[event.category];
  return (
    <LinearGradient colors={art.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.thumb, style]}>
      {photo ? <ExpoImage source={photo} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" transition={150} /> : <Ionicons name={art.icon} size={36} color="rgba(255,255,255,0.85)" />}
    </LinearGradient>
  );
}

function Badge({ children, tone = "gold" }: { children: string; tone?: "gold" | "blue" }) {
  return (
    <View style={[styles.badge, tone === "blue" && styles.badgeBlue]}>
      <Text style={[styles.badgeText, tone === "blue" && styles.badgeTextBlue]}>{children}</Text>
    </View>
  );
}

function Meta({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={12} color={Colors.goldDark} />
      <Text style={styles.metaText} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export function GoingRow({ count, light }: { count: number; light?: boolean }) {
  return (
    <View style={styles.going}>
      <View style={styles.avatars}>
        {AVATARS.map((src, i) => (
          <Image key={i} source={src} style={[styles.avatar, i > 0 && styles.avatarOverlap]} />
        ))}
      </View>
      <Text style={[styles.goingText, light && { color: Colors.white }]}>{`${count} going`}</Text>
    </View>
  );
}

// Visual affordance only: the whole card is the tap target.
export function GoButton() {
  return (
    <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.go}>
      <Ionicons name="arrow-forward" size={16} color={Colors.white} />
    </LinearGradient>
  );
}

// Registration status chip under the event info: "Upcoming", "Registration Open" or "Registration Closed".
function StatusPill({ e }: { e: AppEvent }) {
  const [label, color, bg] = e.when === "Past" ? ["Past", Colors.textSecondary, "#EEF1F5"] : isRegistrationOpen(e) ? ["Registration Open", Colors.success, "#E8F7EF"] : ["Registration Closed", Colors.error, "#FDECEC"];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function CapacityBar({ e }: { e: AppEvent }) {
  const a = availability(e);
  const color = a === "Closed" ? Colors.textMuted : STATUS_COLOR[a];
  const pct = Math.min(100, Math.round((e.registered / e.seats) * 100));
  return (
    <View style={styles.capacity}>
      <View style={styles.capacityTop}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.seats}>{`${e.registered} / ${e.seats} seats`}</Text>
      </View>
      <Text style={[styles.capacityLabel, { color: a === "Closed" ? Colors.textSecondary : color }]}>{a === "Closed" ? (e.when === "Past" ? "Event ended" : "Registration Closed") : a === "Full" ? "Fully Booked" : a}</Text>
    </View>
  );
}

const typeBadges = (e: AppEvent) => (
  <View style={styles.badges}>
    <Badge>{e.category}</Badge>
    <Badge tone="blue">{e.type}</Badge>
  </View>
);

function CardInfo({ e }: { e: AppEvent }) {
  return (
    <>
      {typeBadges(e)}
      <Text style={styles.title} numberOfLines={2}>
        {e.title}
      </Text>
      <Meta icon="calendar-outline">{formatEventDate(e.date)}</Meta>
      <Meta icon="time-outline">{e.time}</Meta>
      <Meta icon="location-outline">{e.location}</Meta>
    </>
  );
}

// Large card for the listing's "Featured Event": full-width photo banner on top, details below.
export function FeaturedEventCard({ e, onPress }: { e: AppEvent; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress ?? (() => openEvent(e.id))} style={({ pressed }) => [styles.card, CARD_SHADOW, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={e.title}>
      <EventThumb event={e} style={styles.bigBanner} />
      <View style={styles.body}>
        <CardInfo e={e} />
        <View style={styles.footer}>
          <GoingRow count={e.going} />
          <GoButton />
        </View>
      </View>
    </Pressable>
  );
}

// Listing card. `capacity` swaps the "going" avatars for the seats progress bar and registration status.
export function EventCard({ e, capacity, onPress }: { e: AppEvent; capacity?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress ?? (() => openEvent(e.id))} style={({ pressed }) => [styles.card, CARD_SHADOW, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={e.title}>
      <EventThumb event={e} style={styles.banner} />
      <View style={styles.body}>
        <CardInfo e={e} />
        <View style={styles.footer}>
          {capacity ? (
            <View style={styles.flex}>
              <CapacityBar e={e} />
            </View>
          ) : (
            <>
              <GoingRow count={e.going} />
              <StatusPill e={e} />
            </>
          )}
          <GoButton />
        </View>
      </View>
    </Pressable>
  );
}

// Pulsing placeholder rows for the loading state.
export function EventSkeleton({ rows = 3 }: { rows?: number }) {
  const [opacity] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true })]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.skeleton} accessibilityLabel="Loading events" accessibilityRole="progressbar">
      {Array.from({ length: rows }, (_, i) => (
        <Animated.View key={i} style={[styles.skelRow, { opacity }]}>
          <View style={styles.skelThumb} />
          <View style={styles.skelLines}>
            <View style={[styles.skelLine, { width: "85%" }]} />
            <View style={[styles.skelLine, { width: "60%" }]} />
            <View style={[styles.skelLine, { width: "40%" }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// Dark pill toggle used for Upcoming/Past and the All/Upcoming/Past result tabs.
export function PillTabs<T extends string>({ options, selected, onSelect, labels }: { options: readonly T[]; selected: T; onSelect: (o: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <View style={styles.tabs}>
      {options.map((o) => {
        const on = o === selected;
        return (
          <Pressable key={o} onPress={() => onSelect(o)} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.tabText, on && styles.tabTextOn]}>{labels?.[o] ?? o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Tappable row that opens a bottom sheet of options.
export function SheetSelect({ icon, placeholder, title, value, options, onChange }: { icon: IconName; placeholder: string; title: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const label = options.find((o) => o.value === value)?.label ?? value;
  return (
    <View>
      <Pressable style={styles.select} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={title}>
        <Ionicons name={icon} size={18} color={Colors.navy} />
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {value ? label : placeholder}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.navy} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((o) => {
              const on = o.value === value;
              return (
                <Pressable
                  key={o.value || "any"}
                  style={styles.option}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, on && styles.optionOn]}>{o.label}</Text>
                  {on ? <Ionicons name="checkmark" size={18} color={Colors.goldDark} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 10 },
  tab: { height: 38, paddingHorizontal: 20, borderRadius: 19, backgroundColor: "#F1F4FA", alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: Colors.navy },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 12 },
  tabTextOn: { color: Colors.white, fontFamily: Fonts.bold },

  select: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  selectText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  selectPlaceholder: { color: Colors.textSecondary },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, maxHeight: "70%" },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#D5D8E6", marginBottom: 12 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginBottom: 4 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  optionOn: { fontFamily: Fonts.bold, color: Colors.goldDark },

  pressed: { opacity: 0.85 },
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: 12 },

  thumb: { alignItems: "center", justifyContent: "center", borderRadius: Radius.md, overflow: "hidden" },
  bigBanner: { height: 170, borderRadius: 0 },
  banner: { height: 140, borderRadius: 0 },
  body: { padding: 12 },

  badges: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: "#FDF0D2" },
  badgeBlue: { backgroundColor: "#EAF0FA" },
  badgeText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 10 },
  badgeTextBlue: { color: Colors.royalNavy },

  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 19, marginTop: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  metaText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },

  card: { borderRadius: Radius.lg, backgroundColor: Colors.white, overflow: "hidden" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12 },

  going: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatars: { flexDirection: "row" },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.white },
  avatarOverlap: { marginLeft: -8 },
  goingText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 11 },
  go: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },

  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.sm },
  pillText: { fontFamily: Fonts.semiBold, fontSize: 10 },

  capacity: { gap: 5 },
  capacityTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#E6EAF0", overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  seats: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 10 },
  capacityLabel: { fontFamily: Fonts.semiBold, fontSize: 11 },

  skeleton: { gap: 14 },
  skelRow: { flexDirection: "row", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: "#F3F5F9" },
  skelThumb: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: "#E3E7EE" },
  skelLines: { flex: 1, justifyContent: "center", gap: 8 },
  skelLine: { height: 10, borderRadius: 5, backgroundColor: "#E3E7EE" },
});
