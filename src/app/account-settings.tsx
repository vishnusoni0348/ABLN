import { Field } from "@/components/form-fields";
import { BottomSheet, GoldButton, MenuRow, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { LANGUAGES, setLanguage, updateProfile, useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

type Sheet = "email" | "mobile" | "language" | null;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountSettings() {
  const { profile, language } = useSettings();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const open = (s: Exclude<Sheet, null>) => {
    setEmail(profile.email);
    setMobile(profile.mobile);
    setError("");
    setSheet(s);
  };
  const close = () => setSheet(null);

  const saveEmail = () => {
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address");
    updateProfile({ email: email.trim() });
    close();
  };
  const saveMobile = () => {
    if (mobile.replace(/\D/g, "").length < 10) return setError("Enter a valid 10-digit mobile number");
    updateProfile({ mobile: mobile.trim() });
    close();
  };

  return (
    <SettingsScreen title="Account Settings">
      <MenuRow icon="mail-outline" title="Email Address" sub={profile.email} onPress={() => open("email")} />
      <MenuRow icon="call-outline" title="Mobile Number" sub={`${profile.dialCode} ${profile.mobile}`} onPress={() => open("mobile")} />
      <MenuRow icon="notifications-outline" title="Notifications" sub="Manage your preferences" onPress={() => router.push("/notification-preferences")} />
      <MenuRow icon="language-outline" title="Language" sub={language} onPress={() => open("language")} />
      <MenuRow icon="link-outline" title="Connected Accounts" sub="Manage linked accounts" onPress={() => Alert.alert("Connected Accounts", "This will be available soon.")} />
      <MenuRow icon="person-remove-outline" title="Deactivate Account" sub="Hide your profile from ABLN" danger onPress={() => router.push("/deactivate-account")} />

      <BottomSheet visible={sheet === "email"} title="Email Address" onClose={close}>
        <Field label="Email" icon="mail-outline" value={email} onChangeText={(v) => { setEmail(v); setError(""); }} error={error} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <GoldButton label="Save Email" onPress={saveEmail} />
      </BottomSheet>

      <BottomSheet visible={sheet === "mobile"} title="Mobile Number" onClose={close}>
        <Field label="Mobile Number" icon="call-outline" prefix={profile.dialCode} value={mobile} onChangeText={(v) => { setMobile(v); setError(""); }} error={error} keyboardType="phone-pad" maxLength={14} />
        <GoldButton label="Save Number" onPress={saveMobile} />
      </BottomSheet>

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
