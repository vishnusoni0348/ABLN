import { CARD_SHADOW } from "@/components/member-ui";
import { GoldButton } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ITEMS: Record<string, { icon: IconName; title: string; text: string }> = {
  mobile: { icon: "call", title: "Mobile Number", text: "Your mobile number has been updated successfully." },
  email: { icon: "mail", title: "Email Address", text: "Your email address has been updated successfully." },
  password: { icon: "lock-closed", title: "Password", text: "Your password has been changed successfully." },
  "password-set": { icon: "lock-closed", title: "Password", text: "Your password has been set. You can now log in with it." },
  "password-reset": { icon: "lock-closed", title: "Password", text: "Your password has been reset. Log in with your new password." },
};

export default function SecuritySuccess() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const item = ITEMS[type] ?? ITEMS.password;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar style="dark" />
      <View style={styles.halo}>
        <View style={styles.badge}>
          <Ionicons name="checkmark" size={64} color={Colors.white} />
        </View>
      </View>
      <Text style={styles.title}>Security Details Updated</Text>
      <Text style={styles.sub}>Your requested changes have been completed successfully.</Text>

      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name={item.icon} size={22} color={Colors.goldDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemText}>{item.text}</Text>
        </View>
        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
      </View>

      <View style={{ flex: 1 }} />
      <GoldButton label="Done" onPress={() => (type === "password-reset" ? router.replace("/login") : router.dismissTo("/account-settings"))} style={{ alignSelf: "stretch" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 20, alignItems: "center" },
  halo: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#E6F6EF", alignItems: "center", justifyContent: "center" },
  badge: { width: 104, height: 104, borderRadius: 52, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24, marginTop: 28, textAlign: "center" },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: "center" },
  card: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, marginTop: 28, ...CARD_SHADOW },
  iconBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#FEF6E6", alignItems: "center", justifyContent: "center" },
  itemTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  itemText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
});
