import { EmptyState } from "@/components/empty-state";
import { BackHeader, GoldButton, OutlineButton, PersonAvatar } from "@/components/intro-ui";
import { CARD_SHADOW } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { findMember } from "@/data/members";
import { acceptRequest, declineRequest, formatAgo, useMessageRequests } from "@/lib/chat-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessageRequests() {
  const insets = useSafeAreaInsets();
  const requests = useMessageRequests();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.pad}>
        <BackHeader title="Message Requests" />
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, requests.length === 0 && { flexGrow: 1 }]} showsVerticalScrollIndicator={false}>
        {requests.length > 0 ? <Text style={styles.sub}>People who aren&apos;t in your network yet have sent you a message request.</Text> : null}
        {requests.length === 0 ? <EmptyState inline icon="mail-open-outline" title="No pending requests" text="Message requests from members outside your network will show up here." /> : null}
        {requests.map((r) => {
          const m = findMember(r.name);
          return (
            <Pressable key={r.id} style={styles.card} onPress={() => router.push({ pathname: "/chat", params: { request: r.id } })} accessibilityRole="button" accessibilityLabel={`View message request from ${r.name}`}>
              <View style={styles.head}>
                <PersonAvatar name={r.name} size={52} />
                <View style={styles.info}>
                  <View style={styles.top}>
                    <Text style={styles.name} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <Text style={styles.ago}>{formatAgo(r.sentAt)}</Text>
                  </View>
                  {m ? (
                    <Text style={styles.role} numberOfLines={2}>
                      {m.role}
                      {"\n"}
                      {m.company}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Text style={styles.text} numberOfLines={2}>
                {r.text}
              </Text>
              <View style={styles.actions}>
                <View style={styles.action}>
                  <OutlineButton label="Decline" onPress={() => declineRequest(r.id)} />
                </View>
                <View style={styles.action}>
                  <GoldButton
                    label="Accept"
                    onPress={() => {
                      acceptRequest(r.id);
                      router.push({ pathname: "/chat", params: { name: r.name } });
                    }}
                  />
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  pad: { paddingHorizontal: 16 },
  scroll: { padding: 16, gap: 14 },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  card: { gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...CARD_SHADOW },
  head: { flexDirection: "row", gap: 12 },
  info: { flex: 1, minWidth: 0 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flexShrink: 1, color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  ago: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 11 },
  role: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
  text: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1 },
});
