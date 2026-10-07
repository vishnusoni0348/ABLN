import { CARD_SHADOW, GOLD_BG, Tag } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { Category, Opportunity } from "@/data/opportunities";
import { toggleSaved, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { Image, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Placeholder artwork per category until opportunity photos come from the API.
const ART: Record<Category, { icon: IconName; colors: [string, string] }> = {
  Partnership: { icon: "git-network-outline", colors: ["#0B2A4A", "#2B5C94"] },
  Investment: { icon: "trending-up-outline", colors: ["#3A2A08", "#B88618"] },
  Distribution: { icon: "cube-outline", colors: ["#0F3D3E", "#2E8B84"] },
  Collaboration: { icon: "people-outline", colors: ["#2C2160", "#6B5BC2"] },
  Services: { icon: "construct-outline", colors: ["#1E3A5F", "#4A7FB5"] },
};

export const GOLD_GRADIENT = [Colors.goldLight, Colors.champagne, Colors.gold] as const;

export function OppThumb({ category, featured, size, style, uri }: { category: Category; featured?: boolean; size?: number; style?: StyleProp<ViewStyle>; uri?: string }) {
  const art = ART[category];
  const box = size ? { width: size, height: size } : undefined;
  return (
    <LinearGradient colors={art.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.thumb, box, style]}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <Ionicons name={art.icon} size={size ? size * 0.42 : 56} color="rgba(255,255,255,0.85)" />}
      {featured ? <Text style={styles.featuredBadge}>Featured</Text> : null}
    </LinearGradient>
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

export function GoldButton({ label, onPress, style }: { label: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && styles.pressed]} accessibilityRole="button">
      <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.goldBtn}>
        <Text style={styles.goldBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, style }: { label: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineBtn, style, pressed && styles.pressed]} accessibilityRole="button">
      <Text style={styles.outlineBtnText}>{label}</Text>
    </Pressable>
  );
}

function SaveButton({ id, style }: { id: string; style?: StyleProp<ViewStyle> }) {
  const { saved } = useOpportunities();
  const on = saved.includes(id);
  return (
    <Pressable onPress={() => toggleSaved(id)} style={[styles.save, style]} hitSlop={6} accessibilityRole="button" accessibilityLabel={on ? "Remove from saved" : "Save opportunity"}>
      <Ionicons name={on ? "bookmark" : "bookmark-outline"} size={18} color={on ? Colors.goldDark : Colors.navy} />
    </Pressable>
  );
}

const open = (id: string) => router.push({ pathname: "/opportunity-details", params: { id } });

// Large card used by the feed's "Recommended for You" section.
export function FeaturedOppCard({ o }: { o: Opportunity }) {
  return (
    <View style={[styles.bigCard, CARD_SHADOW]}>
      <OppThumb category={o.category} featured={o.status === "Featured"} style={styles.bigThumb} />
      <View style={styles.bigBody}>
        <Text style={styles.bigTitle}>{o.title}</Text>
        <View style={styles.tagRow}>
          <Tag>{o.category}</Tag>
          <Tag>{o.industry}</Tag>
        </View>
        <Meta icon="location">{o.location}</Meta>
        <Meta icon="cash">{o.valueLabel}</Meta>
        <Meta icon="calendar">{`Deadline: ${o.deadlineLabel}`}</Meta>
        <View style={styles.actions}>
          <SaveButton id={o.id} style={styles.saveBox} />
          <GoldButton label="View Details" onPress={() => open(o.id)} style={styles.flex} />
        </View>
      </View>
    </View>
  );
}

// Compact card with a square thumbnail: feed list and filtered results.
export function OppCard({ o, outlineButton }: { o: Opportunity; outlineButton?: boolean }) {
  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <Pressable onPress={() => open(o.id)} style={styles.cardTop} accessibilityRole="button" accessibilityLabel={o.title}>
        <OppThumb category={o.category} featured={o.status === "Featured"} size={96} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {o.title}
          </Text>
          <View style={styles.tagRow}>
            <Tag>{o.category}</Tag>
            <Tag>{o.industry}</Tag>
          </View>
          <Meta icon="location">{o.location}</Meta>
          <Meta icon="cash">{o.valueLabel}</Meta>
          <Meta icon="calendar">{`Deadline: ${o.deadlineLabel}`}</Meta>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <SaveButton id={o.id} style={styles.saveBox} />
        {outlineButton ? <OutlineButton label="View Details" onPress={() => open(o.id)} style={styles.flex} /> : <GoldButton label="View Details" onPress={() => open(o.id)} style={styles.flex} />}
      </View>
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
  onFilter,
  filterCount = 0,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder: string;
  onFilter: () => void;
  filterCount?: number;
}) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={Colors.navy} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCorrect={false}
        />
        {value && onClear ? (
          <Pressable onPress={onClear} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close" size={18} color={Colors.navy} />
          </Pressable>
        ) : null}
      </View>
      <Pressable style={({ pressed }) => [styles.filter, pressed && styles.pressed]} onPress={onFilter} accessibilityRole="button" accessibilityLabel="Open filters">
        <Ionicons name="options-outline" size={22} color={Colors.goldDark} />
        {filterCount > 0 ? <View style={styles.filterDot} /> : null}
      </Pressable>
    </View>
  );
}

// Pill row. Scrolls horizontally when `scroll`, otherwise wraps.
export function ChipRow<T extends string>({ options, selected, onSelect, scroll }: { options: readonly T[]; selected: T; onSelect: (o: T) => void; scroll?: boolean }) {
  const chips = options.map((o) => {
    const on = o === selected;
    return (
      <Pressable key={o} onPress={() => onSelect(o)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
        <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
      </Pressable>
    );
  });
  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll} style={styles.chipScrollWrap}>
        {chips}
      </ScrollView>
    );
  }
  return (
    <View style={styles.chipWrap}>
      {chips}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  flex: { flex: 1 },
  thumb: { alignItems: "center", justifyContent: "center", borderRadius: Radius.md, overflow: "hidden" },
  featuredBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: Colors.goldDark,
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 10,
  },

  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  metaText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },

  goldBtn: { height: 38, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  goldBtnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 13 },
  outlineBtn: { height: 38, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  outlineBtnText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 13 },

  actions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  save: { alignItems: "center", justifyContent: "center" },
  saveBox: { width: 38, height: 38, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },

  bigCard: { borderRadius: Radius.lg, backgroundColor: Colors.white, overflow: "hidden" },
  bigThumb: { height: 130, borderRadius: 0 },
  bigBody: { padding: 14 },
  bigTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21 },

  card: { padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white },
  cardTop: { flexDirection: "row", gap: 12 },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },

  searchRow: { flexDirection: "row", gap: 10 },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.navy, padding: 0 },
  filter: { width: 50, height: 50, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  filterDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.goldDark },

  chip: { height: 36, paddingHorizontal: 18, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#F6F7FA", alignItems: "center", justifyContent: "center" },
  chipOn: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 12 },
  chipTextOn: { color: Colors.white, fontFamily: Fonts.bold },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipScrollWrap: { flexGrow: 0, marginHorizontal: -16 },
  chipScroll: { paddingHorizontal: 16, gap: 8 },
});
