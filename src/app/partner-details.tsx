import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { PARTNER_ART, PartnerLogo, TierBadge } from "@/components/partner-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PARTNERS } from "@/data/partners";
import { toggleFavourite, usePartners } from "@/lib/partner-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = ["About", "Benefits", "Locations", "Terms"] as const;
type Tab = (typeof TABS)[number];

export default function PartnerDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favourites } = usePartners();
  const [tab, setTab] = useState<Tab>("About");

  const p = PARTNERS.find((x) => x.id === id);
  if (!p) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Pressable onPress={() => router.back()} style={[styles.round, { marginTop: insets.top + 8, marginLeft: 16 }]} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
        </Pressable>
        <Text style={styles.none}>This partner is no longer available.</Text>
      </View>
    );
  }

  const art = PARTNER_ART[p.category];
  const fav = favourites.includes(p.id);
  const share = () => Share.share({ message: `${p.name} — ${p.offer.label} for ABLN members` });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View>
          <LinearGradient colors={art.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Ionicons name={art.icon} size={96} color="rgba(255,255,255,0.35)" />
          </LinearGradient>
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.round} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={22} color={Colors.navy} />
            </Pressable>
            <Pressable onPress={share} style={styles.round} accessibilityRole="button" accessibilityLabel="Share partner">
              <Ionicons name="share-outline" size={20} color={Colors.navy} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.logoWrap}>
            <PartnerLogo p={p} size={72} />
          </View>
          <View style={styles.tierWrap}>
            <TierBadge tier={p.tier} />
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>{p.name}</Text>
            <Pressable onPress={() => toggleFavourite(p.id)} style={styles.heart} hitSlop={8} accessibilityRole="button" accessibilityLabel={fav ? "Remove from favourites" : "Add to favourites"}>
              <Ionicons name={fav ? "heart" : "heart-outline"} size={22} color={fav ? Colors.error : Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.chips}>
            {p.tags.map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.info}>
              <Ionicons name="location-outline" size={18} color={Colors.goldDark} />
              <View style={styles.flex}>
                <Text style={styles.infoValue}>{p.reach}</Text>
                <Text style={styles.infoLabel}>Available at multiple locations</Text>
              </View>
            </View>
            <Pressable style={styles.info} onPress={() => Linking.openURL(`https://${p.website}`)} accessibilityRole="link" accessibilityLabel={`Open ${p.website}`}>
              <Ionicons name="globe-outline" size={18} color={Colors.goldDark} />
              <View style={styles.flex}>
                <Text style={styles.infoValue}>Website</Text>
                <Text style={styles.infoLabel} numberOfLines={1}>
                  {p.website}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
                <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {tab === "About" ? (
            <View style={styles.pane}>
              <Text style={styles.paneTitle}>About Partner</Text>
              <Text style={styles.body}>{p.about}</Text>
            </View>
          ) : null}

          {tab === "Benefits" ? <BenefitList p={p} /> : null}

          {tab === "Locations" ? (
            <View style={styles.pane}>
              <Text style={styles.paneTitle}>Locations</Text>
              {p.locations.map((l) => (
                <View key={l} style={styles.listRow}>
                  <Ionicons name="location-outline" size={16} color={Colors.goldDark} />
                  <Text style={styles.listText}>{l}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "Terms" ? (
            <View style={styles.pane}>
              <Text style={styles.paneTitle}>Terms & Conditions</Text>
              {p.terms.map((t, i) => (
                <View key={i} style={styles.listRow}>
                  <Text style={styles.bullet}>{`${i + 1}.`}</Text>
                  <Text style={[styles.body, styles.flex]}>{t}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* About tab also shows the member benefits, matching the design. */}
          {tab === "About" ? <BenefitList p={p} /> : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={({ pressed }) => [styles.flex, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/offer-details", params: { id: p.id } })} accessibilityRole="button">
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>Avail Offer</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function BenefitList({ p }: { p: (typeof PARTNERS)[number] }) {
  return (
    <View style={styles.pane}>
      <Text style={styles.paneTitle}>Member Benefits</Text>
      {p.benefits.map((b) => (
        <View key={b.title} style={styles.benefit}>
          <View style={styles.benefitIcon}>
            <Ionicons name="pricetag" size={20} color={Colors.goldDark} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.benefitTitle}>{b.title}</Text>
            <Text style={styles.infoLabel}>{b.note}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: 48 },

  hero: { height: 240, alignItems: "center", justifyContent: "center" },
  heroBar: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },

  sheet: { marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Colors.white, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  logoWrap: { marginTop: -52, alignSelf: "flex-start", borderRadius: 20, backgroundColor: Colors.white, padding: 4, shadowColor: Colors.navy, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  tierWrap: { position: "absolute", top: 16, right: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  heart: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },

  infoRow: { flexDirection: "row", gap: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: "#EEF1F5" },
  info: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  infoValue: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },
  infoLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },

  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: Colors.goldDark },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  tabTextOn: { color: Colors.navy, fontFamily: Fonts.bold },

  pane: { gap: 10 },
  paneTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  body: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20 },
  listRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  listText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  bullet: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 13, lineHeight: 20 },

  benefit: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.md, backgroundColor: "#FDF6E6" },
  benefitIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  benefitTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },

  footer: { paddingHorizontal: 16, paddingTop: 12, flexDirection: "row", borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  cta: { height: 50, borderRadius: Radius.md, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
