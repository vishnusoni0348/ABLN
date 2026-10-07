import { ScreenHeader, Tag } from "@/components/member-ui";
import { GoldButton, Meta, OppThumb } from "@/components/opportunity-ui";
import { Colors, Fonts } from "@/constants/theme";
import { MY_OPPORTUNITIES, OPPORTUNITIES } from "@/data/opportunities";
import { toggleSaved, useOpportunities } from "@/lib/opportunity-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OpportunityDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { saved } = useOpportunities();
  const [interested, setInterested] = useState(false);

  const feedItem = OPPORTUNITIES.find((o) => o.id === id);
  const mineItem = MY_OPPORTUNITIES.find((o) => o.id === id);
  const o = feedItem ?? mineItem;

  if (!o) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <ScreenHeader title="Opportunity" />
        <Text style={styles.none}>This opportunity is no longer available.</Text>
      </View>
    );
  }

  const isSaved = saved.includes(o.id);
  const dateLabel = feedItem ? `Deadline: ${feedItem.deadlineLabel}` : `Posted: ${mineItem?.postedLabel}`;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Opportunity"
          right={
            <Pressable onPress={() => toggleSaved(o.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={isSaved ? "Remove from saved" : "Save opportunity"}>
              <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={isSaved ? Colors.goldDark : Colors.navy} />
            </Pressable>
          }
        />
        <OppThumb category={o.category} featured={feedItem?.status === "Featured"} style={styles.banner} />
        <Text style={styles.title}>{o.title}</Text>
        <View style={styles.tags}>
          <Tag>{o.category}</Tag>
          <Tag>{o.industry}</Tag>
        </View>
        <View>
          <Meta icon="location">{o.location}</Meta>
          <Meta icon="cash">{o.valueLabel}</Meta>
          <Meta icon="calendar">{dateLabel}</Meta>
          {feedItem ? <Meta icon="business">{`Posted by ${feedItem.postedBy}`}</Meta> : null}
        </View>
        {feedItem ? (
          <View style={styles.about}>
            <Text style={styles.aboutTitle}>About this opportunity</Text>
            <Text style={styles.aboutText}>{feedItem.about}</Text>
          </View>
        ) : null}
        {feedItem ? <GoldButton label={interested ? "Interest Sent" : "Express Interest"} onPress={() => setInterested(true)} /> : (
          <GoldButton label="Back to My Opportunities" onPress={() => router.back()} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 16, gap: 14 },
  banner: { height: 170, borderRadius: 18 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, lineHeight: 27 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  about: { gap: 6 },
  aboutTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  aboutText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", paddingVertical: 40 },
});
