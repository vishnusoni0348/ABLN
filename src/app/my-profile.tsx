import { PROFILE_VIEW_TOTALS } from "@/data/profile-views";
import { Avatar, GOLD_BG } from "@/components/member-ui";
import { usePickImage } from "@/components/form-fields";
import { Card, MenuRow, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { useConnections } from "@/lib/connection-store";
import { useAdviser } from "@/lib/adviser-store";
import { isUpcoming, useMeetings } from "@/lib/meeting-store";
import { updateProfile, useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, IconName> = {
  "Web Development": "code-slash-outline",
  "Mobile Apps": "phone-portrait-outline",
  "AI Solutions": "hardware-chip-outline",
  "Digital Transformation": "stats-chart-outline",
  "Business Partnerships": "people-outline",
  "IT Projects": "briefcase-outline",
  "Investment Opportunities": "trending-up-outline",
  "Software Development": "laptop-outline",
  "AI & Automation": "settings-outline",
  "IT Consulting": "people-circle-outline",
};
const FLAGS: Record<string, string> = { India: "🇮🇳", USA: "🇺🇸", UAE: "🇦🇪", UK: "🇬🇧", Singapore: "🇸🇬" };
const MAX_COUNTRIES = 4;

function Chip({ label, icon, flag }: { label: string; icon?: IconName; flag?: string }) {
  return (
    <View style={styles.chip}>
      {flag ? <Text style={styles.flag}>{flag}</Text> : <Ionicons name={icon ?? "sparkles-outline"} size={16} color={Colors.navy} />}
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function Section({ title, icon, items, flags, children }: { title: string; icon: IconName; items?: string[]; flags?: boolean; children?: ReactNode }) {
  const extra = flags && items && items.length > MAX_COUNTRIES ? items.length - MAX_COUNTRIES : 0;
  const shown = extra && items ? items.slice(0, MAX_COUNTRIES) : items;
  return (
    <Card style={{ gap: 12 }}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={22} color={Colors.goldDark} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={() => router.push("/edit-profile")} accessibilityRole="button" accessibilityLabel={`Edit ${title}`} style={styles.editPill}>
          <Ionicons name="create-outline" size={14} color={Colors.navy} />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
      {children}
      {shown?.length ? (
        <View style={styles.chips}>
          {shown.map((i) => (
            <Chip key={i} label={i} icon={ICONS[i]} flag={flags ? (FLAGS[i] ?? "🌐") : undefined} />
          ))}
          {extra ? (
            <View style={styles.chip}>
              <Text style={[styles.chipText, { color: Colors.textSecondary }]}>+{extra} More</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function ContactCell({ icon, label, value, onPress }: { icon: IconName; label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.cell}>
      <View style={styles.cellIcon}>
        <Ionicons name={icon} size={20} color={Colors.goldDark} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.cellLabel}>{label}</Text>
        <Text style={styles.cellValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.navy} />
    </Pressable>
  );
}

function Action({ icon, label, onPress, gold }: { icon: IconName; label: string; onPress: () => void; gold?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.action, gold && styles.actionGold, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={22} color={gold ? Colors.goldDark : Colors.navy} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}


export default function MyProfile() {
  const { profile: p } = useSettings();
  const { connections } = useConnections();
  const upcomingMeetings = useMeetings().filter((m) => isUpcoming(m)).length;
  const { status: adviser } = useAdviser();
  const pickPhoto = usePickImage((uri) => updateProfile({ photo: { uri } }));
  const editProfile = () => router.push("/edit-profile");
  const share = () => Share.share({ message: `${p.name} - ${p.designation}, ${p.company} on ABLN: https://abln.in/m/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }).catch(() => {});

  return (
    <SettingsScreen
      title="My Profile"
      right={
        <View style={styles.headerActions}>
          <Pressable hitSlop={10} onPress={() => router.push("/settings")} accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={22} color={Colors.navy} />
          </Pressable>
        </View>
      }
      footer={
        <View style={styles.actions}>
          <Action icon="create-outline" label="Edit Profile" onPress={() => router.push("/edit-profile")} />
          <Action gold icon="card-outline" label="Digital Card" onPress={() => router.push("/business-card")} />
          <Action icon="share-social-outline" label="Share Profile" onPress={share} />
        </View>
      }
    >
      <View style={styles.hero}>
        <Image source={p.cover ?? require("../../assets/images/profile-banner.png")} style={styles.banner} contentFit="cover" contentPosition="right" />
        <View style={styles.heroRow}>
          <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Change profile photo">
            <View style={styles.ring}>
              <Avatar name={p.name} photo={p.photo} size={92} />
            </View>
            <View style={styles.camera}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </Pressable>
          <View style={styles.heroText}>
            <View style={styles.badge}>
              <Ionicons name="ribbon" size={12} color={Colors.white} />
              <Text style={styles.badgeText}>ABLN</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={styles.role}>{p.designation}</Text>
            <Text style={styles.company} numberOfLines={1}>
              {p.company}
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.grid}>
        <ContactCell icon="mail-outline" label="Email" value={p.email} onPress={editProfile} />
        <ContactCell icon="call-outline" label="Mobile" value={`${p.dialCode} ${p.mobile}`} onPress={editProfile} />
        <ContactCell icon="globe-outline" label="Website" value={p.website} onPress={editProfile} />
        <ContactCell icon="location-outline" label="Location" value={p.region} onPress={editProfile} />
      </Card>

      <View style={styles.membership}>
        <View style={styles.crown}>
          <Ionicons name="ribbon" size={28} color={Colors.goldDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.memberPlan}>{p.plan}</Text>
          <Text style={styles.memberValid}>Valid till {p.validTill}</Text>
        </View>
        <Pressable onPress={() => router.navigate("/membership-status")} accessibilityRole="button" style={styles.memberBtn}>
          <Text style={styles.memberBtnText}>View Membership</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.white} />
        </Pressable>
      </View>

      <MenuRow icon="people-outline" title="My Connections" sub={`${connections.length} ${connections.length === 1 ? "connection" : "connections"}`} onPress={() => router.push("/my-connections")} />
      <MenuRow icon="calendar-outline" title="My Meetings" sub={`${upcomingMeetings} upcoming`} onPress={() => router.push("/my-meetings")} />
      <MenuRow icon="eye-outline" title="Who Viewed My Profile" sub={`${PROFILE_VIEW_TOTALS.all} people in the last 30 days`} onPress={() => router.push("/profile-views")} />

      <MenuRow
        icon="ribbon-outline"
        title={adviser === "approved" ? "My Adviser Profile" : adviser === "pending" ? "Adviser Application" : "Become an Adviser"}
        sub={adviser === "approved" ? "View and edit your adviser details" : adviser === "pending" ? "Under review" : "Share your expertise with ABLN members"}
        badge={adviser === "none" ? "New" : undefined}
        onPress={() => router.push(adviser === "approved" ? "/adviser-profile" : adviser === "pending" ? "/adviser-status" : "/adviser-intro")}
      />

      <Section title="Expertise" icon="ribbon-outline" items={p.expertise} />
      <Section title="Looking For" icon="locate-outline" items={p.lookingFor} />
      <Section title="Can Offer" icon="gift-outline" items={p.canOffer} />
      <Section title="Countries" icon="earth-outline" items={p.countries} flags />
      <Section title="About Me" icon="document-text-outline">
        <Text style={styles.about}>{p.about}</Text>
      </Section>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", gap: 16 },
  hero: { borderRadius: Radius.lg, overflow: "hidden", backgroundColor: "#FFF9EE", padding: 14, borderWidth: 1, borderColor: "#F3E6C8" },
  banner: StyleSheet.absoluteFill,
  heroRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 10 },
  ring: { padding: 4, borderRadius: 60, borderWidth: 2, borderColor: Colors.gold, backgroundColor: Colors.white },
  camera: { position: "absolute", right: 0, bottom: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.navy, borderWidth: 2, borderColor: Colors.white, alignItems: "center", justifyContent: "center" },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  badge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.gold, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  badgeText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 12 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 14 },
  company: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 0 },
  cell: { width: "50%", flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  cellIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FEF3DC", alignItems: "center", justifyContent: "center" },
  cellLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12 },
  cellValue: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11, marginTop: 1 },
  membership: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: GOLD_BG, borderWidth: 1, borderColor: "#F3E6C8" },
  crown: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#FDEBC4", alignItems: "center", justifyContent: "center" },
  memberPlan: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  memberValid: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  memberBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.goldDark, borderRadius: 20, paddingHorizontal: 12, height: 38 },
  memberBtnText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 12 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { flex: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  editPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, height: 32, borderRadius: 16, backgroundColor: "#EEF2FA" },
  editText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, height: 40, borderRadius: 20, backgroundColor: "#EEF2FA" },
  chipText: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  flag: { fontSize: 18 },
  about: { color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, padding: 12, borderRadius: 14, backgroundColor: "#EEF2FA" },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: Radius.lg, backgroundColor: "#EEF2FA", borderWidth: 1, borderColor: "#DCE4F2" },
  actionGold: { backgroundColor: GOLD_BG, borderColor: "#F3E6C8" },
  actionText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13 },
});
