import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

export const GOLD_BG = "#FDF0D2";

export function Tag({ children }: { children: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export function ConnectButton({ requested, onPress, style }: { requested: boolean; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  if (requested) {
    return (
      <Pressable onPress={onPress} style={[styles.connectBtn, styles.requestedBtn, style]} accessibilityLabel="Cancel request">
        <Text style={styles.requestedText}>Requested</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && styles.pressed]} accessibilityRole="button">
      <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.connectBtn}>
        <Text style={styles.connectText}>Connect</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function Avatar({ name, photo, size = 56 }: { name: string; photo?: ImageSourcePropType; size?: number }) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (photo) return <Image source={photo} style={box} />;
  const letters = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <View style={[box, styles.initials]}>
      <Text style={[styles.initialsText, { fontSize: size / 3 }]}>{letters}</Text>
    </View>
  );
}

type RowMember = { name: string; role: string; company: string; location: string; tags: string[]; verified?: boolean; photo?: ImageSourcePropType };

export function MemberRow({ member: m, requested, onToggle, card }: { member: RowMember; requested: boolean; onToggle: () => void; card?: boolean }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/member-profile", params: { name: m.name } })}
      style={[styles.row, card ? styles.rowCard : styles.rowFlat]}
      accessibilityRole="button"
      accessibilityLabel={`View ${m.name}'s profile`}
    >
      <Avatar name={m.name} photo={m.photo} />
      <View style={styles.rowInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName} numberOfLines={1}>
            {m.name}
          </Text>
          {m.verified ? <Ionicons name="checkmark-circle" size={16} color="#2F6FDE" /> : null}
        </View>
        <Text style={styles.memberRole} numberOfLines={1}>
          {m.role} • {m.company}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={12} color={Colors.goldDark} />
          <Text style={styles.metaText} numberOfLines={1}>
            {m.location}
          </Text>
        </View>
        <View style={styles.tagRow}>
          {m.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </View>
      </View>
      <ConnectButton requested={requested} onPress={onToggle} />
    </Pressable>
  );
}

export function ScreenHeader({ title, right, hideBack }: { title: string; right?: ReactNode; hideBack?: boolean }) {
  return (
    <View style={styles.header}>
      {hideBack ? null : (
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </Pressable>
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

export const CARD_SHADOW = {
  shadowColor: Colors.navy,
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 },
  tag: { backgroundColor: "#EEF2FA", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  tagText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 9 },

  connectBtn: { height: 36, minWidth: 96, paddingHorizontal: 14, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  connectText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 13 },
  requestedBtn: { borderWidth: 1, borderColor: Colors.gold, backgroundColor: Colors.white },
  requestedText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },

  initials: { backgroundColor: GOLD_BG, alignItems: "center", justifyContent: "center" },
  initialsText: { color: Colors.goldDark, fontFamily: Fonts.bold },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowCard: { padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  rowFlat: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  rowInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  memberName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, flexShrink: 1 },
  memberRole: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  metaText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 10 },

  header: { flexDirection: "row", alignItems: "center", gap: 8, height: 44 },
  back: { width: 32, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
});
