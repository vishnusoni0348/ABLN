import { WideBtn } from "@/components/ask-ui";
import { PersonAvatar } from "@/components/intro-ui";
import { CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { EXPERT_NAMES } from "@/data/answers";
import { findMember } from "@/data/members";
import { catsOf, timeAgo } from "@/data/questions";
import { CURRENT_USER } from "@/lib/introduction-store";
import { toggleHelpfulQ, useQuestion, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuestionDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuestion(id);
  const { helpful, answers } = useQuestions();

  if (!q) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.name}>Question not found</Text>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const author = findMember(q.author);
  const isHelpful = helpful.includes(q.id);
  const answerCount = q.answers + answers.filter((a) => a.qid === q.id).length;
  const views = 40 + q.helpful * 12 + answerCount * 5;
  const expert = EXPERT_NAMES.map((n) => findMember(n)).find((m) => m && m.name !== q.author && m.name !== CURRENT_USER);

  const share = () => Share.share({ message: `${q.title} - asked on ABLN Ask Network` }).catch(() => {});
  const report = () => Alert.alert("Report question", "Why are you reporting this question?", [{ text: "Spam or irrelevant", onPress: () => Alert.alert("Thanks", "Your report has been submitted.") }, { text: "Cancel", style: "cancel" }]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="Question Detail" />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.cats}>
            {catsOf(q).map((c) => (
              <View key={c} style={styles.catPill}>
                <Text style={styles.catText}>{c}</Text>
              </View>
            ))}
          </View>
          <View style={styles.open}>
            <Ionicons name="ellipse" size={7} color={Colors.success} />
            <Text style={styles.openText}>Open</Text>
          </View>
        </View>

        <Text style={styles.title}>{q.title}</Text>

        <View style={styles.author}>
          <PersonAvatar name={q.author} size={46} />
          <View style={styles.flex}>
            <Text style={styles.name}>{q.author}</Text>
            <Text style={styles.role} numberOfLines={1}>
              {author ? `${author.role}, ${author.company}` : "ABLN Member"}
            </Text>
            {author ? (
              <View style={styles.loc}>
                <Ionicons name="location" size={11} color={Colors.goldDark} />
                <Text style={styles.locText}>{author.location}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.time}>{timeAgo(q.hoursAgo)}</Text>
        </View>

        <Text style={styles.body}>{q.body ?? `I am looking for guidance on this: ${q.title} Any advice from someone who has done this successfully would be really helpful.`}</Text>

        <View style={styles.tags}>
          {q.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={styles.stats}>
          {[
            { icon: "eye-outline" as const, v: views, l: "Views" },
            { icon: "chatbubble-ellipses-outline" as const, v: answerCount, l: "Answers" },
            { icon: "thumbs-up-outline" as const, v: q.helpful + (isHelpful ? 1 : 0), l: "Helpful" },
          ].map((s, i) => (
            <View key={s.l} style={[styles.stat, i > 0 && styles.statDiv]}>
              <View style={styles.statTop}>
                <Ionicons name={s.icon} size={18} color={Colors.navy} />
                <Text style={styles.statV}>{s.v}</Text>
              </View>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.act, isHelpful && styles.actOn]} onPress={() => toggleHelpfulQ(q.id)} accessibilityRole="button" accessibilityState={{ selected: isHelpful }}>
            <Ionicons name={isHelpful ? "heart" : "heart-outline"} size={17} color={Colors.goldDark} />
            <Text style={[styles.actText, { color: Colors.goldDark }]}>Helpful</Text>
          </Pressable>
          <Pressable style={styles.act} onPress={share} accessibilityRole="button">
            <Ionicons name="share-outline" size={17} color={Colors.navy} />
            <Text style={styles.actText}>Share</Text>
          </Pressable>
          <Pressable style={styles.act} onPress={report} accessibilityRole="button">
            <Ionicons name="flag-outline" size={17} color={Colors.navy} />
            <Text style={styles.actText}>Report</Text>
          </Pressable>
        </View>

        {expert ? (
          <View style={styles.related}>
            <Text style={styles.relTitle}>Related Experts</Text>
            <View style={styles.relRow}>
              <PersonAvatar name={expert.name} size={44} />
              <View style={styles.flex}>
                <Text style={styles.name}>{expert.name}</Text>
                <Text style={styles.role} numberOfLines={1}>
                  {expert.role}, {expert.company}
                </Text>
                <View style={styles.tags}>
                  {expert.expertise.slice(0, 2).map((t) => (
                    <View key={t} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={{ marginTop: 12, flexDirection: "row" }}>
              <WideBtn label="Ask This Expert" onPress={() => router.push({ pathname: "/ask-expert", params: { name: expert.name } })} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <WideBtn label={`View Answers (${answerCount})`} icon="chatbubbles-outline" outline onPress={() => router.push({ pathname: "/question-answers", params: { id: q.id } })} />
        <WideBtn label="Answer" icon="create-outline" onPress={() => router.push({ pathname: "/reply-composer", params: { qid: q.id } })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  center: { alignItems: "center", justifyContent: "center" },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16 },
  back: { marginTop: 16, paddingHorizontal: 24, height: 44, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  backText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 14 },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cats: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  catPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: "#EEF2FA" },
  catText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11 },
  open: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: "#E4F6EC" },
  openText: { color: Colors.success, fontFamily: Fonts.semiBold, fontSize: 11 },

  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, lineHeight: 27, marginTop: 14 },
  author: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 1 },
  loc: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  locText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  time: { alignSelf: "flex-end", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },

  body: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22, marginTop: 16 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tag: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 12, backgroundColor: "#FDF0D2" },
  tagText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11 },

  stats: { flexDirection: "row", marginTop: 18, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#EEF1F5" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statDiv: { borderLeftWidth: 1, borderLeftColor: "#EEF1F5" },
  statTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  statV: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  statL: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },

  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  act: { flex: 1, height: 42, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  actOn: { borderColor: Colors.gold, backgroundColor: "#FDF3DC" },
  actText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 12 },

  related: { marginTop: 20, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  relTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginBottom: 12 },
  relRow: { flexDirection: "row", gap: 10 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
