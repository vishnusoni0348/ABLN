import { Avatar, CARD_SHADOW, Tag } from "@/components/member-ui";
import { QrCode } from "@/components/qr-code";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { BusinessCard as Card, cardLink } from "@/lib/card-store";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

const banner = require("../../assets/images/card-banner.png");
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
          </View>
          <View style={styles.qrBox}>
            <QrCode value={cardLink(card)} size={78} />
            <Text style={styles.qrCap}>Connect on ABLN</Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.card}>
      <Banner />
      <View style={styles.photoWrap}>
        <Avatar name={card.name} photo={card.photo} size={104} />
        <View style={styles.check}>
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{card.name}</Text>
        <Text style={styles.role}>{card.role}</Text>
        <Text style={styles.role}>{card.company}</Text>
        <View style={styles.loc}>
          <Ionicons name="location" size={14} color={Colors.goldDark} />
          <Text style={styles.locText}>{card.location}</Text>
        </View>
        <View style={styles.tags}>
          {card.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </View>
        <Text style={styles.about}>{card.about}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.offwhite, borderRadius: Radius.xl, overflow: "hidden", ...CARD_SHADOW },
  banner: { overflow: "hidden" },
  bannerLogo: { position: "absolute", top: 12, left: 14, width: 92, height: 36 },
  tagline: { position: "absolute", top: 12, right: 14, textAlign: "right", color: Colors.goldLight, fontFamily: Fonts.medium, fontSize: 11, lineHeight: 15 },

  photoWrap: { alignSelf: "flex-start", marginLeft: 18, marginTop: -44, borderRadius: 60, borderWidth: 4, borderColor: Colors.white },
  check: { position: "absolute", right: 0, bottom: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.gold, borderWidth: 2, borderColor: Colors.white, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 18 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  role: { color: Colors.royalNavy, fontFamily: Fonts.regular, fontSize: 14, marginTop: 2 },
  loc: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locText: { color: Colors.goldDark, fontFamily: Fonts.medium, fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  about: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 14 },

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
