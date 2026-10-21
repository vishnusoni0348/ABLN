import { BottomSheet, MenuRow, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { LANGUAGES, setLanguage, useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

type Sheet = "language" | null;

export default function AccountSettings() {
  const { profile, language, password } = useSettings();
  const [sheet, setSheet] = useState<Sheet>(null);
  const open = (s: Exclude<Sheet, null>) => setSheet(s);
  const close = () => setSheet(null);

  return (
    <SettingsScreen title="Account Settings">
      <MenuRow icon="mail-outline" title="Email Address" sub={profile.email} onPress={() => router.push("/security-email")} />
      <MenuRow icon="call-outline" title="Mobile Number" sub={`${profile.dialCode} ${profile.mobile}`} onPress={() => router.push("/security-mobile")} />
      <MenuRow icon="lock-closed-outline" title={password === null ? "Set Password" : "Change Password"} sub={password === null ? "Log in with a password as well as OTP" : "Update your password"} onPress={() => router.push("/security-password")} />
      <MenuRow icon="notifications-outline" title="Notifications" sub="Manage your preferences" onPress={() => router.push("/notification-preferences")} />
      <MenuRow icon="language-outline" title="Language" sub={language} onPress={() => open("language")} />
      <MenuRow icon="link-outline" title="Connected Accounts" sub="Manage linked accounts" onPress={() => Alert.alert("Connected Accounts", "This will be available soon.")} />
      <MenuRow icon="person-remove-outline" title="Deactivate Account" sub="Hide your profile from ABLN" danger onPress={() => router.push("/deactivate-account")} />

      <BottomSheet visible={sheet === "language"} title="Language" onClose={close}>
        {LANGUAGES.map((l) => (
          <Pressable
            key={l}
            style={styles.option}
            onPress={() => {
              setLanguage(l);
              close();
            }}
          >
            <Text style={[styles.optionText, l === language && { fontFamily: Fonts.bold }]}>{l}</Text>
            {l === language ? <Ionicons name="checkmark" size={20} color={Colors.goldDark} /> : null}
          </Pressable>
        ))}
      </BottomSheet>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  optionText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 16 },
});
