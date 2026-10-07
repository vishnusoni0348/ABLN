import { BackHeader, GoldButton, NetworkTabBar, PersonAvatar } from "@/components/intro-ui";
import { Tag } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember, MEMBERS } from "@/data/members";
import { addIntroRequest, useLiveIntroTo } from "@/lib/introduction-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_NOTE = 300;
type Mode = "member" | "external";

export default function RequestIntroduction() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name?: string; target?: string; reason?: string; message?: string }>();
  const { name } = params;
  const introducer = findMember(name) ?? findMember("Sneha Bansal")!;

  const [mode, setMode] = useState<Mode>("member");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<string | null>(params.target ?? "Amit Goyal");
  const [externalName, setExternalName] = useState("");
  const [reason, setReason] = useState(params.reason ?? "");
  const [note, setNote] = useState(params.message ?? "");

  const q = query.trim().toLowerCase();
  const results = q ? MEMBERS.filter((m) => m.name !== introducer.name && m.name.toLowerCase().includes(q)).slice(0, 4) : [];
  const targetMember = mode === "member" ? findMember(target ?? undefined) : undefined;
  const targetName = mode === "member" ? target : externalName.trim();
  const existing = useLiveIntroTo(targetName || null);
  const canSend = !!targetName && reason.trim().length > 0 && !existing;

  const send = () => {
    if (!canSend || !targetName) return;
    const id = addIntroRequest({ introducer: introducer.name, target: targetName, reason: reason.trim(), message: note.trim(), external: mode === "external" });
    if (id) router.replace({ pathname: "/introduction-sent", params: { id } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <BackHeader title="Request Introduction" />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.person}>
            <PersonAvatar name={introducer.name} size={64} />
            <View style={styles.flex}>
              <Text style={styles.name}>{introducer.name}</Text>
              <Text style={styles.sub}>
                {introducer.role} • {introducer.company}
              </Text>
              <View style={styles.meta}>
                <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
                <Text style={styles.metaText}>{introducer.location}</Text>
              </View>
              <View style={styles.tags}>
                {introducer.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Who would you like to connect with?</Text>
          <View style={styles.segment}>
            {(["member", "external"] as Mode[]).map((m) => (
              <Pressable key={m} onPress={() => setMode(m)} style={[styles.segBtn, mode === m && styles.segOn]} accessibilityRole="button" accessibilityState={{ selected: mode === m }}>
                <Text style={[styles.segText, mode === m && styles.segTextOn]}>{m === "member" ? "ABLN Member" : "External Contact"}</Text>
              </Pressable>
            ))}
          </View>

          {mode === "member" ? (
            <>
              <View style={styles.input}>
                <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
                <TextInput value={query} onChangeText={setQuery} placeholder="Search member..." placeholderTextColor={Colors.textMuted} style={styles.inputText} />
              </View>
              {results.map((m) => (
                <Pressable
                  key={m.name}
                  onPress={() => {
                    setTarget(m.name);
                    setQuery("");
                  }}
                  style={styles.result}
                >
                  <PersonAvatar name={m.name} size={32} />
                  <Text style={styles.resultText}>
                    {m.name} • {m.company}
                  </Text>
                </Pressable>
              ))}
              {targetMember ? (
                <View style={styles.target}>
                  <PersonAvatar name={targetMember.name} size={60} />
                  <View style={styles.flex}>
                    <Text style={styles.name}>{targetMember.name}</Text>
                    <Text style={styles.sub}>
                      {targetMember.role} • {targetMember.company}
                    </Text>
                    <View style={styles.meta}>
                      <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
                      <Text style={styles.metaText}>{targetMember.location}</Text>
                    </View>
                    <View style={styles.tags}>
                      {targetMember.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </View>
                  </View>
                  <Pressable onPress={() => setTarget(null)} hitSlop={10} accessibilityLabel="Remove selection">
                    <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.input}>
              <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
              <TextInput value={externalName} onChangeText={setExternalName} placeholder="Contact's full name" placeholderTextColor={Colors.textMuted} style={styles.inputText} />
            </View>
          )}

          {existing ? (
            <Pressable onPress={() => router.push({ pathname: "/introduction-details", params: { id: existing.id } })} style={styles.dup} accessibilityRole="button">
              <Ionicons name="information-circle" size={18} color={Colors.goldDark} />
              <Text style={styles.dupText}>
                You already have a request for {existing.target} via {existing.introducer}. <Text style={styles.dupLink}>View status</Text>
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.label}>
            Reason for Introduction <Text style={{ color: Colors.error }}>*</Text>
          </Text>
          <View style={styles.input}>
            <TextInput value={reason} onChangeText={setReason} placeholder="E.g. Explore partnership, seek advice..." placeholderTextColor={Colors.textMuted} style={styles.inputText} />
          </View>

          <Text style={styles.label}>Additional Message (Optional)</Text>
          <View style={[styles.input, styles.area]}>
            <TextInput
              value={note}
              onChangeText={(t) => setNote(t.slice(0, MAX_NOTE))}
              placeholder="Add a personal message..."
              placeholderTextColor={Colors.textMuted}
              multiline
              style={[styles.inputText, styles.areaText]}
            />
            <Text style={styles.count}>
              {note.length}/{MAX_NOTE}
            </Text>
          </View>

          <GoldButton label="Send Introduction Request" onPress={send} disabled={!canSend} style={{ marginTop: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <NetworkTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1, minWidth: 0 },
  pad: { paddingHorizontal: 16 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  person: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  metaText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  label: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14, marginTop: 18, marginBottom: 10 },
  segment: { flexDirection: "row", gap: 10 },
  segBtn: { flex: 1, height: 40, borderRadius: Radius.sm, backgroundColor: "#F1F4F8", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  segOn: { backgroundColor: "#FDF0D2", borderColor: Colors.gold },
  segText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 13 },
  segTextOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  input: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 46, marginTop: 12, paddingHorizontal: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  inputText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13, paddingVertical: 10 },
  area: { alignItems: "stretch", flexDirection: "column", minHeight: 92, marginTop: 0 },
  areaText: { minHeight: 56, textAlignVertical: "top" },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11, paddingBottom: 8 },
  result: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 4 },
  resultText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
  dup: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 12, padding: 12, borderRadius: Radius.md, backgroundColor: "#FDF3DA" },
  dupText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  dupLink: { color: Colors.goldDark, fontFamily: Fonts.bold },
  target: { flexDirection: "row", gap: 12, marginTop: 12, padding: 12, borderRadius: Radius.lg, borderWidth: 1, borderColor: "#EEF1F5", backgroundColor: Colors.white },
});
