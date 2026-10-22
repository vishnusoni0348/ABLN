import { EventThumb, SaveEventButton, openEvent } from "@/components/event-ui";
import { Avatar, CARD_SHADOW, GOLD_BG, ScreenHeader, Tag } from "@/components/member-ui";
import { OppThumb } from "@/components/opportunity-ui";
import { TabHeader } from "@/components/tab-header";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { type AppEvent, formatEventDate } from "@/data/events";
import type { Member } from "@/data/members";
import type { Opportunity } from "@/data/opportunities";
import { toggleSaved } from "@/lib/opportunity-store";
import { toggleSavedMember } from "@/lib/saved-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, ReactNode } from "react";
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Frame for the sub-screens: pinned back header (+ optional controls) above a scrolling body. */
export function SavedSubScreen({ title, controls, children }: { title: string; controls?: ReactNode; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <ScreenHeader title={title} />
        {controls}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

/** Frame for the Saved tab itself. */
export function SavedTabScreen({ children }: { children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <TabHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

export function SectionRow({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function BookmarkButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name="bookmark" size={22} color={Colors.goldDark} />
    </Pressable>
  );
}

export function Meta({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={12} color={Colors.goldDark} />
      <Text style={styles.metaText} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export function postedAgo(days: number) {
  if (days < 1) return "Posted today";
  if (days < 7) return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  return `Posted ${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

export function SavedOppCard({ o }: { o: Opportunity }) {
  return (
    <Pressable onPress={() => router.push({ pathname: "/opportunity-details", params: { id: o.id } })} style={[styles.card, CARD_SHADOW]} accessibilityRole="button" accessibilityLabel={o.title}>
      <OppThumb category={o.category} size={84} />
      <View style={styles.flex}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {o.title}
        </Text>
        <Meta icon="location">{o.location}</Meta>
        <View style={styles.tagRow}>
          <Tag>{o.category}</Tag>
          <Tag>{o.industry}</Tag>
        </View>
        <Text style={styles.posted}>{postedAgo(o.postedDaysAgo)}</Text>
      </View>
      <BookmarkButton onPress={() => toggleSaved(o.id)} label="Remove from saved opportunities" />
    </Pressable>
  );
}

export function SavedEventCard({ e }: { e: AppEvent }) {
  return (
    <Pressable onPress={() => openEvent(e.id)} style={[styles.card, CARD_SHADOW]} accessibilityRole="button" accessibilityLabel={e.title}>
      <EventThumb event={e} style={styles.eventThumb} />
      <View style={styles.flex}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {e.title}
        </Text>
        <Meta icon="calendar-outline">{`${formatEventDate(e.date)} | ${e.time}`}</Meta>
        <Meta icon="location-outline">{e.location}</Meta>
        <View style={styles.tagRow}>
          <Tag>{e.category}</Tag>
          <Tag>{e.type}</Tag>
        </View>
      </View>
      <SaveEventButton id={e.id} />
    </Pressable>
  );
}

export function SavedMemberRow({ m }: { m: Member }) {
  return (
    <Pressable onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })} style={styles.memberRow} accessibilityRole="button" accessibilityLabel={`View ${m.name}'s profile`}>
      <Avatar name={m.name} photo={m.photo} size={60} />
      <View style={styles.flex}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName} numberOfLines={1}>
            {m.name}
          </Text>
          {m.verified ? (
            <View style={styles.verified}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.goldDark} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.memberRole} numberOfLines={1}>
          {m.role}
        </Text>
        <Text style={styles.memberRole} numberOfLines={1}>
          {m.company}
        </Text>
        <Meta icon="location-outline">{m.location}</Meta>
      </View>
      <BookmarkButton onPress={() => toggleSavedMember(m.name)} label={`Remove ${m.name} from saved members`} />
    </Pressable>
  );
}

export function FilterChips<T extends string>({ options, selected, onSelect, style }: { options: readonly T[]; selected: T; onSelect: (o: T) => void; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={[styles.chipsWrap, style]}>
      {options.map((o) => {
        const on = o === selected;
        return (
          <Pressable key={o} onPress={() => onSelect(o)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Segmented control used on Saved Items. */
export function Segments<T extends string>({ options, selected, onSelect }: { options: { key: T; label: string }[]; selected: T; onSelect: (k: T) => void }) {
  return (
    <View style={styles.segments}>
      {options.map((o) => {
        const on = o.key === selected;
        return (
          <Pressable key={o.key} onPress={() => onSelect(o.key)} style={[styles.segment, on && styles.segmentOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.segmentText, on && styles.segmentTextOn]} numberOfLines={1}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  return (
    <View style={styles.search}>
      <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
      <TextInput placeholder={placeholder} placeholderTextColor={Colors.textMuted} style={styles.searchInput} value={value} onChangeText={onChangeText} autoCorrect={false} returnKeyType="search" />
      {value ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8} accessibilityLabel="Clear search">
          <Ionicons name="close" size={18} color={Colors.navy} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28, gap: 12 },
  flex: { flex: 1 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  seeAll: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: { flexShrink: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 },
  posted: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10, marginTop: 6 },

  card: { flexDirection: "row", gap: 12, padding: 10, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#EEF1F5" },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, lineHeight: 19 },
  eventThumb: { width: 84, height: 84, borderRadius: Radius.md },

  memberRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  memberName: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  verified: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: GOLD_BG, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 10 },
  memberRole: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },

  chipsWrap: { flexGrow: 0, marginHorizontal: -16 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: { height: 34, paddingHorizontal: 18, borderRadius: 17, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  chipOn: { borderColor: Colors.gold, backgroundColor: GOLD_BG },
  chipText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12 },
  chipTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },

  segments: { flexDirection: "row", gap: 8, marginTop: 8 },
  segment: { flex: 1, height: 40, borderRadius: Radius.sm, backgroundColor: "#F1F4FA", alignItems: "center", justifyContent: "center" },
  segmentOn: { backgroundColor: GOLD_BG, borderWidth: 1, borderColor: Colors.gold },
  segmentText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 12 },
  segmentTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },

  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 46, paddingHorizontal: 14, borderRadius: Radius.md, backgroundColor: "#F6F7FA", marginTop: 8 },
  searchInput: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, padding: 0 },
});
