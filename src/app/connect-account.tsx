import { OutlineBtn, SOFT_GOLD, SettingsScreen, SolidButton } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { PROVIDERS } from "@/lib/connected-providers";
import { Provider, connectAccount, disconnectAccount } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

/** Confirmation step for connecting or disconnecting a linked sign-in account. */
export default function ConnectAccount() {
  const params = useLocalSearchParams<{ provider?: string; action?: string }>();
  const provider: Provider = params.provider === "google" ? "google" : "linkedin";
  const disconnect = params.action !== "connect";
  const p = PROVIDERS[provider];

  const confirm = () => {
    // TODO: run the provider's OAuth flow / call the unlink API once the auth backend exists.
    if (disconnect) disconnectAccount(provider);
    else connectAccount(provider);
    router.back();
  };

  return (
    <SettingsScreen
      title={`${disconnect ? "Disconnect" : "Connect"} ${p.label}?`}
      footer={
        <>
          <SolidButton label={disconnect ? "Disconnect Account" : "Connect Account"} color={Colors.goldDark} onPress={confirm} />
          <OutlineBtn label={disconnect ? "Keep Connected" : "Cancel"} onPress={() => router.back()} />
        </>
      }
    >
      <View style={styles.center}>
        <View style={styles.halo}>
          <View style={[styles.logo, { backgroundColor: p.bg }]}>
            <Ionicons name={p.icon} size={34} color={p.color} />
          </View>
          <View style={styles.link}>
            <Ionicons name="link" size={22} color={Colors.navy} />
          </View>
        </View>
        <Text style={styles.title}>
          {disconnect ? `Are you sure you want to disconnect your ${p.label} account?` : `Connect your ${p.label} account to ABLN?`}
        </Text>
        <Text style={styles.sub}>
          {disconnect
            ? `You may lose ${p.label} sign-in access. Your ABLN profile and connections will remain unchanged.`
            : `You will be able to sign in to ABLN with ${p.label}. Your ABLN profile and connections will remain unchanged.`}
        </Text>
      </View>

      <View style={styles.warn}>
        <Ionicons name={disconnect ? "warning" : "shield-checkmark"} size={22} color={Colors.goldDark} />
        <Text style={styles.warnText}>
          {disconnect ? "Make sure another sign-in method is available before disconnecting." : "Only connect accounts that belong to you."}
        </Text>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 12, paddingTop: 16 },
  halo: { width: 140, height: 110, borderRadius: 55, backgroundColor: "#EAF1FD", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, marginBottom: 8 },
  logo: { width: 60, height: 60, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  link: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, lineHeight: 30, textAlign: "center" },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, textAlign: "center", paddingHorizontal: 8 },
  warn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: SOFT_GOLD, marginTop: 8 },
  warnText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
});
