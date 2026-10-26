import { CARD_SHADOW } from "@/components/member-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { CategoryBadge, StatusPill } from "@/components/support-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { formatStamp, replyToTicket, useTicket, type TicketMessage } from "@/lib/support-store";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const MAX_BYTES = 5 * 1024 * 1024;
const BUBBLE_ME = "#EAF1FD";
const BUBBLE_SUPPORT = "#FEF6E6";

const formatSize = (bytes?: number) => (bytes ? (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`) : "");

function Message({ m }: { m: TicketMessage }) {
  const mine = m.from === "me";
  return (
    <View style={styles.msgRow}>
      <View style={[styles.avatar, { backgroundColor: mine ? "#E8F0FE" : "#FDF1D8" }]}>
        <Ionicons name={mine ? "person" : "headset"} size={20} color={mine ? Colors.navy : Colors.goldDark} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.msgTop}>
          <Text style={styles.msgFrom}>{mine ? "You" : "Support Team"}</Text>
          <Text style={styles.msgTime}>{formatStamp(m.at)}</Text>
        </View>
        <View style={[styles.bubble, { backgroundColor: mine ? BUBBLE_ME : BUBBLE_SUPPORT }]}>
          {m.text ? <Text style={styles.msgText}>{m.text}</Text> : null}
          {m.file ? (
            <View style={styles.file}>
              <Ionicons name="image-outline" size={24} color={Colors.navy} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {m.file.name}
                </Text>
                {m.file.size ? <Text style={styles.fileSize}>{m.file.size}</Text> : null}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function SupportTicket() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const ticket = useTicket(id);
  const [text, setText] = useState("");
  const scroll = useRef<ScrollView>(null);

  if (!ticket) {
    return (
      <SettingsScreen title="Ticket Details">
        <Text style={styles.empty}>This ticket could not be found.</Text>
      </SettingsScreen>
    );
  }

  const resolved = ticket.status === "Resolved";

  const send = () => {
    if (!text.trim()) return;
    replyToTicket(ticket.id, { text });
    setText("");
  };

  const attach = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Please allow photo access to attach a screenshot.");
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_BYTES) return Alert.alert("Image too large", "Please choose an image smaller than 5 MB.");
    replyToTicket(ticket.id, { text: text.trim(), file: { name: asset.fileName ?? asset.uri.split("/").pop() ?? "attachment.jpg", size: formatSize(asset.fileSize), uri: asset.uri } });
    setText("");
  };

  return (
    <SettingsScreen
      title="Ticket Details"
      scrollRef={scroll}
      onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      right={
        <Pressable onPress={() => router.push({ pathname: "/support-ticket-status", params: { id: ticket.id } })} hitSlop={10} accessibilityRole="button" accessibilityLabel="View ticket status">
          <Ionicons name="git-commit-outline" size={24} color={Colors.navy} />
        </Pressable>
      }
      footer={
        resolved ? (
          <Text style={styles.resolvedNote}>This ticket has been resolved. Create a new ticket if you need more help.</Text>
        ) : (
          <View style={styles.composer}>
            <Pressable onPress={attach} hitSlop={8} accessibilityRole="button" accessibilityLabel="Attach screenshot" style={styles.attach}>
              <Ionicons name="attach" size={24} color={Colors.textSecondary} />
            </Pressable>
            <View style={styles.inputWrap}>
              <TextInput value={text} onChangeText={setText} placeholder="Write a reply..." placeholderTextColor={Colors.textMuted} style={styles.input} multiline maxLength={500} />
            </View>
            <Pressable onPress={send} disabled={!text.trim()} accessibilityRole="button" accessibilityLabel="Send reply" style={[styles.send, !text.trim() && { opacity: 0.5 }]}>
              <Ionicons name="paper-plane" size={20} color={Colors.white} />
            </Pressable>
          </View>
        )
      }
    >
      <View style={styles.head}>
        <CategoryBadge category={ticket.category} size={48} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text style={styles.title}>{ticket.title}</Text>
          <View style={styles.headRow}>
            <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
            <StatusPill status={ticket.status} />
          </View>
        </View>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="folder-open-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{ticket.category}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="flag-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{ticket.priority}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{formatStamp(ticket.createdAt)}</Text>
        </View>
      </View>

      {ticket.messages.map((m) => (
        <Message key={m.id} m={m} />
      ))}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, paddingVertical: 40 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  ticketId: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  meta: { flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 6, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  msgRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  msgTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  msgFrom: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  msgTime: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  bubble: { marginTop: 4, padding: 12, borderRadius: Radius.md, gap: 10 },
  msgText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  file: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: Radius.sm, backgroundColor: Colors.white, borderWidth: 1, borderColor: "#E3E9F2" },
  fileName: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  fileSize: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  resolvedNote: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12, paddingVertical: 6 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  attach: { width: 40, height: 44, alignItems: "center", justifyContent: "center" },
  inputWrap: { flex: 1, minHeight: 44, maxHeight: 120, justifyContent: "center", paddingHorizontal: 16, borderRadius: 22, backgroundColor: "#F1F4F8" },
  input: { paddingVertical: 8, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.goldDark, alignItems: "center", justifyContent: "center" },
});
