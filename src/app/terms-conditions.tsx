import { Accordion, Checkbox, LegalHero, UpdatedCard } from "@/components/legal-ui";
import { GoldButton, SettingsScreen } from "@/components/settings-ui";
import { LEGAL_UPDATED, TERMS } from "@/data/legal";
import { router } from "expo-router";
import { useState } from "react";

export default function TermsConditions() {
  const [agreed, setAgreed] = useState(false);

  return (
    <SettingsScreen title="Terms & Conditions" footer={<GoldButton label="Accept & Continue" disabled={!agreed} onPress={() => router.back()} />}>
      <LegalHero title={"Terms &\nConditions"} sub="Please read these Terms & Conditions carefully before using the ABLN app." icon="document-text" />
      <UpdatedCard date={LEGAL_UPDATED} />
      <Accordion sections={TERMS} />
      <Checkbox checked={agreed} onChange={setAgreed} label="I have read and agree to the Terms & Conditions of ABLN." />
    </SettingsScreen>
  );
}
