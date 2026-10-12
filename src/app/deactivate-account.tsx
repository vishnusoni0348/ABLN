import { Label, Select } from "@/components/form-fields";
import { OutlineBtn, SettingsScreen, SolidButton } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const CONSEQUENCES: { icon: IconName; text: string }[] = [
  { icon: "eye-off-outline", text: "Your profile will be hidden from all members." },
  { icon: "ribbon-outline", text: "You will lose access to all member benefits." },
  { icon: "people-outline", text: "Your active connections will remain saved." },
  { icon: "refresh-outline", text: "You can reactivate your account anytime." },
];

const REASONS = ["I'm not using ABLN enough", "Privacy concerns", "Too many notifications", "Found a better alternative", "Taking a break", "Other"];
const FEEDBACK_MAX = 500;

export default function DeactivateAccount() {
  const [reason, setReason] = useState<string>();
  const [feedback, setFeedback] = useState("");

  const deactivate = () =>
    Alert.alert("Deactivate your account?", "Your profile will be hidden from all members. You can reactivate it anytime by logging in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: () => {
          // TODO: send reason/feedback to the deactivation API once it is available.
          router.replace("/login");
        },
      },
    ]);

  return (
    <SettingsScreen
      title="Deactivate Account"
      footer={
        <>
          <SolidButton label="Deactivate Account" onPress={deactivate} />
          <OutlineBtn label="Cancel" onPress={() => router.back()} />
        </>
      }
    >
      <View style={styles.banner}>
        <Ionicons name="warning" size={26} color={Colors.error} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>We&apos;re sorry to see you go!</Text>
          <Text style={styles.bannerText}>Deactivating your account will remove your profile from ABLN. You can reactivate it anytime by logging in again.</Text>
        </View>
      </View>

      <Text style={styles.heading}>Before you deactivate</Text>
      <View style={styles.list}>
        {CONSEQUENCES.map((c) => (
          <View key={c.text} style={styles.item}>
            <Ionicons name={c.icon} size={20} color={Colors.goldDark} />
            <Text style={styles.itemText}>{c.text}</Text>
          </View>
        ))}
      </View>

      <Select label="Reason for leaving" icon="chatbox-ellipses-outline" optional placeholder="Select a reason" value={reason} options={REASONS} onChange={setReason} />

      <View>
        <Label text="Additional feedback" optional />
        <TextInput
          value={feedback}
          onChangeText={(v) => setFeedback(v.slice(0, FEEDBACK_MAX))}
          multiline
          textAlignVertical="top"
          placeholder="Tell us how we can improve..."
          placeholderTextColor={Colors.textMuted}
          style={styles.textarea}
        />
        <Text style={styles.count}>
          {feedback.length}/{FEEDBACK_MAX}
        </Text>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FDECEC" },
  bannerTitle: { color: Colors.error, fontFamily: Fonts.bold, fontSize: 15 },
  bannerText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  heading: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 4 },
  list: { gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FEF6E6" },
  item: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 13 },
  textarea: { minHeight: 100, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, padding: 12, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14 },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11, marginTop: 4 },
});
