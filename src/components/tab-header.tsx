import { Colors } from "@/constants/theme";
import { useUnreadCount } from "@/lib/notification-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function HeaderIconButton({ icon, size = 22, onPress, label, dot }: { icon: IconName; size?: number; onPress: () => void; label: string; dot?: boolean }) {
  return (
    <Pressable style={styles.bell} hitSlop={6} onPress={onPress} accessibilityLabel={label}>
      <Ionicons name={icon} size={size} color={Colors.navy} />
      {dot ? <View style={styles.bellDot} /> : null}
    </Pressable>
  );
}

// Fixed top bar shared by the tab screens; render it outside the ScrollView so it stays pinned.
export function TabHeader({ extraActions, onAvatarPress }: { extraActions?: ReactNode; onAvatarPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const unreadCount = useUnreadCount();
  const avatar = <Image source={require("../../assets/images/avatar-user.png")} style={styles.avatar} />;

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <Image source={require("../../assets/images/abln-logo-light.png")} style={styles.logo} resizeMode="contain" />
      <View style={styles.actions}>
        {extraActions}
        <HeaderIconButton icon="notifications-outline" onPress={() => router.push("/notifications")} label="Notifications" dot={unreadCount > 0} />
        {onAvatarPress ? (
          <Pressable onPress={onAvatarPress} hitSlop={6} accessibilityLabel="My business card">
            {avatar}
          </Pressable>
        ) : (
          avatar
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.white,
  },
  logo: { width: 130, height: 50 },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  bellDot: { position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  avatar: { width: 42, height: 42, borderRadius: 21 },
});
