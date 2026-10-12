import { EmptyState } from "@/components/empty-state";
import { Avatar } from "@/components/member-ui";
import { Card, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { unblockMember, useSettings } from "@/lib/profile-store";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function BlockedMembers() {
  const { blocked } = useSettings();

  const unblock = (name: string) =>
    Alert.alert(`Unblock ${name}?`, "They will be able to view your profile and send you connection requests again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Unblock", onPress: () => unblockMember(name) },
    ]);

  return (
    <SettingsScreen title="Blocked Members">
      {blocked.length ? (
        blocked.map((b) => {
          const m = findMember(b.name);
          return (
            <Card key={b.name} style={styles.row}>
              <Avatar name={b.name} photo={m?.photo} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{b.name}</Text>
                {m ? (
                  <Text style={styles.role} numberOfLines={1}>
                    {m.role} at {m.company}
                  </Text>
                ) : null}
              </View>
              <Pressable onPress={() => unblock(b.name)} accessibilityRole="button" accessibilityLabel={`Unblock ${b.name}`} style={styles.unblock}>
                <Text style={styles.unblockText}>Unblock</Text>
              </Pressable>
            </Card>
          );
        })
      ) : (
        <EmptyState
          inline
          icon="ban-outline"
          title="No Blocked Members"
          text="Members you block will appear here."
          cta={{ label: "Block a Member", onPress: () => router.push({ pathname: "/report-block", params: { tab: "block" } }) }}
        />
      )}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  unblock: { paddingHorizontal: 14, height: 34, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.gold, alignItems: "center", justifyContent: "center", backgroundColor: Colors.white },
  unblockText: { color: Colors.goldDark, fontFamily: Fonts.semiBold, fontSize: 12 },
  empty: { alignItems: "center", gap: 6, paddingTop: 60 },
  emptyTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16, marginTop: 6 },
  emptySub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginBottom: 10 },
});
