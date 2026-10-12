import { Label } from "@/components/form-fields";
import { Avatar } from "@/components/member-ui";
import { Card, GoldButton, RadioDot, SegmentTabs, SettingsScreen, SolidButton } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember, MEMBERS } from "@/data/members";
import { useConnections } from "@/lib/connection-store";
import { blockMember, useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Tab = "report" | "block";
const TABS: { key: Tab; label: string }[] = [
  { key: "report", label: "Report Member" },
  { key: "block", label: "Block Member" },
];

const REASONS = ["Inappropriate behavior", "Spam or unwanted messages", "Fake profile", "Harassment", "Misleading information", "Other"];
const DETAILS_MAX = 500;
const MAX_SHOTS = 3;
const MAX_SHOT_BYTES = 5 * 1024 * 1024;

export default function ReportBlock() {
  const params = useLocalSearchParams<{ name?: string; tab?: Tab }>();
  const { connections } = useConnections();
  const { blocked } = useSettings();
  const [tab, setTab] = useState<Tab>(params.tab === "block" ? "block" : "report");
  const [selected, setSelected] = useState<string | undefined>(params.name);
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState<string>();
  const [details, setDetails] = useState("");
  const [shots, setShots] = useState<string[]>([]);

  const member = findMember(selected);
  const isBlocked = !!selected && blocked.some((b) => b.name === selected);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const recent = connections.map((c) => findMember(c.name)).filter((m): m is NonNullable<typeof m> => !!m);
    if (!q) return recent;
    return MEMBERS.filter((m) => m.name.toLowerCase().includes(q) || m.company.toLowerCase().includes(q)).slice(0, 8);
  }, [query, connections]);

  const addShot = async () => {
    if (shots.length >= MAX_SHOTS) return Alert.alert("Limit reached", `You can attach up to ${MAX_SHOTS} screenshots.`);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Please allow photo access to attach a screenshot.");
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_SHOT_BYTES) return Alert.alert("Image too large", "Please choose an image smaller than 5 MB.");
    setShots((s) => [...s, asset.uri]);
  };

  const submitReport = () => {
    if (!member) return Alert.alert("Select a member", "Choose the member you want to report.");
    if (!reason) return Alert.alert("Select a reason", "Please tell us why you are reporting this member.");
    Alert.alert("Report submitted", `Thank you. Our team will review your report about ${member.name} and take action if needed.`, [{ text: "OK", onPress: () => router.back() }]);
  };

  const confirmBlock = () => {
    if (!member) return Alert.alert("Select a member", "Choose the member you want to block.");
    Alert.alert(`Block ${member.name}?`, "They will no longer be able to view your profile, send you connection requests or message you.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: () => {
          blockMember(member.name);
          Alert.alert("Member blocked", `${member.name} has been blocked. You can unblock them any time from Settings.`, [{ text: "OK", onPress: () => router.back() }]);
        },
      },
    ]);
  };

  return (
    <SettingsScreen
      title="Report / Block Member"
      footer={
        tab === "report" ? (
          <GoldButton label="Submit Report" onPress={submitReport} />
        ) : (
          <SolidButton label={isBlocked ? "Already Blocked" : "Block Member"} onPress={confirmBlock} disabled={isBlocked} />
        )
      }
    >
      <SegmentTabs tabs={TABS} value={tab} onChange={setTab} />

      {member ? (
        <Card style={styles.selected}>
          <Avatar name={member.name} photo={member.photo} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.role} numberOfLines={1}>
              {member.role} at {member.company}
            </Text>
          </View>
          <Pressable onPress={() => setSelected(undefined)} hitSlop={10} accessibilityLabel="Choose a different member">
            <Ionicons name="close-circle" size={22} color={Colors.textMuted} />
          </Pressable>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Search member by name or company" placeholderTextColor={Colors.textMuted} style={styles.searchInput} />
          </View>
          <Text style={styles.heading}>{query.trim() ? "Search Results" : "Recent Connections"}</Text>
          {results.length ? (
            results.map((m) => (
              <Pressable key={m.name} onPress={() => setSelected(m.name)} accessibilityRole="button" style={styles.memberRow}>
                <Avatar name={m.name} photo={m.photo} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{m.name}</Text>
                  <Text style={styles.role} numberOfLines={1}>
                    {m.role} at {m.company}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </Pressable>
            ))
          ) : (
            <Text style={styles.empty}>No members found.</Text>
          )}
        </View>
      )}

      {member && tab === "report" ? (
        <View style={{ gap: 10 }}>
          <Text style={styles.heading}>
            Reason for reporting <Text style={{ color: Colors.error }}>*</Text>
          </Text>
          {REASONS.map((r) => (
            <Pressable key={r} onPress={() => setReason(r)} accessibilityRole="radio" accessibilityState={{ selected: reason === r }} style={styles.reason}>
              <RadioDot on={reason === r} />
              <Text style={styles.reasonText}>{r}</Text>
            </Pressable>
          ))}

          <View>
            <Label text="Details" optional />
            <TextInput
              value={details}
              onChangeText={(v) => setDetails(v.slice(0, DETAILS_MAX))}
              multiline
              textAlignVertical="top"
              placeholder="Please provide more details..."
              placeholderTextColor={Colors.textMuted}
              style={styles.textarea}
            />
            <Text style={styles.count}>
              {details.length}/{DETAILS_MAX}
            </Text>
          </View>

          <View>
            <Label text="Attach Screenshots" optional />
            <View style={styles.shots}>
              {shots.map((uri) => (
                <View key={uri}>
                  <Image source={{ uri }} style={styles.shot} />
                  <Pressable onPress={() => setShots((s) => s.filter((u) => u !== uri))} hitSlop={8} style={styles.shotRemove} accessibilityLabel="Remove screenshot">
                    <Ionicons name="close" size={12} color={Colors.white} />
                  </Pressable>
                </View>
              ))}
              {shots.length < MAX_SHOTS ? (
                <Pressable onPress={addShot} accessibilityRole="button" style={styles.upload}>
                  <Ionicons name="cloud-upload-outline" size={22} color={Colors.goldDark} />
                  <Text style={styles.uploadText}>Tap to upload</Text>
                  <Text style={styles.uploadHint}>PNG, JPG up to 5 MB</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {member && tab === "block" ? (
        <Card style={{ gap: 8 }}>
          <Text style={styles.heading}>What happens when you block {member.name.split(" ")[0]}?</Text>
          {["They cannot view your profile or digital card.", "They cannot send you connection requests or introductions.", "You will be removed from each other's connections.", "You can unblock them any time from Settings."].map((t) => (
            <View key={t} style={styles.bullet}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.goldDark} />
              <Text style={styles.bulletText}>{t}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  selected: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  searchInput: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15, paddingVertical: 0 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  empty: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", marginTop: 8 },
  reason: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  reasonText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  textarea: { minHeight: 90, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, padding: 12, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11, marginTop: 4 },
  shots: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shot: { width: 72, height: 72, borderRadius: Radius.md },
  shotRemove: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.error, alignItems: "center", justifyContent: "center" },
  upload: { flex: 1, minWidth: 140, alignItems: "center", gap: 2, paddingVertical: 16, borderRadius: Radius.md, borderWidth: 1.5, borderStyle: "dashed", borderColor: Colors.champagne, backgroundColor: Colors.white },
  uploadText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  uploadHint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  bullet: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bulletText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
});
