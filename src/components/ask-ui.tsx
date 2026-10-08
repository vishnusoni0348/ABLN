import { PersonAvatar } from "@/components/intro-ui";
import { CARD_SHADOW, GOLD_BG } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PAGE, type Question, timeAgo } from "@/data/questions";
import { deleteQuestion, startEdit, toggleHelpfulQ, toggleSavedQ, useQuestions } from "@/lib/question-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactNode, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";

export function GoldFill({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}

export function WideBtn({ label, onPress, icon, trailing, disabled, outline, style }: { label: string; onPress: () => void; icon?: React.ComponentProps<typeof Ionicons>["name"]; trailing?: boolean; disabled?: boolean; outline?: boolean; style?: object }) {
  const content = (
    <>
      {icon && !trailing ? <Ionicons name={icon} size={18} color={outline ? Colors.navy : Colors.white} /> : null}
      <Text style={[styles.wideText, outline && { color: Colors.navy }]}>{label}</Text>
      {icon && trailing ? <Ionicons name={icon} size={18} color={outline ? Colors.navy : Colors.white} /> : null}
    </>
  );
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.wideWrap, disabled && { opacity: 0.5 }, style]} accessibilityRole="button" accessibilityState={{ disabled }}>
      {outline ? <View style={[styles.wide, styles.wideOutline]}>{content}</View> : <GoldFill style={styles.wide}>{content}</GoldFill>}
    </Pressable>
  );
}

export function SearchField({ value, onChange, onSubmit, onFilter, filterCount = 0 }: { value: string; onChange: (v: string) => void; onSubmit?: () => void; onFilter: () => void; filterCount?: number }) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={Colors.navy} />
        <TextInput
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          placeholder="Search questions, topics or keywords..."
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {value ? (
          <Pressable onPress={() => onChange("")} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <Pressable style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.85 }]} onPress={onFilter} accessibilityRole="button" accessibilityLabel="Open filters">
        <Ionicons name="options-outline" size={22} color={Colors.goldDark} />
        {filterCount > 0 ? <View style={styles.dot} /> : null}
      </Pressable>
    </View>
  );
}

