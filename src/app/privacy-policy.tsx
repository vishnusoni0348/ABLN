import { Accordion, LegalHero, UpdatedCard } from "@/components/legal-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { LEGAL_UPDATED, PRIVACY } from "@/data/legal";

export default function PrivacyPolicy() {
  return (
    <SettingsScreen title="Privacy Policy">
      <LegalHero title={"Privacy\nPolicy"} sub="Your privacy is important to us. This policy explains how we collect, use and protect your information." icon="lock-closed" />
      <UpdatedCard date={LEGAL_UPDATED} />
      <Accordion sections={PRIVACY} />
    </SettingsScreen>
  );
}
