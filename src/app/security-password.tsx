import { Heading, PASSWORD_RULES, PasswordField, SecurityScreen, StrengthMeter, passwordScore } from "@/components/security-ui";
import { GoldButton } from "@/components/settings-ui";
import { checkPassword, setPassword, useSettings } from "@/lib/profile-store";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

type Mode = "change" | "set" | "reset";

export default function SecurityPassword() {
  const { password } = useSettings();
  const params = useLocalSearchParams<{ mode?: Mode; verified?: string }>();
  const mode: Mode = params.mode ?? (password === null ? "set" : "change");
  // Set and reset skip the current password, so they must come through OTP verification first.
  const needsOtp = mode !== "change" && params.verified !== "1";

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  useEffect(() => {
    if (needsOtp) router.replace({ pathname: "/security-otp", params: { type: mode === "reset" ? "reset" : "password" } });
  }, [needsOtp, mode]);

  if (needsOtp) return null;

  const submit = () => {
    const e: typeof errors = {};
    if (mode === "change") {
      if (!current) e.current = "Enter your current password";
      else if (!checkPassword(current)) e.current = "Current password is incorrect";
    }
    if (passwordScore(next) < PASSWORD_RULES.length) e.next = "Password does not meet all the requirements";
    else if (mode === "change" && next === current) e.next = "New password must be different from the current one";
    if (confirm !== next) e.confirm = "Passwords do not match";
    setErrors(e);
    if (e.current || e.next || e.confirm) return;
    setPassword(next);
    router.replace({ pathname: "/security-success", params: { type: mode === "change" ? "password" : `password-${mode}` } });
  };

  const isChange = mode === "change";
  return (
    <SecurityScreen icon="lock-closed" footer={<GoldButton label={isChange ? "Update Password" : mode === "set" ? "Set Password" : "Reset Password"} onPress={submit} />}>
      <Heading
        title={isChange ? "Change Password" : mode === "set" ? "Set Password" : "Reset Password"}
        sub={isChange ? "Create a strong password to keep your account secure." : "Create a strong password so you can log in with it as well as OTP."}
      />
      {isChange ? <PasswordField label="Current Password" placeholder="Enter current password" value={current} onChangeText={(v) => { setCurrent(v); setErrors({}); }} error={errors.current} /> : null}
      <PasswordField label={isChange ? "New Password" : "Password"} placeholder="Enter new password" value={next} onChangeText={(v) => { setNext(v); setErrors({}); }} error={errors.next} />
      <StrengthMeter password={next} />
      <PasswordField label="Confirm Password" placeholder="Enter password again" value={confirm} onChangeText={(v) => { setConfirm(v); setErrors({}); }} error={errors.confirm} />
    </SecurityScreen>
  );
}
