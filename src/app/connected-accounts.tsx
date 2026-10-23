import { Card, InfoBanner, OutlineBtn, SOFT_GOLD, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PROVIDERS } from "@/lib/connected-providers";
import { useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ConnectedAccounts() {
  const { connected } = useSettings();

  return (
    <SettingsScreen title="Connected Accounts">
      <View style={styles.hero}>
        <View style={styles.shield}>
          <Ionicons name="link" size={26} color={Colors.goldDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Connect trusted accounts for easier sign-in.</Text>
          <Text style={styles.heroSub}>Secure, quick and hassle-free access to your ABLN account.</Text>
        </View>
      </View>

      {(Object.keys(PROVIDERS) as (keyof typeof PROVIDERS)[]).map((key) => {
        const p = PROVIDERS[key];
        const email = connected[key];
        const on = email !== null;
        return (
          <Card key={key} style={styles.card}>
            <View style={[styles.logo, { backgroundColor: p.bg }]}>
              <Ionicons name={p.icon} size={26} color={p.color} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <Text style={styles.name}>{p.label}</Text>
              {on ? <Text style={styles.email} numberOfLines={1}>Connected as {email}</Text> : null}
              <View style={[styles.status, on && styles.statusOn]}>
                <View style={[styles.dot, on && { backgroundColor: Colors.success }]} />
                <Text style={[styles.statusText, on && { color: Colors.success }]}>{on ? "Connected" : "Not connected"}</Text>
              </View>
            </View>
            <OutlineBtn
              label={on ? "Disconnect" : "Connect"}
              color={Colors.goldDark}
              style={styles.action}
              onPress={() => router.push({ pathname: "/connect-account", params: { provider: key, action: on ? "disconnect" : "connect" } })}
            />
          </Card>
        );
      })}

      <InfoBanner>You can disconnect an account at any time. Keep at least one sign-in method active.</InfoBanner>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: Radius.lg, backgroundColor: "#EAF1FD" },
  shield: { width: 52, height: 52, borderRadius: 26, backgroundColor: SOFT_GOLD, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21 },
  heroSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 3 },
  card: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 48, height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  email: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  status: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: 10, paddingVertical: 2 },
  statusOn: { backgroundColor: "#E6F6EF", paddingHorizontal: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  statusText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12 },
  action: { height: 40, minWidth: 100 },
});