export function QuestionCard({ q }: { q: Question }) {
  const { saved, helpful, posted } = useQuestions();
  const mine = posted.some((p) => p.id === q.id);
  const isSaved = saved.includes(q.id);
  const isHelpful = helpful.includes(q.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const confirmDelete = () =>
    Alert.alert("Delete question?", "This will permanently remove your question and any answers on it.", [
      { text: "Keep", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteQuestion(q.id) },
    ]);
  const actions: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void; danger?: boolean }[] = [
    { icon: "paper-plane-outline", label: "Share", onPress: () => Share.share({ message: `${q.title} - asked on ABLN Ask Network` }).catch(() => {}) },
    ...(mine
      ? [
          {
            icon: "create-outline" as const,
            label: "Edit Question",
            onPress: () => {
              startEdit(q);
              router.push("/ask-question");
            },
          },
          { icon: "trash-outline" as const, label: "Delete Question", onPress: confirmDelete, danger: true },
        ]
      : [{ icon: "flag-outline" as const, label: "Report", onPress: () => Alert.alert("Thanks", "Your report has been submitted.") }]),
  ];
  const menu = () => setMenuOpen(true);

  return (
    <View style={styles.card}>
      <Modal visible={menuOpen} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {actions.map((a) => (
            <Pressable
              key={a.label}
              style={styles.sheetRow}
              onPress={() => {
                close();
                a.onPress();
              }}
              accessibilityRole="button"
            >
              <Ionicons name={a.icon} size={20} color={a.danger ? Colors.error : Colors.navy} />
              <Text style={[styles.sheetText, a.danger && { color: Colors.error }]}>{a.label}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.sheetCancel} onPress={close} accessibilityRole="button">
            <Text style={styles.sheetText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
      <View style={styles.head}>
        <PersonAvatar name={q.author} size={40} />
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {q.author}
            </Text>
            {q.expert ? (
              <View style={styles.expert}>
                <Ionicons name="ribbon" size={10} color={Colors.goldDark} />
                <Text style={styles.expertText}>Expert</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.time}>{timeAgo(q.hoursAgo)}</Text>
        </View>
        <Pressable onPress={menu} hitSlop={10} accessibilityRole="button" accessibilityLabel="More options">
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>
      <Text style={styles.title}>{q.title}</Text>
      <View style={styles.tags}>
        {q.tags.map((t) => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={styles.foot}>
        <View style={styles.stat}>
          <Ionicons name="chatbubble-ellipses-outline" size={17} color="#2F6FDE" />
          <Text style={styles.statText}>{q.answers} Answers</Text>
        </View>
        <Pressable style={styles.stat} onPress={() => toggleHelpfulQ(q.id)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: isHelpful }}>
          <Ionicons name={isHelpful ? "thumbs-up" : "thumbs-up-outline"} size={17} color={Colors.goldDark} />
          <Text style={styles.statText}>{q.helpful + (isHelpful ? 1 : 0)} Helpful</Text>
        </Pressable>
        <View style={styles.flex} />
        <Pressable onPress={() => toggleSavedQ(q.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={isSaved ? "Remove bookmark" : "Bookmark"}>
          <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={19} color={isSaved ? Colors.goldDark : Colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

// Infinite scroll: reveals PAGE more items after a short delay. Resets to page one whenever `sig` changes.
export function useInfinite(sig: string, total: number) {
  const [s, setS] = useState({ sig, shown: PAGE });
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shown = s.sig === sig ? s.shown : PAGE;
  const hasMore = shown < total;

  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setS({ sig, shown: shown + PAGE });
      setLoading(false);
    }, 900);
  };
  return { shown, hasMore, loading, loadMore };
}

export function LoadingFooter({ loading, hasMore }: { loading: boolean; hasMore: boolean }) {
  if (!hasMore) return <Text style={styles.end}>You are all caught up</Text>;
  return (
    <View style={styles.footer}>
      {loading ? (
        <>
          <SkeletonCard />
          <ActivityIndicator size="small" color={Colors.goldDark} style={{ marginTop: 14 }} />
          <Text style={styles.loadingText}>Loading more questions...</Text>
        </>
      ) : null}
    </View>
  );
}

function SkeletonCard() {
  return (
    <View style={[styles.card, { gap: 10 }]}>
      <View style={styles.head}>
        <View style={[styles.skel, { width: 40, height: 40, borderRadius: 20 }]} />
        <View style={{ gap: 6 }}>
          <View style={[styles.skel, { width: 110 }]} />
          <View style={[styles.skel, { width: 70 }]} />
        </View>
      </View>
      <View style={[styles.skel, { width: "100%" }]} />
      <View style={[styles.skel, { width: "70%" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 8 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  sheetText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  sheetCancel: { height: 46, marginTop: 12, borderRadius: Radius.md, backgroundColor: Colors.softWhite, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  wideWrap: { flex: 1 },
  wide: { height: 48, borderRadius: Radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  wideOutline: { borderWidth: 1.5, borderColor: Colors.navy, backgroundColor: Colors.white },
  wideText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 14 },
  flex: { flex: 1, minWidth: 0 },
  searchRow: { flexDirection: "row", gap: 10 },
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  searchInput: { flex: 1, padding: 0, fontFamily: Fonts.regular, fontSize: 12, color: Colors.navy },
  filterBtn: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.goldDark },

  card: { padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, flexShrink: 1 },
  expert: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: GOLD_BG },
  expertText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 10 },
  time: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  title: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20, marginTop: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: { backgroundColor: GOLD_BG, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  tagText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 10 },
  foot: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 12 },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12 },

  footer: { alignItems: "center", paddingTop: 4, paddingBottom: 16 },
  loadingText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 6 },
  end: { textAlign: "center", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 12, paddingVertical: 16 },
  skel: { height: 10, borderRadius: 5, backgroundColor: "#E7EAF0" },
});
