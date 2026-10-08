import { WideBtn } from "@/components/ask-ui";
import { PersonAvatar } from "@/components/intro-ui";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { QCATEGORIES } from "@/data/questions";
import { postDraft, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Block({ title, optional, onEdit, children }: { title: string; optional?: boolean; onEdit?: () => void; children: ReactNode }) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHead}>
        <Text style={styles.blockTitle}>
          {title} {optional ? <Text style={styles.opt}>(Optional)</Text> : null}
        </Text>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8} style={styles.edit} accessibilityRole="button" accessibilityLabel={`Edit ${title}`}>
            <Ionicons name="create-outline" size={14} color="#2F6FDE" />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function AskReview() {
  const insets = useSafeAreaInsets();
  const { draft: d } = useQuestions();
  const cat = QCATEGORIES.find((c) => c.key === d.category);
  const expert = findMember(d.expert);

  const editing = !!d.editingId;
  const post = () => {
    const id = postDraft();
    if (id) router.replace({ pathname: "/ask-submitted", params: { id, edited: editing ? "1" : "" } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <ScreenHeader title="Review Question" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Block title="Question Title" onEdit={() => router.dismissTo("/ask-question")}>
            <Text style={styles.value}>{d.title}</Text>
          </Block>
          <Block title="Description" onEdit={() => router.dismissTo("/ask-question")}>
            <Text style={styles.value}>{d.body}</Text>
          </Block>
          <Block title="Category" onEdit={() => router.back()}>
            <View style={styles.catPill}>
              <Ionicons name={cat?.icon ?? "ellipsis-horizontal"} size={16} color={Colors.goldDark} />
              <Text style={styles.catText}>{d.category}</Text>
            </View>
          </Block>
          {d.tags.length ? (
            <Block title="Tags">
              <View style={styles.tags}>
                {d.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </Block>
          ) : null}
          <Block title="Selected Expert" optional onEdit={() => router.back()}>
            {expert ? (
              <View style={styles.expert}>
                <PersonAvatar name={expert.name} size={52} />
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{expert.name}</Text>
                    {expert.verified ? <Ionicons name="ribbon" size={13} color={Colors.gold} /> : null}
                  </View>
                  <Text style={styles.role} numberOfLines={1}>
                    {expert.role}, {expert.company}
                  </Text>
                  <View style={styles.pill}>
                    <Text style={styles.tagText}>{expert.expertise[0] ?? expert.industry}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.none}>No specific expert selected. Your question is open to the whole network.</Text>
            )}
          </Block>
        </View>

        <View style={styles.info}>
          <Ionicons name="information-circle-outline" size={26} color="#2F6FDE" />
          <Text style={styles.infoText}>Your question will be visible to the ABLN network and relevant experts. You will be notified when you receive answers.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <WideBtn label="Back" icon="arrow-back" outline onPress={() => router.back()} />
        <WideBtn label={editing ? "Save Changes" : "Post Question"} icon={editing ? "checkmark" : "paper-plane-outline"} onPress={post} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { borderRadius: Radius.lg, borderWidth: 1, borderColor: "#E3E9F2", paddingHorizontal: 14 },
  block: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  blockHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  blockTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
  opt: { color: Colors.textSecondary, fontFamily: Fonts.regular },
  edit: { flexDirection: "row", alignItems: "center", gap: 4 },
  editText: { color: "#2F6FDE", fontFamily: Fonts.semiBold, fontSize: 12 },
  value: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  catPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#F5F7FA" },
  catText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: "#F5F7FA" },
  tagText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },
  expert: { flexDirection: "row", alignItems: "center", gap: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  pill: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: "#FDF0D2" },
  none: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  info: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginTop: 14, borderRadius: Radius.md, backgroundColor: "#EEF4FD" },
  infoText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
});
