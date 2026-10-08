import { Avatar, CARD_SHADOW, GOLD_BG, Tag } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember, type Member } from "@/data/members";
import { recordSent, useConnections } from "@/lib/connection-store";
import { toggleRequest, useDirectory } from "@/lib/directory-store";
import { useLiveIntroTo } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const BLUE = "#2F6FDE";
const MAX_NOTE = 300;

function GoldButton({ label, onPress, icon, style }: { label: string; onPress: () => void; icon?: IconName; style?: object }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && styles.pressed]} accessibilityRole="button">
      <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {icon ? <Ionicons name={icon} size={16} color={Colors.white} /> : null}
        <Text style={styles.btnGoldText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function OutlineButton({ label, onPress, style }: { label: string; onPress: () => void; style?: object }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, styles.btnOutline, style, pressed && styles.pressed]} accessibilityRole="button">
      <Text style={styles.btnOutlineText}>{label}</Text>
    </Pressable>
  );
}

function Section({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={18} color={Colors.goldDark} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <>
      {items.map((t) => (
        <View key={t} style={styles.chip}>
          <Text style={styles.chipText}>{t}</Text>
        </View>
      ))}
    </>
  );
}

function InfoCard({ icon, tint, title, lines, onPress, style }: { icon: IconName; tint: string; title: string; lines: string[]; onPress?: () => void; style?: object }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.infoCard, style]}>
      <View style={[styles.infoIcon, { backgroundColor: tint + "22" }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.infoTitle}>{title}</Text>
        {lines.map((l) => (
          <Text key={l} style={styles.infoLine} numberOfLines={2}>
            {l}
          </Text>
        ))}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} /> : null}
    </Pressable>
  );
}

function Header({ onMore }: { onMore: () => void }) {
  return (
    <>
      <Pressable onPress={() => router.back()} hitSlop={12} style={[styles.roundBtn, styles.roundLeft]} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={22} color={Colors.navy} />
      </Pressable>
      <Pressable onPress={onMore} hitSlop={12} style={[styles.roundBtn, styles.roundRight]} accessibilityRole="button" accessibilityLabel="More options">
        <Ionicons name="ellipsis-horizontal" size={20} color={Colors.navy} />
      </Pressable>
    </>
  );
}

