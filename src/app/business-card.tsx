import { BusinessCardView } from "@/components/business-card";
import { ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { BusinessCard, cardLink, useBusinessCard } from "@/lib/card-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const soon = (what: string) => Alert.alert(what, "This will be available soon.");

function Action({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]} accessibilityRole="button">
      <Ionicons name={icon} size={24} color={Colors.navy} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

export default function BusinessCardScreen() {
  const insets = useSafeAreaInsets();
  const own = useBusinessCard();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const member = name && name !== own.name ? findMember(name) : undefined;
  const mine = !member;
  const card: BusinessCard = member
    ? { name: member.name, role: member.role, company: member.company, location: member.location, tags: member.tags, about: member.about ?? "", visibility: "members", photo: member.photo }
    : own;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={mine ? "My Business Card" : "Business Card"}
          right={
            !mine ? undefined : (
            <Pressable hitSlop={10} onPress={() => router.push("/card-visibility")} accessibilityLabel="Card visibility">
              <Ionicons name="ellipsis-horizontal" size={22} color={Colors.navy} />
            </Pressable>
            )
          }
        />
        <BusinessCardView card={card} />

        <View style={styles.actions}>
          <Action icon="download-outline" label="Save Contact" onPress={() => soon("Save contact")} />
          <Action icon="share-social-outline" label="Share" onPress={() => (mine ? router.push("/share-card") : Share.share({ message: `${card.name} - ${card.role}, ${card.company} on ABLN: ${cardLink(card)}` }).catch(() => {}))} />
          {mine ? <Action icon="qr-code-outline" label="QR Code" onPress={() => router.push("/card-qr")} /> : <Action icon="chatbubble-outline" label="Message" onPress={() => soon("Messages")} />}
        </View>

        {mine ? (
          <Pressable onPress={() => soon("Edit business card")} accessibilityRole="button">
            <LinearGradient colors={[Colors.goldLight, Colors.champagne, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.edit}>
              <Text style={styles.editText}>Edit Business Card</Text>
            </LinearGradient>
          </Pressable>
        ) : null}
        <Text style={styles.link} onPress={() => Share.share({ message: cardLink(card) })}>
          {cardLink(card)}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, gap: 14 },
  pressed: { opacity: 0.85 },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: Radius.lg, backgroundColor: "#EEF2FA" },
  actionText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 11 },
  edit: { height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  editText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 15 },
  link: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
});
