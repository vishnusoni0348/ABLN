import { BusinessCardView } from "@/components/business-card";
import { Card, GoldButton, OutlineBtn, SegmentTabs, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import type { BusinessCard } from "@/lib/card-store";
import { useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Share, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Tab = "visible" | "hidden";

function Line({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Ionicons name={icon} size={18} color={Colors.goldDark} />
      <Text style={{ flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 }}>{text}</Text>
    </View>
  );
}

export default function DbcPreviewScreen() {
  const { profile: p, privacy } = useSettings();
  const [tab, setTab] = useState<Tab>("visible");

  const phone = `${p.dialCode} ${p.mobile}`;
  const card: BusinessCard = {
    name: p.name,
    role: p.designation,
    company: p.company,
    location: `${p.bizCity}, ${p.bizState}, India`,
    tags: p.expertise.slice(0, 3),
    about: p.about,
    visibility: "members",
    photo: p.photo,
    phone: privacy.dbcShowMobile ? phone : undefined,
    email: privacy.dbcShowEmail ? p.email : undefined,
    chapter: privacy.dbcShowChapter ? p.chapter : undefined,
  };

  const hidden: { icon: IconName; text: string }[] = [
    ...(privacy.dbcShowMobile ? [] : [{ icon: "call" as const, text: phone }]),
    ...(privacy.dbcShowEmail ? [] : [{ icon: "mail" as const, text: p.email }]),
    ...(privacy.dbcShowChapter ? [] : [{ icon: "people" as const, text: p.chapter }]),
  ];

  return (
    <SettingsScreen
      title="Digital Business Card Preview"
      footer={
        <View style={{ flexDirection: "row", gap: 12 }}>
          <OutlineBtn label="Share Card" icon="share-social-outline" color={Colors.goldDark} style={{ flex: 1 }} onPress={() => Share.share({ message: `${p.name} — ${p.designation}, ${p.company}` })} />
          <GoldButton label="Edit Card" style={{ flex: 1 }} onPress={() => router.push("/edit-profile")} />
        </View>
      }
    >
      <SegmentTabs
        tabs={[
          { key: "visible", label: "Visible View" },
          { key: "hidden", label: "Hidden View" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "visible" ? (
        <BusinessCardView card={card} />
      ) : (
        <Card style={{ gap: 14 }}>
          <Text style={{ color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 }}>Hidden from your card</Text>
          {hidden.length ? (
            hidden.map((h) => <Line key={h.icon} icon={h.icon} text={h.text} />)
          ) : (
            <Text style={{ color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13 }}>No details are hidden from your card.</Text>
          )}
        </Card>
      )}
    </SettingsScreen>
  );
}
