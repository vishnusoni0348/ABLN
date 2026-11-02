import { MenuRow, SettingsScreen } from "@/components/settings-ui";
import { useSettings } from "@/lib/profile-store";
import { router } from "expo-router";

export default function AccountSettings() {
  const { profile, language, password } = useSettings();

  return (
    <SettingsScreen title="Account Settings">
      <MenuRow icon="mail-outline" title="Email Address" sub={profile.email} onPress={() => router.push("/security-email")} />
      <MenuRow icon="call-outline" title="Mobile Number" sub={`${profile.dialCode} ${profile.mobile}`} onPress={() => router.push("/security-mobile")} />
      <MenuRow icon="lock-closed-outline" title={password === null ? "Set Password" : "Change Password"} sub={password === null ? "Log in with a password as well as OTP" : "Update your password"} onPress={() => router.push("/security-password")} />
      <MenuRow icon="notifications-outline" title="Notifications" sub="Manage your preferences" onPress={() => router.push("/notification-preferences")} />
      <MenuRow icon="language-outline" title="Language" sub={language} onPress={() => router.push("/choose-language")} />
      <MenuRow icon="link-outline" title="Connected Accounts" sub="Manage linked accounts" onPress={() => router.push("/connected-accounts")} />
      <MenuRow icon="person-remove-outline" title="Deactivate Account" sub="Hide your profile from ABLN" danger onPress={() => router.push("/deactivate-account")} />
    </SettingsScreen>
  );
}
