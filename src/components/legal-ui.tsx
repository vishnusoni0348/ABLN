import { CARD_SHADOW } from "@/components/member-ui";
import { SOFT_GOLD } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import type { LegalSection } from "@/data/legal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentProps, ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const NAVY_GRADIENT = [Colors.deepNavy, Colors.navy, Colors.royalNavy] as const;

/** Navy hero: title and intro on the left, a gold badge icon on the right. */
export function LegalHero({ title, sub, icon }: { title: string; sub: string; icon: IconName }) {
  return (
    <LinearGradient colors={NAVY_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSub}>{sub}</Text>
      </View>
      <View style={styles.badge}>
        <Ionicons name={icon} size={40} color={Colors.gold} />
      </View>
    </LinearGradient>
  );
}

export function UpdatedCard({ date }: { date: string }) {
  return (
    <View style={styles.updated}>
      <View style={styles.iconBox}>
        <Ionicons name="calendar-outline" size={22} color={Colors.goldDark} />
      </View>
      <View>
        <Text style={styles.updatedLabel}>Last updated</Text>
        <Text style={styles.updatedDate}>{date}</Text>
      </View>
    </View>
  );
}

/** Numbered list of collapsible sections; one open at a time. */
export function Accordion({ sections }: { sections: LegalSection[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View>
      {sections.map((s, i) => {
        const isOpen = open === i;
        return (
          <View key={s.title} style={styles.item}>
            <Pressable onPress={() => setOpen(isOpen ? null : i)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={styles.itemHead}>
              <View style={styles.num}>
                <Text style={styles.numText}>{i + 1}</Text>
              </View>
              <Text style={styles.itemTitle}>{s.title}</Text>
              <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={Colors.textSecondary} />
            </Pressable>
            {isOpen ? <Text style={styles.itemBody}>{s.body}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

export function InfoCard({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={24} color={Colors.goldDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

export function CardText({ children }: { children: string }) {
  return <Text style={styles.cardText}>{children}</Text>;
}

export function DetailRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={20} color={Colors.navy} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function LinkRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={({ pressed }) => [styles.detail, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={20} color={Colors.navy} />
      <Text style={[styles.detailLabel, { flex: 1 }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </Pressable>
  );
}

export function AboutBanner() {
  return (
    <LinearGradient colors={NAVY_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aboutBanner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.aboutLogo}>ABLN</Text>
        <Text style={styles.aboutName}>{"Agarwal Business\nLeaders Network"}</Text>
      </View>
      <Ionicons name="people" size={72} color={Colors.gold} />
    </LinearGradient>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} style={styles.check}>
      <View style={[styles.box, checked && styles.boxOn]}>{checked ? <Ionicons name="checkmark" size={16} color={Colors.white} /> : null}</View>
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 20, borderRadius: Radius.xl },
  heroTitle: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 26, lineHeight: 32 },
  heroSub: { color: "#C9D4E2", fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 6 },
  badge: { width: 76, height: 76, borderRadius: 38, backgroundColor: "rgba(212,167,44,0.15)", alignItems: "center", justifyContent: "center" },
  updated: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: Radius.md, backgroundColor: "#EEF3FA" },
  iconBox: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: SOFT_GOLD, alignItems: "center", justifyContent: "center" },
  updatedLabel: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  updatedDate: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
  item: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemHead: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  num: { width: 30, height: 30, borderRadius: 15, backgroundColor: SOFT_GOLD, alignItems: "center", justifyContent: "center" },
  numText: { color: Colors.goldDark, fontFamily: Fonts.bold, fontSize: 13 },
  itemTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 15 },
  itemBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, paddingBottom: 14, paddingLeft: 44 },
  card: { flexDirection: "row", gap: 14, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  cardTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  cardText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 4 },
  detail: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  detailLabel: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 14 },
  detailValue: { flex: 1, textAlign: "right", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 },
  aboutBanner: { flexDirection: "row", alignItems: "center", padding: 22, borderRadius: Radius.xl },
  aboutLogo: { color: Colors.gold, fontFamily: Fonts.bold, fontSize: 40, letterSpacing: 1 },
  aboutName: { color: Colors.white, fontFamily: Fonts.semiBold, fontSize: 15, lineHeight: 21, marginTop: 2 },
  check: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: "#EEF3FA" },
  box: { width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.textMuted, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: Colors.goldDark, borderColor: Colors.goldDark },
  checkText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
});
