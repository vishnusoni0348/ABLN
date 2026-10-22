import { EmptyState } from "@/components/empty-state";
import { EventThumb, SaveEventButton, openEvent } from "@/components/event-ui";
import { Avatar, CARD_SHADOW, GOLD_BG } from "@/components/member-ui";
import { OppThumb } from "@/components/opportunity-ui";
import { BookmarkButton, FilterChips, SavedTabScreen, SectionRow } from "@/components/saved-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EVENTS } from "@/data/events";
import { findMember } from "@/data/members";
import { OPPORTUNITIES } from "@/data/opportunities";
import { QUESTIONS } from "@/data/questions";
import { useEvents } from "@/lib/event-store";
import { toggleSaved, useOpportunities } from "@/lib/opportunity-store";
import { toggleSavedQ, useQuestions } from "@/lib/question-store";
import { savedAgo, toggleSavedMember, useSavedMembers } from "@/lib/saved-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, ReactNode, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const FILTERS = ["All", "Opportunities", "Events", "Questions", "Members"] as const;
type Filter = (typeof FILTERS)[number];
type Kind = Exclude<Filter, "All">;

type Recent = { key: string; kind: Kind; label: string; at: number; title: string; thumb: ReactNode; bookmark: ReactNode; onPress: () => void };

const EMPTY: Record<Kind, { icon: IconName; title: string; text: string; cta: string; route: "/opportunities" | "/events" | "/network" | "/ask-network" }> = {
  Opportunities: { icon: "briefcase-outline", title: "No Saved Opportunities", text: "Tap the bookmark on an opportunity to save it for later.", cta: "Browse Opportunities", route: "/opportunities" },
  Events: { icon: "calendar-outline", title: "No Saved Events", text: "Tap the bookmark on an event to save it for later.", cta: "Browse Events", route: "/events" },
  Questions: { icon: "help-circle-outline", title: "No Saved Questions", text: "Tap the bookmark on a question to save it for later.", cta: "Browse Ask Network", route: "/ask-network" },
  Members: { icon: "person-outline", title: "No Saved Members", text: "Bookmark a member's profile to find them here quickly.", cta: "Browse Network", route: "/network" },
};

const goItems = (tab: "Opportunities" | "Events" | "Questions") => router.navigate({ pathname: "/saved-items", params: { tab } });
const goMembers = () => router.navigate("/saved-members");

