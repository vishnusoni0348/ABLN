import { Avatar } from "@/components/member-ui";
import { Card, ChipList, OutlineBtn, GoldButton, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { DAYS, SLOTS, useAdviser } from "@/lib/adviser-store";
import { useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const editStep = (step: number) => router.push({ pathname: "/adviser-setup", params: { step: String(step) } });

export default function AdviserProfile() {
  const { status, application: a } = useAdviser();
  const { profile: p } = useSettings();

  if (status !== "approved" || !a) return <Redirect href="/adviser-status" />;

  const years = /^(\d+\+?)\s*Years?/.exec(a.experience)?.[1] ?? a.experience;
  const days = DAYS.filter((d) => a.days.includes(d)).join(", ");
  const slots = SLOTS.filter((s) => a.slots.includes(s.key));

  return (
    <SettingsScreen
      title="My Adviser Profile"
      right={<EditLink onPress={() => editStep(4)} label="Edit adviser profile" />}
      footer={
        <View style={styles.footer}>
          <OutlineBtn label="View Adviser Requests" color={Colors.goldDark} onPress={() => router.push("/my-advice")} style={{ flex: 1 }} />
          <GoldButton label="Explore Network" onPress={() => router.navigate("/network")} style={{ flex: 1 }} />
        </View>
      }
    >
      <View>
        <Image source={require("../../assets/images/adviser-banner.png")} style={styles.banner} contentFit="cover" contentPosition="top" />
        <View style={styles.ring}>
          <Avatar name={p.name} photo={p.photo} size={96} />
          <View style={styles.online} />
        </View>
      </View>

      <View style={styles.identity}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {p.name}
          </Text>
          <View style={styles.role}>
            <Text style={styles.roleText}>Adviser</Text>
          </View>
        </View>
        <Text style={styles.sub}>{a.designation}</Text>
        <Text style={styles.sub}>{a.company}</Text>
      </View>

      <ChipList items={a.expertise} />

      <Card style={styles.stats}>
        <Stat icon="briefcase-outline" value={years} label="Years Experience" />
        <View style={styles.sep} />
        <Stat icon="laptop-outline" value={a.mode} label="Preferred Mode" />
        <View style={styles.sep} />
        <Stat icon="time-outline" value={a.session.replace(" Minutes", " Min")} label="Session Duration" />
      </Card>

      <Card style={{ gap: 8 }}>
        <View style={styles.head}>
          <Text style={styles.heading}>About</Text>
          <EditLink onPress={() => editStep(2)} label="Edit about" />
        </View>
        <Text style={styles.about}>{a.about}</Text>
      </Card>

      <Section icon="bulb-outline" title="Expertise Areas" onEdit={() => editStep(1)}>
        <ChipList items={a.expertise} />
      </Section>

      <Section icon="briefcase-outline" title="Experience" onEdit={() => editStep(2)}>
        <Line icon="calendar-outline" text={a.experience} />
        <Line icon="person-outline" text={a.designation} />
        <Line icon="business-outline" text={a.company} />
      </Section>

      <Section icon="calendar-outline" title="Availability" onEdit={() => editStep(3)}>
        <Line icon="laptop-outline" text={a.mode} />
        <Line icon="calendar-outline" text={days} />
        {slots.map((s) => (
          <Line key={s.key} icon="time-outline" text={`${s.key} (${s.time})`} />
        ))}
      </Section>
    </SettingsScreen>
  );
}

function EditLink({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label} style={styles.edit}>
      <Ionicons name="create-outline" size={16} color={Colors.goldDark} />
      <Text style={styles.editText}>Edit</Text>
    </Pressable>
  );
}

function Section({ icon, title, onEdit, children }: { icon: IconName; title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <Card style={styles.section}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={24} color={Colors.goldDark} />
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={styles.head}>
          <Text style={styles.heading}>{title}</Text>
          <EditLink onPress={onEdit} label={`Edit ${title}`} />
        </View>
        {children}
      </View>
    </Card>
  );
}

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={Colors.navy} />
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Line({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={styles.lineText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: "row", gap: 12 },
  edit: { flexDirection: "row", alignItems: "center", gap: 4 },
  editText: { color: Colors.goldDark, fontFamily: Fonts.medium, fontSize: 14 },
  banner: { width: "100%", aspectRatio: 850 / 290, borderRadius: Radius.lg },
  ring: { position: "absolute", left: 14, bottom: -44, padding: 3, borderRadius: 60, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.champagne },
  online: { position: "absolute", right: 6, bottom: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  identity: { marginTop: 40, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 24 },
  role: { backgroundColor: "#FBF1D6", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 },
  roleText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 13 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 15 },
  stats: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  stat: { flex: 1, alignItems: "center", gap: 2, paddingHorizontal: 4 },
  statValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 18 },
  statLabel: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, textAlign: "center" },
  sep: { width: 1, height: 40, backgroundColor: Colors.border },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  about: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  section: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  sectionIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#FEF3DC", alignItems: "center", justifyContent: "center" },
  line: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  lineText: { flex: 1, color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
});
