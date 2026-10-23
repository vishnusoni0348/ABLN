import { Avatar, CARD_SHADOW } from "@/components/member-ui";
import { OutlineBtn, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { shareWhatsApp, useInviteInfo } from "@/lib/invite-share";
import { addInvite } from "@/lib/referral-store";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Person = { id: string; name: string; phone: string };
type Load = { state: "loading" } | { state: "denied"; canAskAgain: boolean } | { state: "error" } | { state: "ready"; people: Person[] };

const NONE: Person[] = [];

async function readContacts(): Promise<Load> {
  try {
    const perm = await Contacts.requestPermissionsAsync();
    if (!perm.granted) return { state: "denied", canAskAgain: perm.canAskAgain };
    const rows = await Contacts.Contact.getAllDetails([Contacts.ContactField.FULL_NAME, Contacts.ContactField.PHONES], { sortOrder: Contacts.ContactsSortOrder.GivenName });
    const people = rows
      .map((r, i) => ({ id: `${i}-${r.fullName}`, name: r.fullName?.trim() ?? "", phone: r.phones?.[0]?.number ?? "" }))
      .filter((p) => p.name && p.phone);
    return { state: "ready", people };
  } catch {
    return { state: "error" };
  }
}

export default function InviteContacts() {
  const { message } = useInviteInfo();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [query, setQuery] = useState("");
  const [invited, setInvited] = useState<string[]>([]);

  useEffect(() => {
    let live = true;
    readContacts().then((r) => live && setLoad(r));
    return () => {
      live = false;
    };
  }, []);

  const retry = () => {
    setLoad({ state: "loading" });
    readContacts().then(setLoad);
  };

  const people = load.state === "ready" ? load.people : NONE;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? people.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q)) : people;
  }, [people, query]);

  const invite = (p: Person) => {
    shareWhatsApp(message, p.phone);
    addInvite(p.name, p.phone);
    setInvited((l) => [...l, p.id]);
  };

  return (
    <SettingsScreen title="Invite from Contacts">
      {load.state === "loading" ? <Note text="Loading your contacts…" /> : null}
      {load.state === "error" ? (
        <>
          <Note text="We couldn't read your contacts." />
          <OutlineBtn label="Try Again" icon="refresh" onPress={retry} />
        </>
      ) : null}
      {load.state === "denied" ? (
        <>
          <Note text="Allow contact access to pick people to invite. We only use it to open your invite message." />
          <OutlineBtn label={load.canAskAgain ? "Allow Access" : "Open Settings"} icon="people-outline" onPress={load.canAskAgain ? retry : () => Linking.openSettings()} />
        </>
      ) : null}

      {load.state === "ready" ? (
        <>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Search contacts" placeholderTextColor={Colors.textMuted} style={styles.searchInput} accessibilityLabel="Search contacts" />
          </View>
          {shown.length === 0 ? (
            <Note text={people.length ? "No contacts match your search." : "No contacts with phone numbers found."} />
          ) : (
            <View style={styles.list}>
              {shown.map((p, idx) => (
                <View key={p.id} style={[styles.row, idx < shown.length - 1 && styles.divider]}>
                  <Avatar name={p.name} size={44} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.phone} numberOfLines={1}>{p.phone}</Text>
                  </View>
                  {invited.includes(p.id) ? (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} accessibilityLabel="Invited" />
                  ) : (
                    <Pressable onPress={() => invite(p)} accessibilityRole="button" accessibilityLabel={`Invite ${p.name}`} style={styles.invite}>
                      <Text style={styles.inviteText}>Invite</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}
    </SettingsScreen>
  );
}

function Note({ text }: { text: string }) {
  return <Text style={styles.note}>{text}</Text>;
}

const styles = StyleSheet.create({
  note: { textAlign: "center", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, paddingVertical: 24, paddingHorizontal: 12 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 46, paddingHorizontal: 14, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, padding: 0 },
  list: { backgroundColor: Colors.white, borderRadius: Radius.lg, paddingHorizontal: 14, ...CARD_SHADOW },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  phone: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  invite: { paddingHorizontal: 16, height: 34, borderRadius: 17, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  inviteText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 13 },
});
