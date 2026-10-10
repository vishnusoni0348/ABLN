import { GoButton } from "@/components/event-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { type Partner, type PartnerCategory, type PartnerTier } from "@/data/partners";
import { type RedeemMethod, addRedemption } from "@/lib/partner-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Placeholder artwork per category until partner photos come from the API.
export const PARTNER_ART: Record<PartnerCategory, { icon: IconName; colors: [string, string] }> = {
  Hospitality: { icon: "bed-outline", colors: ["#3A2A08", "#B88618"] },
  Technology: { icon: "laptop-outline", colors: ["#0B2A4A", "#2B5C94"] },
  "Banking & Finance": { icon: "card-outline", colors: ["#173B2A", "#3E8E62"] },
  Automobile: { icon: "car-outline", colors: ["#2C2160", "#6B5BC2"] },
  Education: { icon: "school-outline", colors: ["#1E3A5F", "#4A7FB5"] },
  "Food & Beverage": { icon: "restaurant-outline", colors: ["#3D1F1A", "#A8553F"] },
  "Real Estate": { icon: "business-outline", colors: ["#0F3D3E", "#2E8B84"] },
  "Legal & Compliance": { icon: "document-text-outline", colors: ["#2B3440", "#64748B"] },
  Marketing: { icon: "megaphone-outline", colors: ["#4A1D3A", "#A04A82"] },
  Other: { icon: "storefront-outline", colors: ["#2B3440", "#64748B"] },
};

export const TIER_COLOR: Record<PartnerTier, { bg: string; fg: string }> = {
  "Founding Partner": { bg: "#EFEAFB", fg: "#6D4BD8" },
  "Premium Partner": { bg: "#FDF0D2", fg: Colors.goldDark },
  "Regular Partner": { bg: "#EEF1F5", fg: Colors.textSecondary },
};

export const openPartner = (id: string) => router.push({ pathname: "/partner-details", params: { id } });

// Records the redemption, then returns to the offer so Back from the success screen doesn't reopen earlier steps.
export function completeRedemption(p: Partner, method: RedeemMethod) {
  addRedemption({ partnerId: p.id, method, code: p.offer.code });
  router.dismissTo({ pathname: "/offer-details", params: { id: p.id } });
  router.push({ pathname: "/offer-redeemed", params: { id: p.id } });
}

export function PartnerLogo({ p, size = 48 }: { p: Pick<Partner, "mark" | "color">; size?: number }) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size * 0.25 }]}>
      <Text style={[styles.logoText, { color: p.color, fontSize: Math.max(10, size * (p.mark.length > 3 ? 0.2 : 0.3)) }]} numberOfLines={1} adjustsFontSizeToFit>
        {p.mark}
      </Text>
    </View>
  );
}

export function PartnerThumb({ p, size, style }: { p: Pick<Partner, "category" | "mark" | "color">; size: number; style?: StyleProp<ViewStyle> }) {
  const art = PARTNER_ART[p.category];
  return (
    <LinearGradient colors={art.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.thumb, { width: size, height: size }, style]}>
      <Ionicons name={art.icon} size={size * 0.42} color="rgba(255,255,255,0.85)" />
    </LinearGradient>
  );
}

export function TierBadge({ tier }: { tier: PartnerTier }) {
  const c = TIER_COLOR[tier];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {tier !== "Regular Partner" ? <Ionicons name="star" size={9} color={c.fg} /> : null}
      <Text style={[styles.badgeText, { color: c.fg }]}>{tier.replace(" Partner", "")}</Text>
    </View>
  );
}

// Partner name, offer and tier, shown at the top of each redemption step.
export function OfferSummary({ p }: { p: Partner }) {
  return (
    <View style={styles.summary}>
      <PartnerLogo p={p} size={64} />
      <View style={styles.flex}>
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.category}>{`${p.offer.label} ${p.offer.on}`}</Text>
        <View style={styles.summaryBadge}>
          <TierBadge tier={p.tier} />
        </View>
      </View>
    </View>
  );
}

