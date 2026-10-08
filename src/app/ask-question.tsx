import { WideBtn } from "@/components/ask-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { QCATEGORIES } from "@/data/questions";
import { setDraft, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_TITLE = 150;
const MAX_BODY = 1000;
const MAX_TAGS = 5;

export default function AskQuestion() {
  const insets = useSafeAreaInsets();
  const { draft } = useQuestions();
  const [tag, setTag] = useState("");
  const [pick, setPick] = useState(false);

  const valid = draft.title.trim().length > 0 && draft.body.trim().length > 0 && !!draft.category;
  const addTag = () => {
    const t = tag.trim();
    if (t && draft.tags.length < MAX_TAGS && !draft.tags.some((x) => x.toLowerCase() === t.toLowerCase())) setDraft({ tags: [...draft.tags, t] });
    setTag("");
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title={draft.editingId ? "Edit Question" : "Ask a Question"} />
      </View>

      <Modal visible={pick} transparent animationType="slide" onRequestClose={() => setPick(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPick(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Select category</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {QCATEGORIES.map((c) => (
              <Pressable
                key={c.key}
                style={styles.option}
                onPress={() => {
                  setDraft({ category: c.key });
                  setPick(false);
                }}
              >
                <Ionicons name={c.icon} size={20} color="#2F6FDE" />
                <Text style={[styles.optionText, draft.category === c.key && { fontFamily: Fonts.bold }]}>{c.key}</Text>
                {draft.category === c.key ? <Ionicons name="checkmark" size={18} color={Colors.goldDark} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>
          Question Title <Text style={styles.req}>*</Text>
        </Text>
        <View style={styles.box}>
          <TextInput
            value={draft.title}
            onChangeText={(title) => setDraft({ title })}
            maxLength={MAX_TITLE}
            placeholder="Enter a clear and concise question title"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />
        </View>
        <Text style={styles.count}>
          {draft.title.length}/{MAX_TITLE}
        </Text>

        <Text style={styles.label}>
          Description <Text style={styles.req}>*</Text>
        </Text>
        <View style={[styles.box, styles.bodyBox]}>
          <TextInput
            value={draft.body}
            onChangeText={(body) => setDraft({ body })}
            maxLength={MAX_BODY}
            multiline
            placeholder={"Provide more details about your question.\nInclude any specific context, challenges or what kind of advice you are looking for..."}
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, styles.bodyInput]}
          />
          <Text style={[styles.count, { marginTop: 0 }]}>
            {draft.body.length}/{MAX_BODY}
          </Text>
        </View>

        <Text style={styles.label}>
          Category <Text style={styles.req}>*</Text>
        </Text>
        <Pressable style={[styles.box, styles.select]} onPress={() => setPick(true)} accessibilityRole="button" accessibilityLabel="Select category">
          <Ionicons name="pricetag-outline" size={18} color={Colors.navy} />
          <Text style={[styles.selectText, !draft.category && { color: Colors.textMuted }]}>{draft.category ?? "Select category"}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.navy} />
        </Pressable>

        <Text style={styles.label}>
          Tags <Text style={styles.opt}>(Optional)</Text>
        </Text>
        <View style={[styles.box, styles.select]}>
          <TextInput
            value={tag}
            onChangeText={setTag}
            onSubmitEditing={addTag}
            placeholder="Add tags (e.g., funding, marketing, expansion)"
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, { flex: 1 }]}
            returnKeyType="done"
          />
          <Pressable onPress={addTag} hitSlop={8} accessibilityRole="button" accessibilityLabel="Add tag">
            <Ionicons name="add-circle-outline" size={24} color={Colors.goldDark} />
          </Pressable>
        </View>
        {draft.tags.length ? (
          <View style={styles.tags}>
            {draft.tags.map((t) => (
              <View key={t} style={styles.tagChip}>
                <Text style={styles.tagText}>{t}</Text>
                <Pressable onPress={() => setDraft({ tags: draft.tags.filter((x) => x !== t) })} hitSlop={8} accessibilityLabel={`Remove ${t}`}>
                  <Ionicons name="close" size={13} color={Colors.goldDark} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb-outline" size={20} color={Colors.goldDark} />
          </View>
          <Text style={styles.tipText}>Clear and specific questions get better answers from experts.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <WideBtn label="Continue" icon="arrow-forward" trailing disabled={!valid} onPress={() => router.push("/ask-category")} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  label: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginTop: 16, marginBottom: 8 },
  req: { color: Colors.error },
  opt: { color: Colors.textSecondary, fontFamily: Fonts.regular },
  box: { borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, paddingHorizontal: 14 },
  input: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, paddingVertical: 14 },
  bodyBox: { minHeight: 150, paddingBottom: 8 },
  bodyInput: { minHeight: 110, textAlignVertical: "top" },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11, marginTop: 4 },
  select: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 50 },
  selectText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tagChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: "#FDF0D2" },
  tagText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
  tip: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, marginTop: 22, borderRadius: Radius.md, backgroundColor: "#EEF4FD" },
  tipIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FDF0D2", alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  footer: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },

  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "70%", backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 12 },
  sheetTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginBottom: 6 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  optionText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
});
