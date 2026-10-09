import { ActionPill, AuthorHead, RoleBadge } from "@/components/answer-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { deleteAnswer, deleteReply, repliesFor, toggleHelpfulQ, useAnswer, useQuestions } from "@/lib/question-store";
import { PersonAvatar } from "@/components/intro-ui";
import { timeAgo } from "@/data/questions";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AnswerDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = useAnswer(id);
  const { helpful, replies, answers } = useQuestions();

  if (!a) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.body}>Answer not found</Text>
      </View>
    );
  }

  const on = helpful.includes(a.id);
  const thread = repliesFor(a, replies);
  const report = () => Alert.alert("Report answer", "Why are you reporting this answer?", [{ text: "Spam or irrelevant", onPress: () => Alert.alert("Thanks", "Your report has been submitted.") }, { text: "Cancel", style: "cancel" }]);
  const mine = answers.some((x) => x.id === a.id);
  const confirmDeleteAnswer = () =>
    Alert.alert("Delete answer?", "This will permanently remove your answer and its replies.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteAnswer(a.id);
          router.back();
        },
      },
    ]);
  const confirmDeleteReply = (rid: string) =>
    Alert.alert("Delete reply?", "This will permanently remove your reply.", [
      { text: "Keep", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteReply(rid) },
    ]);
  const reply = () => router.push({ pathname: "/reply-composer", params: { aid: a.id } });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="Answer Detail" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {a.expert ? (
          <View style={styles.banner}>
            <Ionicons name="ribbon" size={13} color={Colors.goldDark} />
            <Text style={styles.bannerText}>Expert Answer</Text>
          </View>
        ) : null}
        <AuthorHead name={a.author} expert={a.expert} hoursAgo={a.hoursAgo} size={52} />

        <Text style={styles.body}>{a.body}</Text>
        {a.points?.map((p, i) => (
          <View key={p.title} style={styles.point}>
            <View style={styles.num}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            <Text style={styles.pointText}>
              <Text style={styles.pointTitle}>{p.title}</Text> – {p.text}
            </Text>
          </View>
        ))}
        {a.closing ? <Text style={[styles.body, { marginTop: 14 }]}>{a.closing}</Text> : null}

        <View style={styles.actions}>
          <ActionPill icon={on ? "thumbs-up" : "thumbs-up-outline"} label={String(a.helpful + (on ? 1 : 0))} on={on} onPress={() => toggleHelpfulQ(a.id)} />
          <ActionPill icon="chatbubble-outline" label={`Reply (${thread.length})`} onPress={reply} />
          {mine ? <ActionPill icon="trash-outline" label="Delete" onPress={confirmDeleteAnswer} /> : <ActionPill icon="flag-outline" label="Report" onPress={report} />}
        </View>

        <Text style={styles.replies}>Replies ({thread.length})</Text>
        {thread.length === 0 ? <Text style={styles.none}>No replies yet. Start the conversation.</Text> : null}
        {thread.map((r) => (
          <View key={r.id} style={styles.reply}>
            <View style={styles.replyHead}>
              <PersonAvatar name={r.author} size={34} />
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <Text style={styles.rName}>{r.author}</Text>
                  <RoleBadge expert={!!r.expert} />
                </View>
                <Text style={styles.rTime}>{timeAgo(r.hoursAgo)}</Text>
              </View>
              {replies.some((x) => x.id === r.id) ? (
                <Pressable onPress={() => confirmDeleteReply(r.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Delete reply">
                  <Ionicons name="trash-outline" size={17} color={Colors.error} />
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.rBody}>{r.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center" },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16 },
  banner: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: "#FDF0D2", marginBottom: 12 },
  bannerText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 11 },

  body: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22, marginTop: 14 },
  point: { flexDirection: "row", gap: 12, marginTop: 14 },
  num: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  numText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 12 },
  pointText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20 },
  pointTitle: { fontFamily: Fonts.bold },

  actions: { flexDirection: "row", alignItems: "center", gap: 22, marginTop: 18, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#EEF1F5" },
  replies: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 18 },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 10 },
  reply: { marginTop: 12, padding: 12, borderRadius: Radius.md, backgroundColor: "#F8FAFC" },
  replyHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  rTime: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  rBody: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 8 },
});
