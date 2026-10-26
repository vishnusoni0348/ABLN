import { CARD_SHADOW } from "@/components/member-ui";
import { SearchBar } from "@/components/help-ui";
import { BottomSheet, GoldButton, RadioCard, SettingsScreen } from "@/components/settings-ui";
import { CategoryBadge, STATUS_TONE, StatusPill, categoryStyle } from "@/components/support-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { TICKET_STATUSES, useTickets, type Ticket, type TicketStatus } from "@/lib/support-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Filter = TicketStatus | "All";

const STAT_ICONS = { Open: "headset-outline", "In Progress": "time-outline", Resolved: "checkmark-circle" } as const;
const STAT_BG: Record<TicketStatus, string> = { Open: "#FDECEC", "In Progress": "#FDF1D8", Resolved: "#E3F5EC" };

function TicketCard({ ticket }: { ticket: Ticket }) {
  const cat = categoryStyle(ticket.category);
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/support-ticket", params: { id: ticket.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${ticket.id}, ${ticket.title}, ${ticket.status}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <CategoryBadge category={ticket.category} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardId}>#{ticket.id}</Text>
          <Text style={styles.cardDate}>{ticket.date}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {ticket.title}
        </Text>
        <View style={styles.cardMeta}>
          <Ionicons name={cat.icon} size={14} color={Colors.textSecondary} />
          <Text style={styles.cardCat} numberOfLines={1}>
            {ticket.category}
          </Text>
          <StatusPill status={ticket.status} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function SupportTickets() {
  const tickets = useTickets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sheet, setSheet] = useState(false);

  const counts = useMemo(() => Object.fromEntries(TICKET_STATUSES.map((s) => [s, tickets.filter((t) => t.status === s).length])) as Record<TicketStatus, number>, [tickets]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => (filter === "All" || t.status === filter) && (!q || [t.id, t.title, t.category, t.summary].some((v) => v.toLowerCase().includes(q))));
  }, [tickets, query, filter]);

  return (
    <SettingsScreen title="My Support Tickets" footer={<GoldButton label="Create Support Ticket" onPress={() => router.push("/contact-support")} />}>
      <Text style={styles.sub}>Get help and track your support requests.</Text>

      <View style={styles.stats}>
        {TICKET_STATUSES.map((s) => {
          const on = filter === s;
          return (
            <Pressable
              key={s}
              onPress={() => setFilter(on ? "All" : s)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${counts[s]} ${s} tickets`}
              style={[styles.stat, { backgroundColor: STAT_BG[s] }, on && { borderColor: STATUS_TONE[s].fg }]}
            >
              <Ionicons name={STAT_ICONS[s]} size={26} color={STATUS_TONE[s].fg} />
              <Text style={styles.statCount}>{counts[s]}</Text>
              <Text style={styles.statLabel}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search tickets..." />
        </View>
        <Pressable onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel="Filter tickets" style={[styles.filterBtn, filter !== "All" && { borderColor: Colors.gold }]}>
          <Ionicons name="options-outline" size={22} color={filter !== "All" ? Colors.goldDark : Colors.navy} />
        </Pressable>
      </View>

      {visible.length === 0 ? (
        <Text style={styles.empty}>{tickets.length === 0 ? "You haven't created any support tickets yet." : "No tickets match your search."}</Text>
      ) : (
        visible.map((t) => <TicketCard key={t.id} ticket={t} />)
      )}

      <BottomSheet visible={sheet} title="Filter by Status" onClose={() => setSheet(false)}>
        {(["All", ...TICKET_STATUSES] as Filter[]).map((f) => (
          <RadioCard
            key={f}
            title={f === "All" ? "All Tickets" : f}
            on={filter === f}
            onPress={() => {
              setFilter(f);
              setSheet(false);
            }}
          />
        ))}
      </BottomSheet>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, marginTop: -4 },
  stats: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 14, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: "transparent" },
  statCount: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, marginTop: 4 },
  statLabel: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  filterBtn: { width: 48, height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, paddingVertical: 40 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  cardBody: { flex: 1, minWidth: 0, gap: 4 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  cardId: { color: Colors.royalNavy, fontFamily: Fonts.medium, fontSize: 12 },
  cardDate: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cardCat: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, flexShrink: 1 },
});
