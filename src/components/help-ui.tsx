import { CARD_SHADOW } from "@/components/member-ui";
import { Label } from "@/components/form-fields";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { Faq } from "@/data/help";
import type { Ticket } from "@/lib/support-store";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function SearchBar({ value, onChangeText, onSubmit, placeholder = "Search FAQs...", autoFocus }: { value: string; onChangeText: (v: string) => void; onSubmit?: () => void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <View style={styles.search}>
      <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.searchInput}
        returnKeyType="search"
        autoFocus={autoFocus}
        accessibilityLabel="Search help"
      />
      {value ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Navy banner with copy on the left and the support agent on the right. */
export function SupportBanner({ title, sub, children, agent }: { title: string; sub: string; children?: ReactNode; agent?: boolean }) {
  return (
    <LinearGradient colors={[Colors.deepNavy, Colors.navy, Colors.royalNavy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <Text style={styles.bannerSub}>{sub}</Text>
        {children}
      </View>
      {agent ? (
        <Image source={require("../../assets/images/support-agent.png")} style={styles.agent} resizeMode="contain" accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.bubble}>
          <Ionicons name="chatbubble-ellipses" size={34} color={Colors.white} />
        </View>
      )}
    </LinearGradient>
  );
}

export function FaqRow({ faq, showCategory = true }: { faq: Faq; showCategory?: boolean }) {
  return (
    <Pressable onPress={() => router.push({ pathname: "/faq-details", params: { id: faq.id } })} accessibilityRole="button" style={({ pressed }) => [styles.faqRow, pressed && { opacity: 0.85 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.faqQ}>{faq.q}</Text>
        {showCategory ? <Text style={styles.faqCat}>{faq.category}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

export function TicketRow({ ticket }: { ticket: Ticket }) {
  const open = ticket.status === "Open";
  return (
    <View style={styles.ticket}>
      <View style={{ flex: 1 }}>
        <Text style={styles.ticketTitle}>{ticket.title}</Text>
        <Text style={styles.ticketSummary} numberOfLines={1}>
          {ticket.summary}
        </Text>
        <Text style={styles.ticketId}>#{ticket.id}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        <View style={[styles.status, { backgroundColor: open ? "#FDF1D8" : "#DFF4EA" }]}>
          <Text style={[styles.statusText, { color: open ? Colors.goldDark : Colors.success }]}>{ticket.status}</Text>
        </View>
        <Text style={styles.ticketId}>{ticket.date}</Text>
      </View>
    </View>
  );
}

const MAX_SHOTS = 3;
const MAX_SHOT_BYTES = 5 * 1024 * 1024;
export const DESCRIPTION_MAX = 500;

/** Multiline description box with the character counter. */
export function DescriptionField({ label = "Description", value, onChange, placeholder }: { label?: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View>
      <Label text={label} required />
      <TextInput
        value={value}
        onChangeText={(v) => onChange(v.slice(0, DESCRIPTION_MAX))}
        multiline
        textAlignVertical="top"
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.textarea}
      />
      <Text style={styles.count}>
        {value.length}/{DESCRIPTION_MAX}
      </Text>
    </View>
  );
}

/** Optional screenshot attachments (up to 3 images, 5 MB each). */
export function ScreenshotPicker({ shots, onChange }: { shots: string[]; onChange: (uris: string[]) => void }) {
  const add = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Please allow photo access to attach a screenshot.");
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_SHOT_BYTES) return Alert.alert("Image too large", "Please choose an image smaller than 5 MB.");
    onChange([...shots, asset.uri]);
  };

  return (
    <View>
      <Label text="Attach Screenshots" optional />
      <View style={styles.shots}>
        {shots.map((uri) => (
          <View key={uri}>
            <Image source={{ uri }} style={styles.shot} />
            <Pressable onPress={() => onChange(shots.filter((u) => u !== uri))} hitSlop={8} style={styles.shotRemove} accessibilityLabel="Remove screenshot">
              <Ionicons name="close" size={12} color={Colors.white} />
            </Pressable>
          </View>
        ))}
        {shots.length < MAX_SHOTS ? (
          <Pressable onPress={add} accessibilityRole="button" style={styles.upload}>
            <Ionicons name="cloud-upload-outline" size={22} color={Colors.goldDark} />
            <Text style={styles.uploadText}>Tap to upload images</Text>
            <Text style={styles.uploadHint}>PNG, JPG up to 5 MB</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function SectionRow({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  searchInput: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15, paddingVertical: 0 },
  banner: { flexDirection: "row", alignItems: "center", borderRadius: Radius.lg, paddingLeft: 18, paddingVertical: 18, overflow: "hidden", minHeight: 130 },
  bannerText: { flex: 1, gap: 6, zIndex: 1 },
  bannerTitle: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 20, lineHeight: 26 },
  bannerSub: { color: "#C9D4E3", fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17 },
  agent: { width: 130, height: 140, marginRight: 4, marginBottom: -18 },
  bubble: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", marginHorizontal: 18 },
  faqRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  faqQ: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 19 },
  faqCat: { color: Colors.goldDark, fontFamily: Fonts.medium, fontSize: 12, marginTop: 4 },
  ticket: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  ticketTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  ticketSummary: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 3 },
  ticketId: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },
  status: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontFamily: Fonts.semiBold, fontSize: 11 },
  textarea: { minHeight: 110, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, padding: 12, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11, marginTop: 4 },
  shots: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shot: { width: 72, height: 72, borderRadius: Radius.md },
  shotRemove: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.error, alignItems: "center", justifyContent: "center" },
  upload: { flex: 1, minWidth: 140, alignItems: "center", gap: 2, paddingVertical: 16, borderRadius: Radius.md, borderWidth: 1.5, borderStyle: "dashed", borderColor: Colors.champagne, backgroundColor: Colors.white },
  uploadText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 13 },
  uploadHint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  sectionAction: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
});
