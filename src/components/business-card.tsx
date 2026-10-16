import { Avatar, CARD_SHADOW, Tag } from "@/components/member-ui";
import { QrCode } from "@/components/qr-code";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { BusinessCard as Card, cardLink } from "@/lib/card-store";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

const banner = require("../../assets/images/card-banner.png");
const cardBg = require("../../assets/images/card-bg.png");
const logo = require("../../assets/images/abln-logo.png");

function Banner({ height }: { height?: number }) {
  return (
    <View style={styles.banner}>
      <Image source={banner} style={{ width: "100%", height: height ?? 134 }} resizeMode={height ? "cover" : "stretch"} />
      <Image source={logo} style={styles.bannerLogo} resizeMode="contain" />
      <Text style={styles.tagline}>{"Connect\nCollaborate\nGrow"}</Text>
    </View>
  );
}

function CompactLine({ icon, text }: { icon: "call" | "mail" | "people-outline"; text: string }) {
  return (
    <View style={styles.loc}>
      <Ionicons name={icon} size={11} color={Colors.goldDark} />
      <Text style={styles.compactLoc} numberOfLines={1}>{text}</Text>
    </View>
  );
}

function ContactRow({ icon, text, last }: { icon: "call" | "mail" | "location"; text: string; last?: boolean }) {
  return (
    <View style={[styles.contactRow, !last && styles.contactDivider]}>
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={18} color={Colors.goldDark} />
      </View>
      <Text style={styles.contactText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

// Full profile card (screen 01); `compact` is the small header used on screens 02 and 04.
export function BusinessCardView({ card, compact }: { card: Card; compact?: boolean }) {
  if (compact) {
    return (
      <View style={[styles.card, styles.compact]}>
        <Banner height={130} />
        <View style={styles.compactBody}>
          <View style={styles.compactPhoto}>
            <Avatar name={card.name} photo={card.photo} size={60} />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{card.name}</Text>
            <Text style={styles.compactLine}>{card.role}</Text>
            <Text style={styles.compactLine}>{card.company}</Text>
            <View style={styles.loc}>
              <Ionicons name="location" size={11} color={Colors.goldDark} />
              <Text style={styles.compactLoc}>{card.location}</Text>
            </View>
            {card.chapter ? <CompactLine icon="people-outline" text={card.chapter} /> : null}
            {card.phone ? <CompactLine icon="call" text={card.phone} /> : null}
            {card.email ? <CompactLine icon="mail" text={card.email} /> : null}
          </View>
          <View style={styles.qrBox}>
            <QrCode value={cardLink(card)} size={78} />
            <Text style={styles.qrCap}>Connect on ABLN</Text>
          </View>
        </View>
      </View>
    );
  }
  const rows: { icon: "call" | "mail" | "location"; text: string }[] = [
    ...(card.phone ? [{ icon: "call" as const, text: card.phone }] : []),
    ...(card.email ? [{ icon: "mail" as const, text: card.email }] : []),
    { icon: "location" as const, text: card.location },
  ];
  return (
    <View style={[styles.card, styles.full]}>
      <Image source={cardBg} style={styles.fullBg} resizeMode="stretch" />
      <Image source={logo} style={styles.fullLogo} resizeMode="contain" />
      <View style={styles.fullTag}>
        <Text style={styles.fullTagText}>Connect</Text>
        <Text style={styles.fullTagText}>Collaborate</Text>
        <Text style={[styles.fullTagText, styles.fullTagGrow]}>Grow</Text>
        <View style={styles.fullTagLine} />
      </View>
      <View style={styles.fullPhoto}>
        <Avatar name={card.name} photo={card.photo} size={104} />
        <View style={styles.check}>
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        </View>
      </View>
      <View style={styles.fullQr}>
        <View style={styles.qrFrame}>
          <QrCode value={cardLink(card)} size={76} />
        </View>
        <Text style={styles.qrScanCap}>Scan to Connect</Text>
      </View>
      <View style={styles.fullBody}>
        <View style={styles.identity}>
          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.role}>{card.role}</Text>
          <Text style={styles.role}>{card.company}</Text>
          {card.chapter ? (
            <View style={styles.chapter}>
              <Ionicons name="people" size={14} color={Colors.goldDark} />
              <Text style={styles.chapterText}>{card.chapter}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ marginTop: 8 }}>
          {rows.map((r, i) => (
            <ContactRow key={r.icon} icon={r.icon} text={r.text} last={i === rows.length - 1} />
          ))}
        </View>
        {card.tags.length ? (
          <View style={styles.tags}>
            {card.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </View>
        ) : null}
        {card.about ? <Text style={styles.about}>{card.about}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.offwhite, borderRadius: Radius.xl, overflow: "hidden", ...CARD_SHADOW },
  banner: { overflow: "hidden" },
  bannerLogo: { position: "absolute", top: 12, left: 14, width: 92, height: 36 },
  tagline: { position: "absolute", top: 12, right: 14, textAlign: "right", color: Colors.goldLight, fontFamily: Fonts.medium, fontSize: 11, lineHeight: 15 },

  full: { backgroundColor: Colors.white, minHeight: 430 },
  fullBg: { position: "absolute", top: 0, left: 0, right: 0, width: "100%", height: 560 },
  fullLogo: { position: "absolute", top: 12, left: 14, width: 120, height: 48 },
  fullTag: { position: "absolute", top: 14, right: 16, alignItems: "flex-end" },
  fullTagText: { color: Colors.white, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  fullTagGrow: { color: Colors.goldLight, fontFamily: Fonts.bold },
  fullTagLine: { width: 46, height: 1.5, backgroundColor: Colors.gold, marginTop: 4 },
  fullPhoto: { marginTop: 88, marginLeft: 18, alignSelf: "flex-start", padding: 3, borderRadius: 60, borderWidth: 2, borderColor: Colors.gold, backgroundColor: Colors.white },
  check: { position: "absolute", right: 0, bottom: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.gold, borderWidth: 2, borderColor: Colors.white, alignItems: "center", justifyContent: "center" },
  fullQr: { position: "absolute", top: 184, right: 18, alignItems: "center", gap: 4 },
  fullBody: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 18 },
  identity: { minHeight: 84, paddingRight: 120 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  role: { color: Colors.royalNavy, fontFamily: Fonts.regular, fontSize: 14, marginTop: 2 },
  loc: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  chapter: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#FDF0D2" },
  chapterText: { color: Colors.goldDark, fontFamily: Fonts.medium, fontSize: 13 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  contactDivider: { borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  contactIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  contactText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  qrFrame: { padding: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.gold, backgroundColor: Colors.white },
  qrScanCap: { color: Colors.royalNavy, fontFamily: Fonts.regular, fontSize: 11 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  about: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#DCE3EE" },

  compact: { borderRadius: Radius.lg },
  compactBody: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 14, marginTop: -38 },
  compactPhoto: { borderRadius: 34, borderWidth: 3, borderColor: Colors.white },
  compactInfo: { flex: 1, minWidth: 0, paddingBottom: 2 },
  compactName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  compactLine: { color: Colors.royalNavy, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  compactLoc: { color: Colors.goldDark, fontFamily: Fonts.regular, fontSize: 10 },
  qrBox: { marginTop: -26, alignItems: "center", gap: 3, padding: 6, borderRadius: Radius.md, backgroundColor: Colors.white, ...CARD_SHADOW },
  qrCap: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 8 },
});
