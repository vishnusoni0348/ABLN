import { ActionPill, AuthorHead } from "@/components/answer-ui";
import { WideBtn } from "@/components/ask-ui";
import { PersonAvatar } from "@/components/intro-ui";
import { CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { type Answer, EXPERT_NAMES } from "@/data/answers";
import { findMember } from "@/data/members";
import { CURRENT_USER } from "@/lib/introduction-store";
import { answersFor, deleteAnswer, toggleHelpfulQ, useQuestion, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "all" | "expert" | "member";
const LONG = 110;

function AnswerItem({ a, replies }: { a: Answer; replies: number }) {
  const { helpful, answers } = useQuestions();
  const mine = answers.some((x) => x.id === a.id);
  const on = helpful.includes(a.id);
  const open = () => router.push({ pathname: "/answer-detail", params: { id: a.id } });
  const more = () =>
    mine
      ? Alert.alert("Your answer", undefined, [
          {
            text: "Delete Answer",
            style: "destructive",
            onPress: () =>
              Alert.alert("Delete answer?", "This will permanently remove your answer and its replies.", [
                { text: "Keep", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteAnswer(a.id) },
              ]),
          },
          { text: "Cancel", style: "cancel" },
        ])
      : Alert.alert("Answer", undefined, [{ text: "Report", onPress: () => Alert.alert("Thanks", "Your report has been submitted.") }, { text: "Cancel", style: "cancel" }]);
  return (
    <View style={styles.card}>
      <AuthorHead
        name={a.author}
        expert={a.expert}
        hoursAgo={a.hoursAgo}
        right={
          <Pressable onPress={more} hitSlop={10} accessibilityRole="button" accessibilityLabel="More options">
            <Ionicons name="ellipsis-vertical" size={16} color={Colors.textSecondary} />
          </Pressable>
        }
      />
      <Text style={styles.body} numberOfLines={3}>
        {a.body}
      </Text>
      {a.body.length > LONG || a.points ? (
        <Pressable onPress={open} hitSlop={6} accessibilityRole="button">
          <Text style={styles.more}>Read More</Text>
        </Pressable>
      ) : null}
      <View style={styles.foot}>
        <ActionPill icon={on ? "thumbs-up" : "thumbs-up-outline"} label={String(a.helpful + (on ? 1 : 0))} on={on} onPress={() => toggleHelpfulQ(a.id)} />
        <ActionPill icon="chatbubble-outline" label={`Reply (${replies})`} onPress={open} />
      </View>
    </View>
  );
}

export default function QuestionAnswers() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuestion(id);
  const { answers, replies } = useQuestions();
  const [tab, setTab] = useState<Tab>("all");
  const [invited, setInvited] = useState<string[]>([]);

  if (!q) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.empty}>Question not found</Text>
      </View>
    );
  }

  const all = answersFor(q, answers);
  const experts = all.filter((a) => a.expert);
  const members = all.filter((a) => !a.expert);
  const list = tab === "all" ? all : tab === "expert" ? experts : members;
  const replyCount = (a: Answer) => a.replyCount + replies.filter((r) => r.aid === a.id).length;
  const answer = () => router.push({ pathname: "/reply-composer", params: { qid: q.id } });
  const toInvite = EXPERT_NAMES.map((n) => findMember(n)).filter((m) => m && m.name !== CURRENT_USER && m.name !== q.author).slice(0, 3);

  const tabs: [Tab, string][] = [
    ["all", `All (${all.length})`],
    ["expert", `Expert (${experts.length})`],
    ["member", `Member (${members.length})`],
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title={`Answers (${all.length})`} />
      </View>

      {all.length === 0 ? (
        <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.halo}>
            <View style={styles.doc}>
              {[44, 34, 40].map((w) => (
                <View key={w} style={[styles.docLine, { width: w }]} />
              ))}
            </View>
            <View style={styles.qmark}>
              <Text style={styles.qmarkText}>?</Text>
            </View>
          </View>
          <Text style={styles.emptyTitle}>No Answers Yet</Text>
          <Text style={styles.emptySub}>Be the first to share your knowledge and help the community.</Text>
          <View style={{ flexDirection: "row", marginTop: 18 }}>
            <WideBtn label="Answer This Question" icon="create-outline" onPress={answer} />
          </View>

          {toInvite.length ? (
            <View style={styles.invite}>
              <Text style={styles.inviteTitle}>Invite Experts to Answer</Text>
              {toInvite.map((m) => {
                if (!m) return null;
                const sent = invited.includes(m.name);
                return (
                  <View key={m.name} style={styles.inviteRow}>
                    <PersonAvatar name={m.name} size={44} />
                    <View style={styles.flex}>
                      <Text style={styles.name}>{m.name}</Text>
                      <Text style={styles.role} numberOfLines={2}>
                        {m.role}, {m.company}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setInvited((l) => (sent ? l : [...l, m.name]))}
                      style={[styles.inviteBtn, sent && styles.inviteBtnOn]}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: sent }}
                    >
                      <Text style={[styles.inviteText, sent && { color: Colors.textSecondary }]}>{sent ? "Invited" : "Invite"}</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <>
          <View style={styles.tabs}>
            {tabs.map(([k, label]) => (
              <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
                <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <ScrollView contentContainerStyle={[styles.list, { paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
            {list.length === 0 ? <Text style={styles.empty}>No {tab} answers yet.</Text> : null}
            {list.map((a) => (
              <AnswerItem key={a.id} a={a} replies={replyCount(a)} />
            ))}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <WideBtn label="Answer This Question" icon="create-outline" onPress={answer} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center" },
  pad: { paddingHorizontal: 16 },

  tabs: { flexDirection: "row", marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: Colors.gold },
  tabText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  tabTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },

  list: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, paddingVertical: 32 },
  card: { padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  body: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 12 },
  more: { color: "#2F6FDE", fontFamily: Fonts.semiBold, fontSize: 12, marginTop: 4 },
  foot: { flexDirection: "row", alignItems: "center", gap: 22, marginTop: 12 },
  footer: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },

  halo: { alignSelf: "center", width: 150, height: 150, borderRadius: 75, backgroundColor: "#FBEBCB", alignItems: "center", justifyContent: "center", marginTop: 24 },
  doc: { width: 76, height: 88, borderRadius: 8, backgroundColor: Colors.white, paddingTop: 18, paddingLeft: 12, gap: 8, transform: [{ translateX: -8 }] },
  docLine: { height: 5, borderRadius: 3, backgroundColor: "#DCE3EE" },
  qmark: { position: "absolute", right: 24, bottom: 26, width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  qmarkText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 26 },
  emptyTitle: { textAlign: "center", color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, marginTop: 18 },
  emptySub: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 6, paddingHorizontal: 12 },

  invite: { marginTop: 22, gap: 4 },
  inviteTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginBottom: 6 },
  inviteRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  inviteBtn: { paddingHorizontal: 16, height: 34, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  inviteBtnOn: { borderColor: Colors.border, backgroundColor: "#F5F7FA" },
  inviteText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
});