export default function MemberProfile() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const member = findMember(name);
  const { requested } = useDirectory();
  const activeIntro = useLiveIntroTo(name ?? "");
  const { connections } = useConnections();
  const [sheet, setSheet] = useState(false);
  const [note, setNote] = useState("");

  if (!member) {
    return (
      <View style={[styles.container, styles.missing, { paddingTop: insets.top }]}>
        <Text style={styles.infoTitle}>Member not found</Text>
        <OutlineButton label="Go back" onPress={() => router.back()} style={{ marginTop: 16, paddingHorizontal: 24 }} />
      </View>
    );
  }

  const isRequested = requested.includes(member.name);
  const introLabel = activeIntro ? "Introduction Status" : "Request Introduction";
  const intro = () =>
    activeIntro ? router.push({ pathname: "/introduction-details", params: { id: activeIntro.id } }) : router.push({ pathname: "/request-introduction", params: { name: member.name } });
  const share = () => Share.share({ message: `${member.name} - ${member.role}, ${member.company} on ABLN` }).catch(() => {});
  const closeSheet = () => setSheet(false);
  const send = () => {
    if (!isRequested) {
      toggleRequest(member.name);
      recordSent(member.name);
    }
    setNote("");
    closeSheet();
    router.push({ pathname: "/connection-sent", params: { name: member.name } });
  };
  const cancelRequest = () =>
    Alert.alert("Cancel connection request?", `Your request to ${member.name} will be withdrawn.`, [
      { text: "Keep Request", style: "cancel" },
      { text: "Cancel Request", style: "destructive", onPress: () => toggleRequest(member.name) },
    ]);
  const onConnect = () => (isRequested ? cancelRequest() : setSheet(true));
  const report = () => {
    closeSheet();
    Alert.alert("Report / Block", `What would you like to do with ${member.name}?`, [
      { text: "Report", onPress: () => Alert.alert("Thanks", "Your report has been submitted.") },
      { text: "Block", style: "destructive" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const actions: { icon: IconName; title: string; sub: string; onPress: () => void; danger?: boolean }[] = [
    { icon: "people-outline", title: activeIntro ? "View Introduction Status" : "Request an Introduction", sub: activeIntro ? "Track or cancel your introduction request" : "Ask for an introduction through mutual connections", onPress: () => { closeSheet(); intro(); } },
    { icon: "card-outline", title: "View Digital Business Card", sub: "View and share contact details", onPress: () => { closeSheet(); if (connections.some((c) => c.name === member.name)) router.push({ pathname: "/business-card", params: { name: member.name } }); else Alert.alert("Digital Business Card", "Available once your connection request is accepted."); } },
    { icon: "bulb-outline", title: "Ask for Advice", sub: "Get free or paid advice from this expert", onPress: () => { closeSheet(); router.push({ pathname: member.restricted ? "/expert-profile" : "/expert-card", params: { name: member.name } }); } },
    { icon: "paper-plane-outline", title: "Share Profile", sub: "Share via WhatsApp, Email or Copy Link", onPress: () => { closeSheet(); share(); } },
    { icon: "ban-outline", title: "Report / Block", sub: "Report this profile or block this member", onPress: report, danger: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Modal visible={sheet} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={styles.backdrop} onPress={closeSheet} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Connect with {member.name}?</Text>
          <Text style={styles.sheetSub}>Send a connection request to build a professional relationship.</Text>
          <View style={styles.noteBox}>
            <TextInput
              value={note}
              onChangeText={setNote}
              maxLength={MAX_NOTE}
              multiline
              placeholder="Add a personal message (optional)..."
              placeholderTextColor={Colors.textMuted}
              style={styles.noteInput}
            />
            <Text style={styles.noteCount}>
              {note.length}/{MAX_NOTE}
            </Text>
          </View>
          {isRequested ? (
            <OutlineButton label="Cancel Connection Request" onPress={() => { closeSheet(); cancelRequest(); }} style={{ marginTop: 14 }} />
          ) : (
            <GoldButton label="Send Connection Request" icon="paper-plane-outline" onPress={send} style={{ marginTop: 14 }} />
          )}
          <View style={styles.actions}>
            {actions.map((a) => (
              <Pressable key={a.title} style={styles.actionRow} onPress={a.onPress}>
                <View style={[styles.actionIcon, a.danger && styles.actionIconDanger]}>
                  <Ionicons name={a.icon} size={18} color={a.danger ? Colors.error : BLUE} />
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.actionTitle, a.danger && { color: Colors.error }]}>{a.title}</Text>
                  <Text style={styles.actionSub}>{a.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.cancel} onPress={closeSheet} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      {member.restricted ? (
        <RestrictedProfile member={member} top={insets.top} requested={isRequested} onConnect={onConnect} onIntro={intro} introLabel={introLabel} onMore={() => setSheet(true)} />
      ) : (
        <FullProfile member={member} top={insets.top} requested={isRequested} onConnect={onConnect} onIntro={intro} introLabel={introLabel} onShare={share} onMore={() => setSheet(true)} />
      )}
    </View>
  );
}

function FullProfile({ member: m, top, requested, onConnect, onIntro, introLabel, onShare, onMore }: { member: Member; top: number; requested: boolean; onConnect: () => void; onIntro: () => void; introLabel: string; onShare: () => void; onMore: () => void }) {
  const [city] = m.location.split(", ");
  const about = m.about ?? `${m.role} at ${m.company}, working in ${m.industry}. Open to collaborations, partnerships and new opportunities.`;
  const markets = m.markets ?? [m.country];
  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View>
          <Image source={require("../../assets/images/network-hero-banner.jpg")} style={[styles.cover, { height: 120 + top }]} resizeMode="cover" />
          <LinearGradient colors={["rgba(255,255,255,0)", Colors.white]} style={styles.coverFade} />
        </View>

        <View style={styles.body}>
          <View style={styles.identityRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                <Avatar name={m.name} photo={m.photo} size={92} />
              </View>
              <View style={styles.badgeGold}>
                <Ionicons name="ribbon" size={12} color={Colors.goldDark} />
              </View>
              <View style={styles.online} />
            </View>
            <View style={styles.sideBtns}>
              {requested ? <OutlineButton label="Cancel Request" onPress={onConnect} /> : <GoldButton label="Connect" onPress={onConnect} />}
              <OutlineButton label={introLabel === "Request Introduction" ? "Request Intro" : "Intro Status"} onPress={onIntro} />
              <OutlineButton label="Share" onPress={onShare} />
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{m.name}</Text>
              {m.verified ? <Ionicons name="checkmark-circle" size={20} color={BLUE} /> : null}
            </View>
            <Text style={styles.role}>{m.role}</Text>
            <Text style={styles.role}>{m.company}</Text>
            <View style={styles.locRow}>
              <Ionicons name="location" size={13} color={Colors.goldDark} />
              <Text style={styles.loc}>{m.location}{m.country === city ? "" : `, ${m.country}`}</Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            {m.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </View>

          <Text style={styles.h2}>About</Text>
          <Text style={styles.about}>{about}</Text>

          <InfoCard icon="business-outline" tint={Colors.goldDark} title="Business Details" lines={[m.company, `${m.industry} Services & Consulting`]} onPress={() => {}} style={styles.mt} />
          <View style={styles.pair}>
            <InfoCard icon="stats-chart-outline" tint={BLUE} title="Industry" lines={[m.industry]} style={styles.flex} />
            <InfoCard icon="location-outline" tint={Colors.error} title="Location" lines={[city, m.country]} style={styles.flex} />
          </View>

          <Section icon="clipboard-outline" title="Expertise">
            <Chips items={m.expertise} />
          </Section>
          <Section icon="locate-outline" title="Looking For">
            <Chips items={m.lookingFor} />
          </Section>
          <Section icon="hand-right-outline" title="Can Offer">
            <Chips items={m.canOffer} />
          </Section>
          <Section icon="globe-outline" title="Countries / Markets">
            <Chips items={markets} />
          </Section>
        </View>
      </ScrollView>
      <Header onMore={onMore} />
    </>
  );
}

function RestrictedProfile({ member: m, top, requested, onConnect, onIntro, introLabel, onMore }: { member: Member; top: number; requested: boolean; onConnect: () => void; onIntro: () => void; introLabel: string; onMore: () => void }) {
  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: top + 56 }]}>
        <View style={styles.rBody}>
          <View style={styles.rAvatar}>
            {m.photo ? (
              <Image source={m.photo} style={styles.rPhoto} blurRadius={14} />
            ) : (
              <View style={[styles.rPhoto, styles.rPlaceholder]}>
                <Ionicons name="person" size={56} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color={Colors.goldDark} />
            </View>
          </View>
          <View style={[styles.nameRow, { justifyContent: "center" }]}>
            <Text style={styles.name}>{m.name}</Text>
            {m.verified ? <Ionicons name="ribbon" size={14} color={Colors.gold} /> : null}
          </View>
          <Text style={styles.rRole}>{m.role}</Text>
          <Text style={styles.rRole}>{m.company}</Text>

          <View style={styles.notice}>
            <View style={styles.noticeIcon}>
              <Ionicons name="lock-closed" size={18} color={Colors.goldDark} />
            </View>
            <Text style={styles.noticeText}>This member has limited profile visibility. You can view basic information, Connect with them to see their full profile and contact details.</Text>
          </View>

          <View style={styles.rBtns}>
            {requested ? <OutlineButton label="Cancel Request" onPress={onConnect} style={styles.flex} /> : <GoldButton label="Connect" onPress={onConnect} style={styles.flex} />}
            <OutlineButton label={introLabel} onPress={onIntro} style={styles.flex} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>
            {([
              ["person-outline", m.role],
              ["business-outline", m.company],
              ["location-outline", `${m.city}, ${m.country}`],
              ["briefcase-outline", m.industry],
            ] as [IconName, string][]).map(([icon, text]) => (
              <View key={icon} style={styles.basicRow}>
                <Ionicons name={icon} size={17} color={Colors.navy} />
                <Text style={styles.basicText}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.basicRow}>
              <Ionicons name="lock-closed-outline" size={17} color={Colors.navy} />
              <Text style={styles.cardTitle}>Professional Summary</Text>
            </View>
            <View style={[styles.skel, { width: "100%" }]} />
            <View style={[styles.skel, { width: "92%" }]} />
            <View style={[styles.skel, { width: "60%" }]} />
          </View>

          <View style={styles.unlock}>
            <View style={styles.unlockIcon}>
              <Ionicons name="lock-closed" size={22} color={Colors.goldDark} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.infoTitle}>Connect to Unlock Full Profile</Text>
              <Text style={styles.unlockText}>Send a connection request to view complete information, contact details and business insights.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Header onMore={onMore} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.85 },
  container: { flex: 1, backgroundColor: Colors.white },
  missing: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 40 },

  roundBtn: { position: "absolute", top: 48, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.9)" },
  roundLeft: { left: 16 },
  roundRight: { right: 16 },

  cover: { width: "100%" },
  coverFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 50 },
  body: { paddingHorizontal: 16, marginTop: -56 },
  identityRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", height: 104, zIndex: 1 },
  avatarWrap: { width: 104, height: 104 },
  avatarRing: { width: 104, height: 104, borderRadius: 52, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
  badgeGold: { position: "absolute", top: 4, right: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  online: { position: "absolute", bottom: 8, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  sideBtns: { width: 120, gap: 8, marginTop: 44 },

  btn: { height: 36, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 12 },
  btnGoldText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 13 },
  btnOutline: { borderWidth: 1, borderColor: Colors.gold, backgroundColor: Colors.white },
  btnOutlineText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  details: { marginTop: 6, paddingRight: 130 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  role: { color: BLUE, fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  loc: { color: Colors.goldDark, fontFamily: Fonts.regular, fontSize: 12 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },

  h2: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 20 },
  about: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 6 },
  mt: { marginTop: 14 },
  pair: { flexDirection: "row", gap: 10, marginTop: 10 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5" },
  infoIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  infoTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  infoLine: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },

  section: { marginTop: 18 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { backgroundColor: "#FBF3E0", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },

  // Restricted
  rBody: { paddingHorizontal: 16, alignItems: "stretch" },
  rAvatar: { alignSelf: "center", width: 100, height: 100, marginBottom: 10 },
  rPhoto: { width: 100, height: 100, borderRadius: 50 },
  rPlaceholder: { backgroundColor: "#EEF1F5", alignItems: "center", justifyContent: "center" },
  lockBadge: { position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
  rRole: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", marginTop: 2 },
  notice: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, marginTop: 18, borderRadius: Radius.md, backgroundColor: "#FDF3DC" },
  noticeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  noticeText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16 },
  rBtns: { flexDirection: "row", gap: 10, marginTop: 14 },
  card: { marginTop: 14, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.white, ...CARD_SHADOW },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  basicRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  basicText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  skel: { height: 10, borderRadius: 5, backgroundColor: "#EEF1F5", marginTop: 12 },
  unlock: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14, padding: 14, borderRadius: Radius.md, backgroundColor: "#FDF3DC" },
  unlockIcon: { width: 46, height: 46, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  unlockText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },

  // Connect sheet
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 14 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  sheetSub: { color: BLUE, fontFamily: Fonts.regular, fontSize: 12, marginTop: 4 },
  noteBox: { marginTop: 14, minHeight: 84, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  noteInput: { minHeight: 48, padding: 0, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, textAlignVertical: "top" },
  noteCount: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11 },
  actions: { marginTop: 12 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  actionIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAF1FC", alignItems: "center", justifyContent: "center" },
  actionIconDanger: { backgroundColor: "#FCEBEB" },
  actionTitle: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  actionSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  cancel: { height: 46, marginTop: 14, borderRadius: Radius.md, backgroundColor: Colors.softWhite, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
});
