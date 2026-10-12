import { Select } from "@/components/form-fields";
import { DescriptionField, ScreenshotPicker, SectionRow, TicketRow } from "@/components/help-ui";
import { GoldButton, SettingsScreen, SuccessDialog } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { ISSUE_TYPES } from "@/data/help";
import { createTicket, useTickets } from "@/lib/support-store";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function ReportProblem() {
  const tickets = useTickets();
  const [issueType, setIssueType] = useState<string>();
  const [description, setDescription] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [ticketId, setTicketId] = useState<string>();

  const submit = () => {
    if (!issueType) return Alert.alert("Select an issue type", "Please choose the kind of problem you are facing.");
    if (!description.trim()) return Alert.alert("Describe the problem", "Please tell us what went wrong.");
    const ticket = createTicket({ title: issueType, summary: description.trim() });
    setIssueType(undefined);
    setDescription("");
    setShots([]);
    setTicketId(String(ticket.id));
  };

  return (
    <SettingsScreen title="Report a Problem">
      <View style={styles.banner}>
        <Ionicons name="warning" size={34} color={Colors.error} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Report a Problem</Text>
          <Text style={styles.bannerSub}>Let us know if you&apos;re facing any issues. We&apos;ll look into it and get back to you soon.</Text>
        </View>
      </View>

      <View>
        <Select label="Issue Type" icon="alert-circle-outline" placeholder="Select issue type" options={ISSUE_TYPES} value={issueType} onChange={setIssueType} required />
      </View>
      <DescriptionField value={description} onChange={setDescription} placeholder="Please describe the problem..." />
      <ScreenshotPicker shots={shots} onChange={setShots} />
      <GoldButton label="Submit Report" onPress={submit} />

      <SectionRow title="Your Recent Reports" action={tickets.length > 2 ? (showAll ? "Show Less" : "See All") : undefined} onAction={() => setShowAll((s) => !s)} />
      {tickets.length ? (
        (showAll ? tickets : tickets.slice(0, 2)).map((t) => <TicketRow key={t.id} ticket={t} />)
      ) : (
        <Text style={styles.empty}>You haven&apos;t reported any problems yet.</Text>
      )}

      <SuccessDialog
        visible={!!ticketId}
        title="Report Submitted"
        message="Thank you for letting us know. We'll look into it and get back to you soon."
        reference={ticketId}
        onAction={() => setTicketId(undefined)}
      />
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: "#FDECEC" },
  bannerTitle: { color: Colors.error, fontFamily: Fonts.bold, fontSize: 15 },
  bannerSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  empty: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center" },
});
