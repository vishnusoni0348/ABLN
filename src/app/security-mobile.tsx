import { Field } from "@/components/form-fields";
import { CurrentCard, Heading, NoteCard, SecurityScreen, maskMobile } from "@/components/security-ui";
import { GoldButton } from "@/components/settings-ui";
import { useSettings } from "@/lib/profile-store";
import { router } from "expo-router";
import { useState } from "react";

export default function SecurityMobile() {
  const { profile } = useSettings();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length !== 10) return setError("Enter a valid 10-digit mobile number");
    if (digits === profile.mobile.replace(/\D/g, "")) return setError("This is already your current number");
    router.push({ pathname: "/security-otp", params: { type: "mobile", value: digits } });
  };

  return (
    <SecurityScreen icon="shield-checkmark" footer={<GoldButton label="Continue" onPress={submit} />}>
      <Heading title="Change Mobile Number" sub="Update your mobile number to keep your account secure and accessible." />
      <CurrentCard icon="call-outline" label="Current Mobile Number" value={`${profile.dialCode} ${maskMobile(profile.mobile)}`} />
      <Field label="New Mobile Number" icon="call-outline" prefix={profile.dialCode} placeholder="Enter new mobile number" value={mobile} onChangeText={(v) => { setMobile(v); setError(""); }} error={error} keyboardType="phone-pad" maxLength={10} />
      <NoteCard>You will receive an OTP on your new mobile number to verify the change.</NoteCard>
    </SecurityScreen>
  );
}
