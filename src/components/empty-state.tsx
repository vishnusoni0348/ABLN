import { CARD_SHADOW } from "@/components/member-ui";
import { GOLD_GRADIENT } from "@/components/opportunity-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IconName;
  title: string;
  text: string;
  steps?: { icon: IconName; text: string }[];
  cta?: { label: string; onPress: () => void };
  // Sit inline inside a longer list instead of filling and centring the screen.
  inline?: boolean;
};

/** Shared "nothing here yet" block: icon halo, title, text, optional how-it-works steps and a gold button. */
export function EmptyState({ icon, title, text, steps, cta, inline }: Props) {
  return (
    <View style={[styles.empty, inline ? styles.inline : styles.fill]}>
      <View style={styles.halo}>
        <View style={styles.haloInner}>
          <Ionicons name={icon} size={40} color={Colors.goldDark} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {steps?.length ? (
        <View style={styles.steps}>
          {steps.map((s) => (
            <View key={s.text} style={styles.step}>
              <Ionicons name={s.icon} size={20} color={Colors.goldDark} />
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {cta ? (
        <Pressable onPress={cta.onPress} style={({ pressed }) => [styles.ctaWrap, pressed && { opacity: 0.85 }]} accessibilityRole="button">
          <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>{cta.label}</Text>
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", gap: 12 },
  fill: { flex: 1, justifyContent: "center", paddingHorizontal: 20, paddingBottom: 40 },
  inline: { paddingVertical: 36 },
  halo: { width: 132, height: 132, borderRadius: 66, backgroundColor: "#FEF6E3", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  haloInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20, textAlign: "center" },
  text: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, textAlign: "center", paddingHorizontal: 16 },
  steps: { alignSelf: "stretch", gap: 12, padding: 14, marginTop: 6, borderRadius: Radius.lg, backgroundColor: "#FEF6E6" },
  step: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  ctaWrap: { alignSelf: "stretch", marginTop: 8 },
  cta: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
});
