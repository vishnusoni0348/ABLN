import { AvailablePill, Chip, GoldBtn, OutlineBtn, StatsRow, TopBar } from "@/components/expert-ui";
import { Avatar, CARD_SHADOW, GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findExpert, type Expert } from "@/data/experts";
import { recordSent } from "@/lib/connection-store";
import { toggleRequest, useDirectory } from "@/lib/directory-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TABS = ["About", "Expertise", "Experience", "Reviews"] as const;
type Tab = (typeof TABS)[number];

const MEMBER_PERKS = ["View complete profile and experience", "See areas of expertise", "Check availability (Free / Paid advice)", "Ask questions and book consultations"];

export default function ExpertProfile() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const e = findExpert(name);
  const { requested } = useDirectory();

  if (!e) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Expert not found</Text>
        <OutlineBtn label="Go back" onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24 }} />
      </View>
    );
  }

  const m = e.member;
  const isRequested = requested.includes(m.name);
  const connect = () => {
    if (!isRequested) {
      toggleRequest(m.name);
      recordSent(m.name);
    }
    router.push({ pathname: "/connection-sent", params: { name: m.name } });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {m.restricted ? (
        <Limited e={e} top={insets.top} bottom={insets.bottom} requested={isRequested} onConnect={connect} />
      ) : (
        <Full e={e} top={insets.top} bottom={insets.bottom} requested={isRequested} onConnect={connect} />
      )}
    </View>
  );
}

type Props = { e: Expert; top: number; bottom: number; requested: boolean; onConnect: () => void };

