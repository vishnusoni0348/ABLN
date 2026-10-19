import { ConfirmDialog, OnlineDot } from "@/components/chat-ui";
import { GoldButton, OutlineButton, PersonAvatar } from "@/components/intro-ui";
import { findMember } from "@/data/members";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { useConnections } from "@/lib/connection-store";
import { acceptRequest, declineRequest, deleteConversation, formatClock, markRead, sendMessage, sendMessageRequest, toggleMute, useConversation, useMessageRequest, useSentRequests, type ChatMessage } from "@/lib/chat-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Linking, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BUBBLE_ME = "#FBE9B7";

function Bubble({ m }: { m: ChatMessage }) {
  const mine = m.from === "me";
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      {m.text ? <Text style={styles.msgText}>{m.text}</Text> : null}
      {m.file ? (
        <View style={styles.file}>
          <View style={styles.fileIcon}>
            <Ionicons name="document-text" size={22} color={Colors.error} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {m.file.name}
            </Text>
            <Text style={styles.fileSize}>{m.file.size}</Text>
          </View>
          <Ionicons name="download-outline" size={20} color={Colors.navy} />
        </View>
      ) : null}
      <View style={styles.meta}>
        <Text style={styles.time}>{formatClock(m.at)}</Text>
        {mine ? <Ionicons name="checkmark-done" size={14} color="#2F6FDE" /> : null}
      </View>
    </View>
  );
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name?: string; request?: string }>();
  const request = useMessageRequest(params.request);
  const name = request?.name ?? params.name ?? "";
  const existing = useConversation(name);
  // A pending request opens read-only, with Accept / Decline instead of the composer.
  // A request you sent is also read-only: no more messages until they accept.
  const sent = useSentRequests().find((r) => r.name === name);
  const sentPending = !request && !existing && !!sent;
  // Outside your network you get one message; after that the chat is locked until they accept.
  const { connections } = useConnections();
  const connected = connections.some((c) => c.name === name);
  const firstMessageOnly = !request && !existing && !sent && !!name && !connected;
  const convo = request
    ? { name, unread: 0, messages: [{ id: request.id, from: "them" as const, text: request.text, at: request.sentAt }], online: false }
    : sentPending
      ? { name, unread: 0, messages: sent.deleted ? [] : [{ id: `sent-${name}`, from: "me" as const, text: sent.text, at: sent.sentAt }], online: false }
      : existing;
  const member = findMember(name);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const list = useRef<FlatList<ChatMessage>>(null);
  const messages = convo?.messages ?? [];

  useEffect(() => {
    if (!request) markRead(name);
  }, [name, messages.length, request]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const confirmDelete = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };
  const doDelete = () => {
    setDeleteOpen(false);
    deleteConversation(name);
    if (router.canGoBack()) router.back();
    else router.replace("/messages");
  };

  const menuItems: { label: string; icon: ComponentProps<typeof Ionicons>["name"]; danger?: boolean; onPress: () => void }[] = [
    ...(member ? [{ label: "View Profile", icon: "person-outline" as const, onPress: () => router.push({ pathname: "/member-profile", params: { name } }) }] : []),
    ...(existing ? [{ label: existing.muted ? "Unmute Notifications" : "Mute Notifications", icon: (existing.muted ? "notifications-outline" : "notifications-off-outline") as ComponentProps<typeof Ionicons>["name"], onPress: () => toggleMute(name) }] : []),
    { label: "Report / Block", icon: "flag-outline", onPress: () => router.push({ pathname: "/report-block", params: { name, tab: "block" } }) },
    ...((existing || (sentPending && !sent?.deleted)) && !request ? [{ label: "Delete Chat", icon: "trash-outline" as const, danger: true, onPress: confirmDelete }] : []),
  ];

  const send = () => {
    const t = text.trim();
    if (!t) return;
    if (firstMessageOnly) sendMessageRequest(name, t);
    else sendMessage(name, t);
    setText("");
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/messages"))} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </Pressable>
        <Pressable style={styles.who} onPress={() => member && router.push({ pathname: "/member-profile", params: { name } })} accessibilityRole="button" accessibilityLabel={`View ${name}'s profile`}>
          <View>
            <PersonAvatar name={name} size={40} />
            {convo?.online ? <OnlineDot style={styles.dot} /> : null}
          </View>
          <View style={styles.whoText}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {convo?.online ? <Text style={styles.online}>Online</Text> : member ? <Text style={styles.sub}>{member.company}</Text> : null}
          </View>
        </Pressable>
        {member?.phone && connected ? (
          <Pressable onPress={() => Linking.openURL(`tel:${member.phone}`).catch(() => {})} hitSlop={10} style={styles.call} accessibilityRole="button" accessibilityLabel={`Call ${name}`}>
            <Ionicons name="call-outline" size={22} color={Colors.navy} />
          </Pressable>
        ) : null}
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={10} style={styles.call} accessibilityRole="button" accessibilityLabel="More options">
          <Ionicons name="ellipsis-vertical" size={22} color={Colors.navy} />
        </Pressable>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu" />
        <View style={[styles.menu, { top: insets.top + 50 }]}>
          {menuItems.map((it, i) => (
            <Pressable
              key={it.label}
              onPress={() => {
                setMenuOpen(false);
                it.onPress();
              }}
              style={[styles.menuItem, i > 0 && styles.menuDivider]}
              accessibilityRole="menuitem"
            >
              <Ionicons name={it.icon} size={20} color={it.danger ? Colors.error : Colors.navy} />
              <Text style={[styles.menuText, it.danger && { color: Colors.error }]}>{it.label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>

      <ConfirmDialog
        visible={deleteOpen}
        title="Delete chat?"
        message={`This removes your conversation with ${name}.`}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={doDelete}
      />

      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.thread}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
        ListHeaderComponent={
          messages.length > 0 ? (
            <View style={styles.dayPill}>
              <Text style={styles.dayText}>Today</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={sentPending ? null : <Text style={styles.hint}>Say hello to {name} 👋</Text>}
        renderItem={({ item }) => <Bubble m={item} />}
      />

      {sentPending ? (
        <View style={[styles.requestBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <View style={styles.lockRow}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.goldDark} />
            <Text style={styles.lockText}>You can&apos;t send more messages until {name} accepts your request.</Text>
          </View>
        </View>
      ) : request ? (
        <View style={[styles.requestBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Text style={styles.requestNote}>{name} isn&apos;t in your network yet. Accept to reply.</Text>
          <View style={styles.requestActions}>
            <View style={styles.requestBtn}>
              <OutlineButton
                label="Decline"
                onPress={() => {
                  declineRequest(request.id);
                  router.back();
                }}
              />
            </View>
            <View style={styles.requestBtn}>
              <GoldButton
                label="Accept"
                onPress={() => {
                  acceptRequest(request.id);
                  router.replace({ pathname: "/chat", params: { name } });
                }}
              />
            </View>
          </View>
        </View>
      ) : (
      <View>
      {firstMessageOnly ? <Text style={styles.firstNote}>You aren&apos;t connected with {name}. You can send only one message until they accept.</Text> : null}
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.inputWrap}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
            maxLength={2000}
          />
        </View>
        <Pressable onPress={send} disabled={!text.trim()} style={[styles.send, !text.trim() && { opacity: 0.5 }]} accessibilityRole="button" accessibilityLabel="Send message">
          <Ionicons name="paper-plane" size={20} color={Colors.white} />
        </Pressable>
      </View>
      </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F4EF" },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  back: { width: 32, height: 40, justifyContent: "center" },
  who: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  whoText: { flex: 1, minWidth: 0 },
  dot: { position: "absolute", right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  online: { color: Colors.success, fontFamily: Fonts.medium, fontSize: 12 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  menu: { position: "absolute", right: 12, minWidth: 210, borderRadius: Radius.md, backgroundColor: Colors.white, shadowColor: Colors.navy, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuDivider: { borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  menuText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 14 },
  call: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },

  thread: { padding: 16, gap: 10, flexGrow: 1 },
  dayPill: { alignSelf: "center", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, backgroundColor: "#E6EAF0", marginBottom: 6 },
  dayText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12 },
  hint: { textAlign: "center", marginTop: 40, color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  bubble: { maxWidth: "82%", paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, borderRadius: Radius.lg },
  mine: { alignSelf: "flex-end", backgroundColor: BUBBLE_ME, borderBottomRightRadius: 4 },
  theirs: { alignSelf: "flex-start", backgroundColor: Colors.white, borderBottomLeftRadius: 4 },
  msgText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 },
  time: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10 },
  file: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 230 },
  fileIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#FBE3E3", alignItems: "center", justifyContent: "center" },
  fileInfo: { flex: 1, minWidth: 0 },
  fileName: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  fileSize: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },

  requestBar: { gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  firstNote: { paddingHorizontal: 16, paddingVertical: 8, color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12, textAlign: "center", backgroundColor: "#FEF6E6" },
  lockRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  lockText: { flexShrink: 1, color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12, textAlign: "center" },
  requestNote: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, textAlign: "center" },
  requestActions: { flexDirection: "row", gap: 10 },
  requestBtn: { flex: 1 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 12, paddingTop: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: "#EEF1F5" },
  inputWrap: { flex: 1, minHeight: 44, maxHeight: 120, justifyContent: "center", paddingHorizontal: 16, borderRadius: 22, backgroundColor: "#F1F4F8" },
  input: { paddingVertical: 8, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.goldDark, alignItems: "center", justifyContent: "center" },
});
