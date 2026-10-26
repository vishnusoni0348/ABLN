import { FaqRow, SearchBar, SectionRow, SupportBanner, TicketRow } from "@/components/help-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { POPULAR_FAQS } from "@/data/help";
import { useTickets } from "@/lib/support-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TILES: { icon: IconName; title: string; sub: string; href: "/faq-categories" | "/contact-support" | "/report-problem" | "/app-guide" }[] = [
  { icon: "document-text-outline", title: "FAQs", sub: "Find answers to common questions", href: "/faq-categories" },
  { icon: "headset-outline", title: "Contact Support", sub: "Get help from our team", href: "/contact-support" },
  { icon: "warning-outline", title: "Report a Problem", sub: "Let us know the issue", href: "/report-problem" },
  { icon: "book-outline", title: "App Guide", sub: "Learn how to use ABLN", href: "/app-guide" },
];

export default function HelpSupport() {
  const [query, setQuery] = useState("");
  const tickets = useTickets();

  const search = () => router.push({ pathname: "/faq-results", params: { q: query.trim() } });

  return (
    <SettingsScreen title="Help & Support">
      <SupportBanner title={"We're Here\nTo Help You"} sub="Find answers, get support and make the most of ABLN." agent />

      <SearchBar value={query} onChangeText={setQuery} onSubmit={search} placeholder="Search for help, FAQs..." />

      <View style={styles.grid}>
        {TILES.map((t) => (
          <Pressable key={t.title} onPress={() => router.push(t.href)} accessibilityRole="button" style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}>
            <Ionicons name={t.icon} size={26} color={Colors.goldDark} />
            <Text style={styles.tileTitle}>{t.title}</Text>
            <Text style={styles.tileSub}>{t.sub}</Text>
          </Pressable>
        ))}
      </View>

      <SectionRow title="Popular Help Topics" action="See All" onAction={() => router.push("/faq-categories")} />
      {POPULAR_FAQS.map((f) => (
        <FaqRow key={f.id} faq={f} showCategory={false} />
      ))}

      {tickets.length ? (
        <>
          <SectionRow title="Your Recent Reports" action="See All" onAction={() => router.push("/support-tickets")} />
          {tickets.slice(0, 2).map((t) => (
            <TicketRow key={t.id} ticket={t} />
          ))}
        </>
      ) : null}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", flexGrow: 1, gap: 4, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FEF6E6", ...CARD_SHADOW },
  tileTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginTop: 4 },
  tileSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
});