function Full({ e, top, bottom, requested, onConnect }: Props) {
  const m = e.member;
  const [tab, setTab] = useState<Tab>("About");
  const ask = () => router.push({ pathname: "/ask-expert", params: { name: m.name } });

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottom + 24 }}>
        <View>
          <Image source={require("../../assets/images/network-hero-banner.jpg")} style={[styles.cover, { height: 120 + top }]} resizeMode="cover" />
          <LinearGradient colors={["rgba(255,255,255,0)", Colors.white]} style={styles.coverFade} />
        </View>

        <View style={styles.body}>
          <View style={styles.identity}>
            <View style={styles.avatarRing}>
              <Avatar name={m.name} photo={m.photo} size={86} />
              {m.verified ? (
                <View style={styles.badge}>
                  <Ionicons name="ribbon" size={11} color={Colors.white} />
                </View>
              ) : null}
            </View>
            <AvailablePill available={e.available} />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{m.name}</Text>
            {m.verified ? <Ionicons name="checkmark-circle" size={18} color={Colors.gold} /> : null}
          </View>
          <Text style={styles.role}>{m.role}</Text>
          <Text style={styles.role}>{m.company}</Text>
          <View style={styles.loc}>
            <Ionicons name="location" size={13} color={Colors.goldDark} />
            <Text style={styles.locText}>{m.location}, {m.country}</Text>
          </View>

          <View style={styles.actions}>
            <View style={styles.flex}>
              <GoldBtn label="Ask a Question" icon="chatbubble-outline" onPress={ask} />
            </View>
            <OutlineBtn label={requested ? "Requested" : "Connect"} icon="person-add-outline" onPress={onConnect} style={styles.flex} />
          </View>

          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
                <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {tab === "About" ? (
            <>
              <Text style={styles.h2}>About Me</Text>
              <Text style={styles.para}>{e.about}</Text>
              <Text style={styles.h2}>Areas of Expertise</Text>
              <View style={styles.chips}>
                {e.areas.map((a) => (
                  <Chip key={a}>{a}</Chip>
                ))}
              </View>
              <View style={{ marginTop: 18 }}>
                <StatsRow expert={e} />
              </View>
            </>
          ) : null}

          {tab === "Expertise" ? (
            <>
              <Text style={styles.h2}>Areas of Expertise</Text>
              <View style={styles.chips}>
                {e.areas.map((a) => (
                  <Chip key={a}>{a}</Chip>
                ))}
              </View>
              <Text style={styles.h2}>Industry</Text>
              <View style={styles.chips}>
                <Chip>{m.industry}</Chip>
              </View>
            </>
          ) : null}

          {tab === "Experience" ? (
            <>
              <Text style={styles.h2}>Experience</Text>
              {e.experience.map((x) => (
                <View key={`${x.title}-${x.org}`} style={styles.card}>
                  <Text style={styles.cardTitle}>{x.title}</Text>
                  <Text style={styles.cardSub}>{x.org}</Text>
                  <Text style={styles.cardMeta}>{x.period}</Text>
                </View>
              ))}
            </>
          ) : null}

          {tab === "Reviews" ? (
            <>
              <Text style={styles.h2}>Reviews</Text>
              {e.reviews.length === 0 ? <Text style={styles.para}>No reviews yet.</Text> : null}
              {e.reviews.map((r) => (
                <View key={r.by} style={styles.card}>
                  <View style={styles.reviewHead}>
                    <Text style={styles.cardTitle}>{r.by}</Text>
                    <View style={styles.stars}>
                      <Ionicons name="star" size={13} color={Colors.gold} />
                      <Text style={styles.cardMeta}>{r.rating}.0</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSub}>{r.text}</Text>
                </View>
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>
      <View style={[styles.topOverlay, { top }]}>
        <TopBar member={m} />
      </View>
    </>
  );
}

function Limited({ e, top, bottom, requested, onConnect }: Props) {
  const m = e.member;
  const basics: { icon: IconName; text: string }[] = [
    { icon: "briefcase-outline", text: `${e.yearsExp}+ Years Experience` },
    { icon: "document-text-outline", text: m.industry },
    { icon: "location-outline", text: `${m.city}, ${m.country}` },
  ];
  return (
    <>
      <LinearGradient colors={["#FDF3DC", Colors.white]} style={[StyleSheet.absoluteFill, { height: 260 }]} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: top + 56, paddingBottom: bottom + 24, paddingHorizontal: 16 }}>
        <View style={styles.lAvatar}>
          {m.photo ? (
            <Image source={m.photo} style={styles.lPhoto} blurRadius={14} />
          ) : (
            <View style={[styles.lPhoto, styles.lPlaceholder]}>
              <Ionicons name="person" size={56} color={Colors.textMuted} />
            </View>
          )}
          <View style={styles.lock}>
            <Ionicons name="lock-closed" size={14} color={Colors.goldDark} />
          </View>
        </View>
        <Text style={[styles.name, styles.centerText]}>{m.name}</Text>
        <Text style={[styles.role, styles.centerText, { color: Colors.textSecondary }]}>{m.role}</Text>
        <Text style={[styles.role, styles.centerText, { color: Colors.textSecondary }]}>{m.company}</Text>

        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Ionicons name="lock-closed" size={18} color={Colors.goldDark} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>This expert has limited profile visibility.</Text>
            <Text style={styles.noticeText}>Some information is available to ABLN members only.</Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <GoldBtn label={requested ? "Request Sent" : "Connect to View Full Profile"} icon="lock-closed" onPress={onConnect} disabled={requested} />
        </View>

        <View style={[styles.card, styles.perks]}>
          <Text style={styles.cardTitle}>As a member, you can:</Text>
          {MEMBER_PERKS.map((p) => (
            <View key={p} style={styles.perkRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.perkText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          {basics.map((b) => (
            <View key={b.icon} style={styles.perkRow}>
              <Ionicons name={b.icon} size={17} color={Colors.navy} />
              <Text style={styles.perkText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.topOverlay, { top }]}>
        <TopBar member={m} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center" },
  centerText: { textAlign: "center" },
  topOverlay: { position: "absolute", left: 0, right: 0 },

  cover: { width: "100%" },
  coverFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 50 },
  body: { paddingHorizontal: 16, marginTop: -50 },
  identity: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  avatarRing: { width: 98, height: 98, borderRadius: 49, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
  badge: { position: "absolute", right: 2, bottom: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.gold, borderWidth: 2, borderColor: Colors.white, alignItems: "center", justifyContent: "center" },

  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  role: { color: "#2F6FDE", fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
  loc: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },

  actions: { flexDirection: "row", gap: 10, marginTop: 16 },

  tabs: { flexDirection: "row", marginTop: 18, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: Colors.gold },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  tabTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },

  h2: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 18 },
  para: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

  card: { marginTop: 12, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.white, ...CARD_SHADOW },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  cardSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 3 },
  cardMeta: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 11, marginTop: 3 },
  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stars: { flexDirection: "row", alignItems: "center", gap: 3 },

  // Limited state
  lAvatar: { alignSelf: "center", width: 100, height: 100, marginBottom: 10 },
  lPhoto: { width: 100, height: 100, borderRadius: 50 },
  lPlaceholder: { backgroundColor: "#EEF1F5", alignItems: "center", justifyContent: "center" },
  lock: { position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
  notice: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, marginTop: 18, borderRadius: Radius.md, backgroundColor: "#FDF3DC" },
  noticeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  noticeText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  perks: { backgroundColor: "#F3F7FD" },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  perkText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
});