// Full-width 50px action button: gold (default), navy or outlined.
export function Cta({ label, onPress, variant = "gold" }: { label: string; onPress: () => void; variant?: "gold" | "navy" | "outline" }) {
  const colors = variant === "gold" ? GOLD_GRADIENT : variant === "navy" ? ([Colors.navy, Colors.royalNavy] as const) : ([Colors.white, Colors.white] as const);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ctaWrap, pressed && styles.pressed]} accessibilityRole="button">
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cta, variant === "outline" && styles.ctaOutline]}>
        <Text style={[styles.ctaText, variant === "outline" && { color: Colors.navy }]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// Compact row used by the directory's "All Partners" list.
export function PartnerRow({ p }: { p: Partner }) {
  return (
    <Pressable onPress={() => openPartner(p.id)} style={({ pressed }) => [styles.row, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={p.name}>
      <PartnerLogo p={p} size={52} />
      <View style={styles.flex}>
        <Text style={styles.name} numberOfLines={1}>
          {p.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {p.category}
        </Text>
        <Text style={styles.offer}>{p.offer.label}</Text>
      </View>
      <GoButton />
    </Pressable>
  );
}

// Horizontally scrolled card for the directory's "Featured Partners".
export function FeaturedPartnerCard({ p }: { p: Partner }) {
  const art = PARTNER_ART[p.category];
  return (
    <Pressable onPress={() => openPartner(p.id)} style={({ pressed }) => [styles.featured, CARD_SHADOW, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={p.name}>
      <LinearGradient colors={art.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredTop}>
        <View style={styles.featuredBadge}>
          <TierBadge tier={p.tier} />
        </View>
        <PartnerLogo p={p} size={56} />
      </LinearGradient>
      <View style={styles.featuredBody}>
        <Text style={styles.name} numberOfLines={1}>
          {p.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {p.category}
        </Text>
        <View style={styles.featuredFoot}>
          <Text style={[styles.offer, styles.flex]} numberOfLines={1}>
            {p.offer.label}
          </Text>
          <GoButton />
        </View>
      </View>
    </Pressable>
  );
}

// Card for the search results.
export function PartnerCard({ p }: { p: Partner }) {
  return (
    <Pressable onPress={() => openPartner(p.id)} style={({ pressed }) => [styles.card, CARD_SHADOW, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={p.name}>
      <View>
        <PartnerThumb p={p} size={84} />
        <View style={styles.cardLogo}>
          <PartnerLogo p={p} size={30} />
        </View>
      </View>
      <View style={styles.flex}>
        <View style={styles.cardTop}>
          <Text style={[styles.name, styles.flex]} numberOfLines={1}>
            {p.name}
          </Text>
          <TierBadge tier={p.tier} />
        </View>
        <Text style={styles.category} numberOfLines={1}>
          {p.category}
        </Text>
        <View style={styles.reach}>
          <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
          <Text style={styles.reachText}>{p.reach}</Text>
        </View>
        <Text style={styles.offer}>{p.offer.label}</Text>
      </View>
      <GoButton />
    </Pressable>
  );
}

// Pulsing placeholder rows for the loading state.
export function PartnerSkeleton({ rows = 4 }: { rows?: number }) {
  const [opacity] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.skeleton} accessibilityLabel="Loading partners" accessibilityRole="progressbar">
      {Array.from({ length: rows }, (_, i) => (
        <Animated.View key={i} style={[styles.skelRow, { opacity }]}>
          <View style={styles.skelThumb} />
          <View style={styles.skelLines}>
            <View style={[styles.skelLine, { width: "70%" }]} />
            <View style={[styles.skelLine, { width: "45%" }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },

  logo: { backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5", alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  logoText: { fontFamily: Fonts.bold },
  thumb: { borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },

  badge: { flexDirection: "row", alignItems: "center", gap: 3, alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  badgeText: { fontFamily: Fonts.semiBold, fontSize: 10 },

  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  category: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  offer: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 12, marginTop: 4 },

  ctaWrap: { alignSelf: "stretch" },
  cta: { height: 50, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaOutline: { borderWidth: 1, borderColor: Colors.navy },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },

  summary: { flexDirection: "row", alignItems: "center", gap: 14 },
  summaryBadge: { marginTop: 8 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },

  featured: { width: 156, borderRadius: Radius.lg, backgroundColor: Colors.white, overflow: "hidden" },
  featuredTop: { height: 88, alignItems: "center", justifyContent: "flex-end", paddingBottom: 10 },
  featuredBadge: { position: "absolute", top: 8, left: 8 },
  featuredBody: { padding: 12 },
  featuredFoot: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },

  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: Radius.lg, backgroundColor: Colors.white },
  cardLogo: { position: "absolute", right: 5, bottom: 5 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  reach: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  reachText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },

  skeleton: { gap: 12 },
  skelRow: { flexDirection: "row", gap: 12, padding: 12, borderRadius: Radius.lg, backgroundColor: "#F3F5F9" },
  skelThumb: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: "#E3E7EE" },
  skelLines: { flex: 1, justifyContent: "center", gap: 8 },
  skelLine: { height: 10, borderRadius: 5, backgroundColor: "#E3E7EE" },
});
