import { CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Action = { label: string; onPress: () => void; icon?: IconName };

type Props = {
  icon: IconName;
  iconColor?: string;
  /** Big text shown in place of the icon (e.g. "404"). */
  badge?: string;
  title: string;
  text: string;
  /** Gold filled button. */
  primary?: Action;
  /** Gold outlined button (used by the offline screen). */
  outlined?: Action;
  /** Plain text link under the buttons. */
  link?: Action;
  note?: string;
  children?: ReactNode;
};

/** Full-screen status page: ABLN navy header, illustration, message and actions. */
export function StatusView({ icon, iconColor = Colors.goldDark, badge, title, text, primary, outlined, link, note, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View style={[styles.top, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.brand}>ABLN</Text>
        <Text style={styles.brandSub}>Agarwal Business Leaders Network</Text>
      </View>
      <View style={styles.wave} />

      <View style={styles.body}>
        <View style={styles.halo}>
          <View style={styles.haloInner}>
            {badge ? <Text style={styles.badge}>{badge}</Text> : <Ionicons name={icon} size={64} color={iconColor} />}
          </View>
        </View>

        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        <Text style={styles.text}>{text}</Text>
        {children}

        <View style={styles.actions}>
          {primary ? (
            <Pressable onPress={primary.onPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.85 }}>
              <LinearGradient colors={[Colors.goldDark, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                {primary.icon ? <Ionicons name={primary.icon} size={20} color={Colors.white} /> : null}
                <Text style={styles.btnText}>{primary.label}</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
          {outlined ? (
            <Pressable onPress={outlined.onPress} accessibilityRole="button" style={({ pressed }) => [styles.btn, styles.outlined, pressed && { opacity: 0.85 }]}>
              {outlined.icon ? <Ionicons name={outlined.icon} size={20} color={Colors.goldDark} /> : null}
              <Text style={[styles.btnText, { color: Colors.goldDark }]}>{outlined.label}</Text>
            </Pressable>
          ) : null}
          {link ? (
            <Pressable onPress={link.onPress} accessibilityRole="link" hitSlop={8} style={styles.link}>
              <Text style={styles.linkText}>{link.label}</Text>
            </Pressable>
          ) : null}
          {note ? (
            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.navy} />
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  top: { backgroundColor: Colors.navy, alignItems: "center", paddingBottom: 28 },
  brand: { color: Colors.gold, fontFamily: Fonts.bold, fontSize: 30, letterSpacing: 1 },
  brandSub: { color: Colors.white, fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  wave: { height: 5, backgroundColor: Colors.gold },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingBottom: 24, gap: 10 },
  halo: { width: 172, height: 172, borderRadius: 86, backgroundColor: "#EEF2FA", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  haloInner: { width: 124, height: 124, borderRadius: 62, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...CARD_SHADOW },
  badge: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 40 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 26, textAlign: "center" },
  text: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, textAlign: "center" },
  actions: { alignSelf: "stretch", gap: 14, marginTop: 18 },
  btn: { height: 54, borderRadius: Radius.sm, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  btnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 16 },
  outlined: { borderWidth: 1.5, borderColor: Colors.gold, backgroundColor: Colors.white },
  link: { alignSelf: "center", paddingVertical: 4 },
  linkText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  note: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.sm, backgroundColor: "#EEF4FD" },
  noteText: { flex: 1, color: Colors.navy, fontFamily: Fonts.medium, fontSize: 13 },
});