export default function Saved() {
  const { saved: oppIds } = useOpportunities();
  const { saved: eventIds } = useEvents();
  const { saved: questionIds, posted } = useQuestions();
  const { members, stamps } = useSavedMembers();
  const [filter, setFilter] = useState<Filter>("All");

  const savedQuestions = [...posted, ...QUESTIONS].filter((q) => questionIds.includes(q.id));
  const counts: Record<Kind, number> = { Opportunities: oppIds.length, Events: eventIds.length, Questions: savedQuestions.length, Members: members.length };
  const total = counts.Opportunities + counts.Events + counts.Questions + counts.Members;

  const recent = useMemo(() => {
    const items: Recent[] = [];
    for (const o of OPPORTUNITIES.filter((x) => oppIds.includes(x.id))) {
      items.push({
        key: `opp:${o.id}`,
        kind: "Opportunities",
        label: "Business Opportunity",
        at: stamps[`opp:${o.id}`] ?? 0,
        title: o.title,
        thumb: <OppThumb category={o.category} size={64} />,
        bookmark: <BookmarkButton onPress={() => toggleSaved(o.id)} label={`Remove ${o.title} from saved`} />,
        onPress: () => router.push({ pathname: "/opportunity-details", params: { id: o.id } }),
      });
    }
    for (const e of EVENTS.filter((x) => eventIds.includes(x.id))) {
      items.push({
        key: `event:${e.id}`,
        kind: "Events",
        label: "Event",
        at: stamps[`event:${e.id}`] ?? 0,
        title: e.title,
        thumb: <EventThumb event={e} style={styles.thumb} />,
        bookmark: <SaveEventButton id={e.id} />,
        onPress: () => openEvent(e.id),
      });
    }
    for (const q of savedQuestions) {
      items.push({
        key: `question:${q.id}`,
        kind: "Questions",
        label: "Question",
        at: stamps[`question:${q.id}`] ?? 0,
        title: q.title,
        thumb: (
          <View style={[styles.thumb, styles.qThumb]}>
            <Ionicons name="help-circle-outline" size={32} color={Colors.goldDark} />
          </View>
        ),
        bookmark: <BookmarkButton onPress={() => toggleSavedQ(q.id)} label={`Remove ${q.title} from saved`} />,
        onPress: () => router.push({ pathname: "/question-detail", params: { id: q.id } }),
      });
    }
    for (const name of members) {
      const m = findMember(name);
      if (!m) continue;
      items.push({
        key: `member:${name}`,
        kind: "Members",
        label: "Member",
        at: stamps[`member:${name}`] ?? 0,
        title: m.name,
        thumb: <Avatar name={m.name} photo={m.photo} size={64} radius={Radius.md} />,
        bookmark: <BookmarkButton onPress={() => toggleSavedMember(name)} label={`Remove ${m.name} from saved`} />,
        onPress: () => router.push({ pathname: "/member-profile", params: { name: m.name } }),
      });
    }
    return items
      .filter((i) => filter === "All" || i.kind === filter)
      .sort((a, b) => b.at - a.at)
      .slice(0, 5);
  }, [oppIds, eventIds, savedQuestions, members, stamps, filter]);

  const sections: { key: Kind; icon: IconName; tint: string; color: string; title: string; sub: string; go: () => void }[] = [
    { key: "Opportunities", icon: "briefcase-outline", tint: GOLD_BG, color: Colors.goldDark, title: "Saved Opportunities", sub: "Business deals, collaborations and growth opportunities.", go: () => goItems("Opportunities") },
    { key: "Events", icon: "calendar-outline", tint: "#E3F4EF", color: "#2E8B84", title: "Saved Events", sub: "Webinars, meetups and networking events.", go: () => goItems("Events") },
    { key: "Questions", icon: "help-circle-outline", tint: "#EAF0FB", color: "#2F6FDE", title: "Saved Questions", sub: "Ask Network questions worth revisiting.", go: () => goItems("Questions") },
    { key: "Members", icon: "person-outline", tint: GOLD_BG, color: Colors.goldDark, title: "Saved Members", sub: "Business leaders, experts and potential partners.", go: goMembers },
  ];
  const shown = sections.filter((s) => filter === "All" || filter === s.key);
  const seeAll = filter === "Members" ? goMembers : () => goItems(filter === "Events" || filter === "Questions" ? filter : "Opportunities");

  return (
    <SavedTabScreen>
      <Text style={styles.title}>Saved</Text>
      <Text style={styles.sub}>Your saved members, opportunities and events for quick access.</Text>

      <View style={styles.stats}>
        {sections.map((s, i) => (
          <View key={s.key} style={[styles.stat, i > 0 && styles.statDivider]}>
            <Ionicons name={s.icon} size={24} color={Colors.goldDark} />
            <Text style={styles.statNum}>{counts[s.key]}</Text>
            <Text style={styles.statLabel}>{s.key}</Text>
          </View>
        ))}
      </View>

      <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />

      {filter !== "All" && counts[filter] === 0 ? (
        <EmptyState inline icon={EMPTY[filter].icon} title={EMPTY[filter].title} text={EMPTY[filter].text} cta={{ label: EMPTY[filter].cta, onPress: () => router.navigate(EMPTY[filter].route) }} />
      ) : total === 0 ? (
        <EmptyState inline icon="bookmark-outline" title="Nothing saved yet" text="Tap the bookmark on an opportunity, event or member to keep it here for quick access." cta={{ label: "Browse Opportunities", onPress: () => router.navigate("/opportunities") }} />
      ) : (
        <>
          {shown.map((s) => (
            <Pressable key={s.key} onPress={s.go} style={[styles.row, CARD_SHADOW]} accessibilityRole="button" accessibilityLabel={`${s.title}, ${counts[s.key]}`}>
              <View style={[styles.rowIcon, { backgroundColor: s.tint }]}>
                <Ionicons name={s.icon} size={26} color={s.color} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{s.title}</Text>
                <Text style={styles.rowSub}>{s.sub}</Text>
              </View>
              <Text style={styles.rowCount}>{counts[s.key]}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </Pressable>
          ))}

          {recent.length ? <SectionRow title="Recently Saved" onSeeAll={filter === "All" ? undefined : seeAll} /> : null}
          {recent.map((r) => (
            <Pressable key={r.key} onPress={r.onPress} style={[styles.recent, CARD_SHADOW]} accessibilityRole="button" accessibilityLabel={r.title}>
              {r.thumb}
              <View style={styles.flex}>
                <Text style={styles.recentTitle} numberOfLines={2}>
                  {r.title}
                </Text>
                <Text style={styles.recentMeta}>{`${r.label}  •  ${savedAgo(r.at)}`}</Text>
              </View>
              {r.bookmark}
            </Pressable>
          ))}
        </>
      )}
    </SavedTabScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: -6 },
  stats: { flexDirection: "row", backgroundColor: "#FEF6E6", borderRadius: Radius.md, paddingVertical: 14 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: "#F1E3C0" },
  statNum: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  statLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5" },
  rowIcon: { width: 54, height: 54, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  rowTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  rowSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  rowCount: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  recent: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5" },
  thumb: { width: 64, height: 64, borderRadius: Radius.md },
  qThumb: { backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  recentTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 19 },
  recentMeta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 4 },
});
