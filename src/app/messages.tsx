import { EmptyState } from "@/components/empty-state";
import { BackHeader, PersonAvatar } from "@/components/intro-ui";
import { ConfirmDialog, OnlineDot } from "@/components/chat-ui";
import { CARD_SHADOW, GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { deleteConversation, formatListTime, lastMessage, previewText, useConversations, useMessageRequests, useSentRequests } from "@/lib/chat-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Filter = "all" | "unread";

export default function Messages() {
  const insets = useSafeAreaInsets();
  const conversations = useConversations();
  const requests = useMessageRequests();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const sent = useSentRequests();

  // Requests you sent sit in the list beside your chats, marked Pending until the other side accepts.
  type Row = { name: string; online?: boolean; unread: number; preview: string; at: Date; pending?: boolean };
  const rows: Row[] = [
    ...conversations.map((c) => ({ name: c.name, online: c.online, unread: c.unread, preview: previewText(c), at: lastMessage(c).at })),
    ...sent.filter((r) => !r.deleted && !conversations.some((c) => c.name === r.name)).map((r) => ({ name: r.name, unread: 0, preview: r.text, at: r.sentAt, pending: true })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const q = query.trim().toLowerCase();
  const items = rows.filter((c) => (filter === "all" || c.unread > 0) && (!q || c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)));
  const openChat = (name: string) => router.push({ pathname: "/chat", params: { name } });
  const [deleting, setDeleting] = useState<string | null>(null);
  const confirmDelete = (name: string) => setDeleting(name);
  const isEmpty = rows.length === 0 && requests.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <BackHeader title="Messages" />
      </View>

      {isEmpty ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No messages yet"
          text="Start a conversation with fellow ABLN members. Connect, collaborate and create new opportunities together."
          cta={{ label: "Start Messaging", onPress: () => router.push("/new-message") }}
        />
      ) : (
        <>
          <View style={styles.chips}>
            {([["all", "All"], ["unread", "Unread"]] as [Filter, string][]).map(([key, label]) => (
              <Pressable key={key} onPress={() => setFilter(key)} style={[styles.chip, filter === key && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: filter === key }}>
                <Text style={[styles.chipText, filter === key && styles.chipTextOn]}>{label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => router.push("/message-requests")} style={styles.chip} accessibilityRole="button">
              <Text style={styles.chipText}>Requests</Text>
              {requests.length > 0 ? (
                <View style={styles.reqBadge}>
                  <Text style={styles.reqBadgeText}>{requests.length}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search conversations..."
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
            />
            {query ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={items}
            keyExtractor={(c) => c.name}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState inline icon="search-outline" title="No conversations" text={filter === "unread" ? "You're all caught up." : "Try a different search."} />}
            renderItem={({ item: c }) => (
              <Pressable onPress={() => openChat(c.name)} onLongPress={() => confirmDelete(c.name)} style={styles.row} accessibilityRole="button" accessibilityLabel={`Chat with ${c.name}`}>
                <View>
                  <PersonAvatar name={c.name} size={52} />
                  {c.online ? <OnlineDot style={styles.dot} /> : null}
                </View>
                <View style={styles.info}>
                  <View style={styles.top}>
                    <Text style={styles.name} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.time}>{formatListTime(c.at)}</Text>
                  </View>
                  <View style={styles.top}>
                    <Text style={[styles.preview, c.unread > 0 && styles.previewUnread]} numberOfLines={1}>
                      {c.pending ? `You: ${c.preview}` : c.preview}
                    </Text>
                    {c.pending ? (
                      <View style={styles.pendingPill}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    ) : null}
                    {c.unread > 0 ? (
                      <View style={styles.unread}>
                        <Text style={styles.unreadText}>{c.unread}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            )}
          />
        </>
      )}

      <ConfirmDialog
        visible={deleting !== null}
        title="Delete chat?"
        message={`This removes your conversation with ${deleting ?? ""}.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteConversation(deleting);
          setDeleting(null);
        }}
      />

      <Pressable
        onPress={() => router.push("/new-message")}
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 8 }]}
        accessibilityRole="button"
        accessibilityLabel="New message"
      >
        <Ionicons name="create-outline" size={24} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  chips: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 4 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipOn: { backgroundColor: GOLD_BG, borderColor: Colors.gold },
  chipText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  chipTextOn: { fontFamily: Fonts.bold, color: Colors.goldDark },
  reqBadge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  reqBadgeText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 10 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 46, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, borderRadius: Radius.md, backgroundColor: "#F1F4F8" },
  searchInput: { flex: 1, padding: 0, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100, flexGrow: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  dot: { position: "absolute", right: 0, bottom: 0 },
  info: { flex: 1, minWidth: 0, gap: 4 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  time: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  preview: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  previewUnread: { color: Colors.navy, fontFamily: Fonts.semiBold },
  pendingPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: GOLD_BG },
  pendingText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 10 },
  unread: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  unreadText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 11 },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.goldDark, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
});
