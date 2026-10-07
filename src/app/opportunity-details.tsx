import { CARD_SHADOW, GOLD_BG, Tag } from "@/components/member-ui";
import { GOLD_GRADIENT, OppThumb } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { COMPANIES } from "@/data/companies";
import { OPPORTUNITIES } from "@/data/opportunities";
import { toggleSaved, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TABS = ["Overview", "Requirements", "About Company", "Owner"] as const;
type Tab = (typeof TABS)[number];

const REQUIREMENTS = [
  "Established business with a proven track record",
  "Existing distribution or sales network in the target region",
  "Ability to meet minimum investment and inventory commitments",
  "Willingness to sign a long-term partnership agreement",
];

// Sample "posted on" date, counted back from today.
const postedOn = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={22} color={Colors.goldDark} />
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function CompanyRow({ name, sector, location, verified }: { name: string; sector: string; location: string; verified: boolean }) {
  return (
    <View style={styles.company}>
      <LinearGradient colors={[Colors.deepNavy, Colors.royalNavy]} style={styles.logo}>
        <Text style={styles.logoText}>{initials(name)}</Text>
      </LinearGradient>
      <View style={styles.flex}>
        <View style={styles.nameRow}>
          <Text style={styles.companyName} numberOfLines={1}>
            {name}
          </Text>
          {verified ? <Ionicons name="checkmark-circle" size={16} color={Colors.goldDark} /> : null}
        </View>
        <Text style={styles.companySector}>{sector}</Text>
        <View style={styles.nameRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.companySector}>{location}</Text>
        </View>
      </View>
    </View>
  );
}

export default function OpportunityDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { saved, mine, interests } = useOpportunities();
  const [tab, setTab] = useState<Tab>("Overview");

  const feedItem = OPPORTUNITIES.find((o) => o.id === id);
  const mineItem = mine.find((o) => o.id === id);
  const o = feedItem ?? mineItem;

  const back = (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
      <Ionicons name="chevron-back" size={24} color={Colors.navy} />
    </Pressable>
  );

  if (!o) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        {back}
        <Text style={styles.none}>This opportunity is no longer available.</Text>
      </View>
    );
  }

  const isSaved = saved.includes(o.id);
  const sent = interests.find((i) => i.oppId === o.id);
  const status = feedItem ? (feedItem.status === "Featured" ? "Open" : feedItem.status) : mineItem!.status;
  const about = feedItem?.about ?? "Details for this opportunity are managed from My Opportunities.";
  const statusColor = status === "Closing Soon" || status === "Pending" ? Colors.goldDark : status === "Closed" ? Colors.error : Colors.success;
  const company = COMPANIES[o.id] ?? { name: "Your Company", sector: o.industry, location: o.location, verified: false, owner: "You", ownerRole: "Opportunity owner" };
  const posted = feedItem ? postedOn(feedItem.postedDaysAgo) : mineItem!.postedLabel;

  const share = () => Share.share({ message: `${o.title} - ${o.valueLabel}, ${o.location}. Found on ABLN.` }).catch(() => Alert.alert("Could not share", "Please try again."));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        {back}
        <Text style={styles.topTitle}>Opportunity Details</Text>
        <View style={styles.topRight}>
          <Pressable onPress={() => toggleSaved(o.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={isSaved ? "Remove from saved" : "Save opportunity"}>
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={isSaved ? Colors.goldDark : Colors.navy} />
          </Pressable>
          <Pressable onPress={share} hitSlop={8} accessibilityRole="button" accessibilityLabel="Share">
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.navy} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <OppThumb category={o.category} featured={feedItem?.status === "Featured"} uri={mineItem?.cover} style={styles.banner} />

        <View style={styles.pad}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{o.title}</Text>
            <View style={[styles.status, { backgroundColor: statusColor + "22" }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.summary}>{about}</Text>
          <View style={styles.tags}>
            {[o.category, o.industry].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </View>

          <View style={[styles.facts, CARD_SHADOW]}>
            <Fact icon="location-outline" label="Location" value={o.location.replace(", ", ",\n")} />
            <Fact icon="layers-outline" label="Value Range" value={o.valueLabel} />
            <Fact icon="calendar-outline" label="Deadline" value={feedItem?.deadlineLabel ?? "-"} />
            <Fact icon="radio-button-on-outline" label="Posted On" value={posted} />
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === t }}>
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]} numberOfLines={1}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.pad, styles.body]}>
          {tab === "Overview" ? (
            <>
              <Text style={styles.h}>Opportunity Description</Text>
              <Text style={styles.p}>{about} This is a great opportunity for established businesses to partner with a trusted brand and grow together.</Text>
              <View style={styles.focus}>
                <View style={styles.focusIcon}>
                  <Ionicons name="stats-chart" size={20} color={Colors.goldDark} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.focusTitle}>Key Focus</Text>
                  <Text style={styles.focusText}>Expand reach, increase market presence and build long-term partnerships.</Text>
                </View>
              </View>
              <View style={styles.sectionHead}>
                <Text style={styles.h}>About the Company</Text>
                <Pressable onPress={() => setTab("About Company")} hitSlop={8} style={styles.viewProfile}>
                  <Text style={styles.link}>View Profile</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.royalNavy} />
                </Pressable>
              </View>
              <CompanyRow {...company} />
            </>
          ) : null}
          {tab === "Requirements" ? (
            <>
              <Text style={styles.h}>Requirements</Text>
              {REQUIREMENTS.map((r) => (
                <View key={r} style={styles.req}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.goldDark} />
                  <Text style={[styles.p, styles.flex]}>{r}</Text>
                </View>
              ))}
            </>
          ) : null}
          {tab === "About Company" ? (
            <>
              <Text style={styles.h}>About the Company</Text>
              <CompanyRow {...company} />
              <Text style={styles.p}>{`${company.name} is an ABLN network member operating in ${company.sector.toLowerCase()}, looking for partners and collaborators across India.`}</Text>
            </>
          ) : null}
          {tab === "Owner" ? (
            <>
              <Text style={styles.h}>Opportunity Owner</Text>
              <View style={styles.company}>
                <View style={[styles.logo, styles.ownerAvatar]}>
                  <Text style={[styles.logoText, { color: Colors.goldDark }]}>{initials(company.owner)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.companyName}>{company.owner}</Text>
                  <Text style={styles.companySector}>{company.ownerRole}</Text>
                  <Text style={styles.companySector}>{company.name}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]} onPress={share} accessibilityRole="button">
          <Ionicons name="paper-plane-outline" size={20} color={Colors.goldDark} />
          <Text style={styles.shareText}>Share Opportunity</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.flex, pressed && styles.pressed]}
          onPress={() => (sent ? router.push({ pathname: "/interest-status", params: { id: sent.id } }) : router.push({ pathname: "/express-interest", params: { id: o.id } }))}
          disabled={!feedItem}
          accessibilityRole="button"
        >
          <LinearGradient colors={feedItem ? GOLD_GRADIENT : ["#D9DEE6", "#C8CFDA"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.interestBtn}>
            <Ionicons name={sent ? "checkmark" : "people"} size={20} color={Colors.white} />
            <Text style={styles.interestText}>{sent ? "View Interest Status" : "Express Interest"}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pressed: { opacity: 0.85 },
  flex: { flex: 1 },
  pad: { paddingHorizontal: 16 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 40 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  topTitle: { flex: 1, textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  topRight: { flexDirection: "row", gap: 16, alignItems: "center" },

  scroll: { paddingBottom: 16 },
  banner: { height: 160, borderRadius: 0 },

  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 14 },
  title: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, lineHeight: 26 },
  status: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontFamily: Fonts.semiBold, fontSize: 12 },
  summary: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },

  facts: { flexDirection: "row", marginTop: 16, paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.white },
  fact: { flex: 1, alignItems: "center", gap: 4, paddingHorizontal: 4 },
  factLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10 },
  factValue: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 11, textAlign: "center" },

  tabs: { flexDirection: "row", marginTop: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: Colors.goldDark },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  tabTextOn: { color: Colors.navy, fontFamily: Fonts.bold },

  body: { paddingTop: 16, gap: 12 },
  h: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  p: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20 },
  focus: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: "#FEF6E3" },
  focusIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  focusTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  focusText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 2 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  viewProfile: { flexDirection: "row", alignItems: "center", gap: 2 },
  link: { color: Colors.royalNavy, fontFamily: Fonts.medium, fontSize: 13 },
  req: { flexDirection: "row", gap: 10, alignItems: "flex-start" },

  company: { flexDirection: "row", alignItems: "center", gap: 14 },
  logo: { width: 64, height: 64, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  logoText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 18 },
  ownerAvatar: { backgroundColor: GOLD_BG, borderRadius: 32 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  companyName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, flexShrink: 1 },
  companySector: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },

  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  shareBtn: { flex: 1, height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, backgroundColor: Colors.white },
  shareText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 14 },
  interestBtn: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: Radius.md },
  interestText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
});
