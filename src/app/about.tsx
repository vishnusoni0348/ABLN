import { AboutBanner, CardText, DetailRow, InfoCard, LinkRow } from "@/components/legal-ui";
import { SettingsScreen } from "@/components/settings-ui";
import { ABOUT } from "@/data/legal";
import { Linking } from "react-native";

export default function About() {
  return (
    <SettingsScreen title="About ABLN">
      <AboutBanner />
      <InfoCard icon="flag-outline" title="Our Mission">
        <CardText>{ABOUT.mission}</CardText>
      </InfoCard>
      <InfoCard icon="document-text-outline" title="About ABLN">
        <CardText>{ABOUT.about}</CardText>
      </InfoCard>
      <InfoCard icon="information-circle-outline" title="App Details">
        <DetailRow icon="person-outline" label="App Version" value={ABOUT.version} />
        <DetailRow icon="calendar-outline" label="Release Date" value={ABOUT.releaseDate} />
        <DetailRow icon="layers-outline" label="Platform" value={ABOUT.platform} />
      </InfoCard>
      <InfoCard icon="headset-outline" title="Contact Us">
        <CardText>{"We'd love to hear from you. Reach out for any questions, support or partnership inquiries."}</CardText>
        <LinkRow icon="mail-outline" label={ABOUT.email} onPress={() => Linking.openURL(`mailto:${ABOUT.email}`)} />
        <LinkRow icon="globe-outline" label={ABOUT.website} onPress={() => Linking.openURL(`https://${ABOUT.website}`)} />
        <LinkRow icon="location-outline" label={ABOUT.address} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(ABOUT.address)}`)} />
      </InfoCard>
    </SettingsScreen>
  );
}
