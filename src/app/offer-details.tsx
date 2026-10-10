import { ScreenHeader } from "@/components/member-ui";
import { Cta, PARTNER_ART, PartnerLogo, TierBadge } from "@/components/partner-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PARTNERS, formatValidTill, isOfferExpired } from "@/data/partners";
import { toggleFavourite, usePartners } from "@/lib/partner-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={Colors.navy} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function OfferDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favourites, redemptions } = usePartners();

  const p = PARTNERS.find((x) => x.id === id);
  if (!p) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <StatusBar style="dark" />
        <ScreenHeader title="Offer Details" />
        <Text style={styles.none}>This offer is no longer available.</Text>
      </View>
    );
  }

  const o = p.offer;
  const art = PARTNER_ART[p.category];
  const fav = favourites.includes(p.id);
  const redeemed = redemptions.some((r) => r.partnerId === p.id);
  const expired = isOfferExpired(p);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="Offer Details"
          right={
            <Pressable onPress={() => toggleFavourite(p.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={fav ? "Remove from favourites" : "Add to favourites"}>
              <Ionicons name={fav ? "heart" : "heart-outline"} size={22} color={fav ? Colors.error : Colors.navy} />
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <LinearGradient colors={art.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Ionicons name={art.icon} size={72} color="rgba(255,255,255,0.35)" />
          </LinearGradient>
          <View style={styles.logoRow}>
            <PartnerLogo p={p} size={64} />
            <View style={styles.exclusive}>
              <Ionicons name="pricetag" size={11} color={Colors.goldDark} />
              <Text style={styles.exclusiveText}>Exclusive Offer</Text>
            </View>
          </View>
        </View>

        <Text style={styles.headline}>{`${o.headline}\n${o.on}`}</Text>
        <Text style={styles.partnerName}>{p.name}</Text>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{p.category}</Text>
          </View>
          <TierBadge tier={p.tier} />
        </View>

        <View style={styles.details}>
          <Row icon="pricetag-outline" label="Discount" value={o.label} />
          <Row icon="calendar-outline" label="Valid Till" value={formatValidTill(o.validTill)} />
          <Row icon="business-outline" label="Applicable At" value={o.appliesAt} />
          <Row icon="list-outline" label="Applicable On" value={o.appliesOn} />
          <Row icon="information-circle-outline" label="How to Avail" value={o.howToAvail} />
        </View>

        <Text style={styles.sectionTitle}>About Partner</Text>
        <Text style={styles.body}>{p.about}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {redeemed ? (
          <Cta label="View Redemption" onPress={() => router.push({ pathname: "/offer-redeemed", params: { id: p.id } })} variant="outline" />
        ) : expired ? (
          <Text style={styles.expired}>This offer has expired.</Text>
        ) : (
          <Cta label="Redeem Offer" onPress={() => router.push({ pathname: "/redeem-offer", params: { id: p.id } })} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { paddingHorizontal: 16 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 12 },

  hero: { height: 170, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: -32, marginLeft: 12 },
  exclusive: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "#FDF0D2", marginBottom: 4 },
  exclusiveText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 11 },

  headline: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32, marginTop: 4 },
  partnerName: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 15 },
  chips: { flexDirection: "row", alignItems: "center", gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: "#EAF0FA" },
  chipText: { color: Colors.royalNavy, fontFamily: Fonts.semiBold, fontSize: 10 },

  details: { paddingHorizontal: 2 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F3F7" },
  rowLabel: { width: 104, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  rowValue: { flex: 1, color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12, lineHeight: 17 },

  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 4 },
  body: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20 },

  expired: { color: Colors.error, fontFamily: Fonts.semiBold, fontSize: 14, textAlign: "center", paddingVertical: 14 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
