import { GoldButton, SectionHeading, SettingsScreen, ToggleRow } from "@/components/settings-ui";
import { NotificationPrefs, updateNotifications, useSettings } from "@/lib/profile-store";
import type { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Alert, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Item = { key: keyof NotificationPrefs; icon: IconName; title: string; sub: string };

const PUSH: Item[] = [
  { key: "newConnections", icon: "people-outline", title: "New Connections", sub: "When someone connects with you" },
  { key: "messages", icon: "chatbubble-outline", title: "Messages", sub: "When you receive a message" },
  { key: "eventUpdates", icon: "calendar-outline", title: "Event Updates", sub: "Event invites and reminders" },
  { key: "partnerOffers", icon: "pricetag-outline", title: "Partner Offers", sub: "New offers and discounts" },
  { key: "announcements", icon: "megaphone-outline", title: "Announcements", sub: "Important updates from ABLN" },
];

const EMAIL: Item[] = [
  { key: "weeklyDigest", icon: "mail-outline", title: "Weekly Digest", sub: "Summary of network activity" },
  { key: "eventInvitations", icon: "calendar-outline", title: "Event Invitations", sub: "Upcoming events and reminders" },
  { key: "emailPartnerOffers", icon: "pricetag-outline", title: "Partner Offers", sub: "Exclusive offers and benefits" },
  { key: "productUpdates", icon: "rocket-outline", title: "Product Updates", sub: "New features and improvements" },
];

export default function NotificationPreferences() {
  const { notifications } = useSettings();
  const [draft, setDraft] = useState(notifications);

  const save = () => {
    updateNotifications(draft);
    Alert.alert("Preferences saved", "Your notification preferences have been updated.", [{ text: "OK", onPress: () => router.back() }]);
  };
  const rows = (items: Item[]) =>
    items.map((i) => <ToggleRow key={i.key} icon={i.icon} title={i.title} sub={i.sub} value={draft[i.key]} onChange={(v) => setDraft((d) => ({ ...d, [i.key]: v }))} />);

  return (
    <SettingsScreen title="Notification Preferences" footer={<GoldButton label="Save Preferences" onPress={save} />}>
      <SectionHeading title="Push Notifications" sub="Get real-time updates on important activities." />
      {rows(PUSH)}
      <View style={{ marginTop: 10 }}>
        <SectionHeading title="Email Notifications" sub="Receive updates via email." />
      </View>
      {rows(EMAIL)}
    </SettingsScreen>
  );
}
