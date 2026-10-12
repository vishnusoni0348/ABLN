import { Select } from "@/components/form-fields";
import { DescriptionField, ScreenshotPicker, SupportBanner } from "@/components/help-ui";
import { GoldButton, SettingsScreen, SuccessDialog } from "@/components/settings-ui";
import { SUPPORT_SUBJECTS } from "@/data/help";
import { createTicket } from "@/lib/support-store";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function ContactSupport() {
  const [subject, setSubject] = useState<string>();
  const [description, setDescription] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  const [ticketId, setTicketId] = useState<string>();

  const submit = () => {
    if (!subject) return Alert.alert("Select a subject", "Please choose what your request is about.");
    if (!description.trim()) return Alert.alert("Add a description", "Please describe your issue in detail.");
    const ticket = createTicket({ title: subject, summary: description.trim() });
    setTicketId(String(ticket.id));
  };

  return (
    <SettingsScreen title="Contact Support" footer={<GoldButton label="Submit Request" onPress={submit} />}>
      <SupportBanner title="Still Need Help?" sub="Our support team is here to assist you. Share your query and we'll get back to you soon." />

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
          setTicketId(undefined);
          router.back();
        }}
      />
    </SettingsScreen>
  );
}
