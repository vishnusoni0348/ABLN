import { Field } from "@/components/form-fields";
import { CurrentCard, EMAIL_RE, Heading, SecurityScreen, maskEmail } from "@/components/security-ui";
import { GoldButton } from "@/components/settings-ui";
import { useSettings } from "@/lib/profile-store";
import { router } from "expo-router";
import { useState } from "react";

export default function SecurityEmail() {
  const { profile } = useSettings();
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ email?: string; confirm?: string }>({});

  const submit = () => {
    const next = email.trim().toLowerCase();
    const e: typeof errors = {};
    if (!EMAIL_RE.test(next)) e.email = "Enter a valid email address";
    else if (next === profile.email.toLowerCase()) e.email = "This is already your current email";
    if (confirm.trim().toLowerCase() !== next) e.confirm = "Email addresses do not match";
    setErrors(e);
    if (e.email || e.confirm) return;
    router.push({ pathname: "/security-otp", params: { type: "email", value: next } });
  };

  return (
    <SecurityScreen icon="mail" footer={<GoldButton label="Send Verification Code" onPress={submit} />}>
      <Heading title="Change Email Address" sub="Update your email address to keep your account secure and receive important updates." />
      <CurrentCard icon="mail-outline" label="Current Email Address" value={maskEmail(profile.email)} />
      <Field label="New Email Address" icon="mail-outline" placeholder="Enter new email address" value={email} onChangeText={(v) => { setEmail(v); setErrors({}); }} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field label="Confirm New Email Address" icon="mail-outline" placeholder="Enter email address again" value={confirm} onChangeText={(v) => { setConfirm(v); setErrors({}); }} error={errors.confirm} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
    </SecurityScreen>
  );
}
