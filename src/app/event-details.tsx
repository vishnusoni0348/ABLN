import { EventThumb, GoingRow, SaveEventButton } from "@/components/event-ui";
import { Avatar } from "@/components/member-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS, type AppEvent, availability, calendarUrl, eventAttendees, eventDetails, formatEventDate, isRegistrationOpen } from "@/data/events";
import { cancelRegistration, useEvents } from "@/lib/event-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];
const TABS = ["About", "Agenda", "Speakers", "Organiser"] as const;
type Tab = (typeof TABS)[number];

function Info({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.info}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={Colors.goldDark} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function EventDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { registrations } = useEvents();
  const [tab, setTab] = useState<Tab>("About");
  const [confirmCancel, setConfirmCancel] = useState(false);

  const e: AppEvent | undefined = EVENTS.find((x) => x.id === id);
  if (!e) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Pressable onPress={() => router.back()} style={[styles.round, { marginTop: insets.top + 8, marginLeft: 16 }]} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
        </Pressable>
        <Text style={styles.none}>This event is no longer available.</Text>
      </View>
    );
  }

  const d = eventDetails(e);
  const attendees = eventAttendees(e);
  const openAttendees = () => router.push({ pathname: "/event-attendees", params: { id: e.id } });
  const registered = registrations.some((r) => r.eventId === e.id);
  const open = isRegistrationOpen(e);
  const share = () => Share.share({ message: `${e.title} — ${formatEventDate(e.date)}, ${e.time}, ${e.location}` });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Modal visible={confirmCancel} transparent animationType="fade" onRequestClose={() => setConfirmCancel(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.alert}>
              <Ionicons name="alert" size={30} color={Colors.error} />
            </View>
            <Text style={styles.dialogTitle}>Cancel Registration?</Text>
            <Text style={styles.dialogText}>Are you sure you want to cancel your registration for this event?{"\n"}Your seat will be released for others.</Text>
            <Pressable style={({ pressed }) => [styles.keep, pressed && styles.pressed]} onPress={() => setConfirmCancel(false)} accessibilityRole="button">
              <Text style={styles.keepText}>Keep Registration</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.yes, pressed && styles.pressed]}
              onPress={() => {
                cancelRegistration(e.id);
                setConfirmCancel(false);
              }}
              accessibilityRole="button"
            >
              <Text style={styles.yesText}>Yes, Cancel Registration</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View>
          <EventThumb event={e} style={styles.hero} />
          <View style={styles.heroShade} />
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.round} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={22} color={Colors.navy} />
            </Pressable>
            <View style={styles.heroActions}>
              <SaveEventButton id={e.id} floating />
              <Pressable onPress={share} style={styles.round} accessibilityRole="button" accessibilityLabel="Share event">
                <Ionicons name="share-outline" size={20} color={Colors.navy} />
              </Pressable>
            </View>
          </View>
          <View style={styles.heroBody}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{e.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{e.title}</Text>
            <View style={styles.heroMeta}>
              <Ionicons name="calendar-outline" size={15} color={Colors.champagne} />
              <Text style={styles.heroMetaText}>{formatEventDate(e.date)}</Text>
              <Ionicons name="time-outline" size={15} color={Colors.champagne} style={styles.gapL} />
              <Text style={styles.heroMetaText}>{e.time}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Ionicons name="location-outline" size={15} color={Colors.champagne} />
              <Text style={styles.heroMetaText}>{e.location}</Text>
            </View>
            <View style={styles.goingWrap}>
              <GoingRow count={e.going} light />
            </View>
          </View>
        </View>

        <View style={styles.sheet}>
          {attendees.length ? (
            <Pressable style={styles.attending} onPress={openAttendees} accessibilityRole="button" accessibilityLabel={`${e.going} members attending. View all`}>
              <View style={styles.strip}>
                {attendees.slice(0, 5).map((m, i) => (
                  <View key={m.name} style={[styles.stripAvatar, i > 0 && styles.stripOverlap]}>
                    <Avatar name={m.name} photo={m.photo} size={32} />
                  </View>
                ))}
              </View>
              <Text style={styles.attendingText}>{e.going > 5 ? `+${e.going - 5} attending` : "Attending"}</Text>
              <Text style={styles.viewAll}>View all</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.goldDark} />
            </Pressable>
          ) : null}
          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
                <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {tab === "About" ? (
            <View style={styles.pane}>
              <Text style={styles.paneTitle}>About This Event</Text>
              <Text style={styles.body}>{d.about}</Text>
              <View style={styles.grid}>
                <Info icon="clipboard-outline" label="Event Type" value={e.type} />
                <Info icon="people-outline" label="Event Category" value={e.category} />
                <Info icon="briefcase-outline" label="Target Audience" value={d.audience} />
                <Info icon="shirt-outline" label="Dress Code" value={d.dress} />
              </View>
              {d.speakers.length ? (
                <View style={styles.aboutSpeakers}>
                  <View style={styles.aboutSpeakersHead}>
                    <Text style={styles.paneTitle}>Speakers</Text>
                    <Pressable onPress={() => setTab("Speakers")} hitSlop={8} accessibilityRole="button">
                      <Text style={styles.viewAll}>View all</Text>
                    </Pressable>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.speakerCards}>
                    {d.speakers.map((s) => (
                      <Pressable key={s.name} style={styles.speakerCard} onPress={() => setTab("Speakers")} accessibilityRole="button" accessibilityLabel={`${s.name}, ${s.role}`}>
                        <Avatar name={s.name} photo={s.photo} size={56} />
                        <Text style={styles.speakerCardName} numberOfLines={1}>{s.name}</Text>
                        <Text style={styles.infoLabel} numberOfLines={2}>{s.role}</Text>
                        <Text style={styles.speakerCardTopic} numberOfLines={2}>{s.topic}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
              <Text style={styles.seatsNote}>{e.when === "Past" ? "This event has ended." : `${availability(e)} · ${e.registered} / ${e.seats} seats booked`}</Text>
            </View>
          ) : null}

          {tab === "Agenda" ? (
            <View style={styles.pane}>
              <Text style={styles.paneTitle}>Agenda</Text>
              {d.agenda.map((a) => (
                <View key={a.title} style={styles.agendaRow}>
                  <Text style={styles.agendaTime}>{a.time}</Text>
                  <Text style={styles.agendaTitle}>{a.title}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "Speakers" ? (
            <View style={styles.pane}>
              <Text style={styles.paneTitle}>Speakers</Text>
              {d.speakers.map((s) => (
                <View key={s.name} style={styles.speaker}>
                  <Avatar name={s.name} photo={s.photo} size={56} />
                  <View style={styles.flex}>
                    <Text style={styles.agendaTitle}>{s.name}</Text>
                    <Text style={styles.infoLabel}>{s.role}</Text>
                    <View style={styles.topic}>
                      <Ionicons name="mic-outline" size={13} color={Colors.goldDark} />
                      <Text style={styles.topicText}>{s.topic}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "Organiser" ? (
            <View style={styles.pane}>
              <Text style={styles.paneTitle}>{d.organiser.name}</Text>
              <Text style={styles.body}>{d.organiser.about}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {registered ? (
          <>
            <Pressable style={({ pressed }) => [styles.footBtn, styles.footOutline, pressed && styles.pressed]} onPress={() => Linking.openURL(calendarUrl(e))} accessibilityRole="button">
              <Text style={styles.footOutlineText}>Add to Calendar</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.footBtn, styles.footDanger, pressed && styles.pressed]} onPress={() => setConfirmCancel(true)} accessibilityRole="button">
              <Text style={styles.footDangerText}>Cancel Registration</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            disabled={!open}
            style={({ pressed }) => [styles.flex, (pressed || !open) && styles.pressed]}
            onPress={() => router.push({ pathname: "/event-register", params: { id: e.id } })}
            accessibilityRole="button"
          >
            <LinearGradient colors={open ? GOLD_GRADIENT : ["#D5D8E6", "#D5D8E6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <Text style={styles.ctaText}>{open ? "Register for Event" : e.when === "Past" ? "Event Ended" : "Registration Closed"}</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },

  hero: { height: 400, borderRadius: 0 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,18,37,0.55)" },
  heroBar: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  heroBody: { position: "absolute", left: 20, right: 20, bottom: 40, gap: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: Colors.champagne },
  badgeText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12 },
  heroTitle: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 34 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetaText: { color: Colors.white, fontFamily: Fonts.regular, fontSize: 13 },
  gapL: { marginLeft: 8 },
  goingWrap: { marginTop: 4 },

  sheet: { marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Colors.white, paddingHorizontal: 16, paddingTop: 6 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: Colors.goldDark },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  tabTextOn: { color: Colors.navy, fontFamily: Fonts.bold },

  pane: { paddingTop: 16, gap: 12 },
  paneTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  body: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 14, padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5" },
  info: { width: "50%", flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 8 },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  infoLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  infoValue: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  seatsNote: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  agendaRow: { flexDirection: "row", gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  agendaTime: { width: 70, color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  agendaTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  speaker: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  topic: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  topicText: { flex: 1, color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  aboutSpeakers: { gap: 10 },
  aboutSpeakersHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  speakerCards: { gap: 12 },
  speakerCard: { width: 150, gap: 4, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5" },
  speakerCardName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, marginTop: 6 },
  speakerCardTopic: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 11, marginTop: 2 },

  attending: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  strip: { flexDirection: "row" },
  stripAvatar: { borderRadius: 18, borderWidth: 2, borderColor: Colors.white },
  stripOverlap: { marginLeft: -10 },
  attendingText: { flex: 1, color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  viewAll: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  footer: { paddingHorizontal: 16, paddingTop: 12, flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  cta: { height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  footBtn: { flex: 1, height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  footOutline: { borderColor: Colors.gold, backgroundColor: Colors.white },
  footOutlineText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
  footDanger: { borderColor: Colors.error, backgroundColor: Colors.white },
  footDangerText: { color: Colors.error, fontFamily: Fonts.bold, fontSize: 14 },

  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 20, alignItems: "center", gap: 10 },
  alert: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FDECEC", alignItems: "center", justifyContent: "center" },
  dialogTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, marginTop: 6 },
  dialogText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 8 },
  keep: { alignSelf: "stretch", height: 46, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.error, alignItems: "center", justifyContent: "center" },
  keepText: { color: Colors.error, fontFamily: Fonts.bold, fontSize: 14 },
  yes: { alignSelf: "stretch", height: 46, borderRadius: Radius.sm, backgroundColor: Colors.error, alignItems: "center", justifyContent: "center" },
  yesText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
});
