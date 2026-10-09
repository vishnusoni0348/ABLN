import { AuthorHead } from "@/components/answer-ui";
import { WideBtn } from "@/components/ask-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { postAnswer, postReply, useAnswer, useQuestion } from "@/lib/question-store";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX = 500;

// Writes a reply to an answer (`aid`) or a new answer to a question (`qid`).
export default function ReplyComposer() {
  const insets = useSafeAreaInsets();
  const { aid, qid } = useLocalSearchParams<{ aid?: string; qid?: string }>();
  const answer = useAnswer(aid);
  const question = useQuestion(qid);
  const [text, setText] = useState("");

  const replying = !!aid;
  const ready = text.trim().length > 0 && (replying ? !!answer : !!question);

  const post = () => {
    if (replying && answer) {
      postReply(answer.id, text);
      router.back();
    } else if (question) {
      postAnswer(question.id, text);
      router.replace({ pathname: "/question-answers", params: { id: question.id } });
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title={replying ? "Reply to Answer" : "Answer Question"} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.context}>
          {replying && answer ? (
            <>
              <AuthorHead name={answer.author} expert={answer.expert} hoursAgo={answer.hoursAgo} size={44} />
              <View style={styles.quote}>
                <Text style={styles.quoteText} numberOfLines={2}>
                  “{answer.body}”
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.qTitle}>{question?.title ?? "Question not found"}</Text>
          )}
        </View>

        <View style={styles.box}>
          <TextInput
            value={text}
            onChangeText={setText}
            maxLength={MAX}
            multiline
            autoFocus
            placeholder={replying ? "Write your reply..." : "Share your knowledge and experience..."}
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />
          <Text style={styles.count}>
            {text.length}/{MAX}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <WideBtn label="Cancel" outline onPress={() => router.back()} />
        <WideBtn label={replying ? "Post Reply" : "Post Answer"} icon="paper-plane-outline" disabled={!ready} onPress={post} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  context: { padding: 12, borderRadius: Radius.lg, borderWidth: 1, borderColor: "#E3E9F2", gap: 10 },
  quote: { padding: 10, borderRadius: Radius.md, backgroundColor: "#F5F7FA" },
  quoteText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  qTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21 },
  box: { minHeight: 200, padding: 14, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.gold },
  input: { minHeight: 150, padding: 0, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, textAlignVertical: "top" },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
