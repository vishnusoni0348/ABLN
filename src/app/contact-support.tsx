import { Select } from "@/components/form-fields";
import { DescriptionField, ScreenshotPicker, SupportBanner } from "@/components/help-ui";
import { GoldButton, SettingsScreen, SuccessDialog } from "@/components/settings-ui";
import { Colors, Fonts } from "@/constants/theme";
import { SUPPORT_SUBJECTS } from "@/data/help";
import { Ionicons } from "@expo/vector-icons";
import { createTicket } from "@/lib/support-store";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

export default function ContactSupport() {
  const [subject, setSubject] = useState<string>();
  const [description, setDescription] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  const [ticketId, setTicketId] = useState<string>();

  const submit = () => {
    if (!subject) return Alert.alert("Select a subject", "Please choose what your request is about.");
    if (!description.trim()) return Alert.alert("Add a description", "Please describe your issue in detail.");
    const ticket = createTicket({ title: subject, summary: description.trim(), category: subject });
    setTicketId(String(ticket.id));
  };

  return (
    <SettingsScreen
      title="Contact Support"
      right={
        <Pressable onPress={() => router.push("/support-tickets")} hitSlop={10} accessibilityRole="button" accessibilityLabel="My support tickets">
          <Ionicons name="list-outline" size={24} color={Colors.navy} />
        </Pressable>
      }
      footer={<GoldButton label="Submit Request" onPress={submit} />}>
      <SupportBanner title="Still Need Help?" sub="Our support team is here to assist you. Share your query and we'll get back to you soon." />

      <Pressable onPress={() => router.push("/support-tickets")} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Ionicons name="list-outline" size={18} color={Colors.goldDark} />
        <Text style={{ color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 14 }}>View My Tickets</Text>
      </Pressable>

      <View>
        <Select label="Subject" icon="help-circle-outline" placeholder="Select a subject" options={SUPPORT_SUBJECTS} value={subject} onChange={setSubject} required />
      </View>
      <DescriptionField value={description} onChange={setDescription} placeholder="Please describe your issue in detail..." />
      <ScreenshotPicker shots={shots} onChange={setShots} />

      <SuccessDialog
        visible={!!ticketId}
        title="Request Submitted"
        message="Thank you for reaching out. Our support team will get back to you soon."
        reference={ticketId}
        onAction={() => {
          const id = ticketId;
          setTicketId(undefined);
          if (id) router.replace({ pathname: "/support-ticket", params: { id } });
          else router.back();
        }}
      />
    </SettingsScreen>
  );
}
