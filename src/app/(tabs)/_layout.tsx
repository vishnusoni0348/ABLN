import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];
type IconName = ComponentProps<typeof Ionicons>["name"];

// `route` is the screen under (tabs)/; tabs without one are placeholders until their screens exist.
const TABS: { key: string; route?: string; icon: IconName; iconOn: IconName; label: string; badge?: boolean }[] = [
  { key: "home", route: "home", icon: "home-outline", iconOn: "home", label: "Home" },
  { key: "network", route: "network", icon: "people-outline", iconOn: "people", label: "Network" },
  { key: "opportunities", route: "opportunities", icon: "briefcase-outline", iconOn: "briefcase", label: "Opportunities" },
  { key: "events", icon: "calendar-outline", iconOn: "calendar", label: "Events" },
  { key: "messages", icon: "chatbox-ellipses-outline", iconOn: "chatbox-ellipses", label: "Messages", badge: true },
  { key: "more", icon: "grid-outline", iconOn: "grid", label: "More" },
];

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index].name;

  const onPress = (route?: string) => {
    if (route && route !== activeRoute) navigation.navigate(route);
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((t) => {
        const on = t.route === activeRoute;
        return (
          <Pressable key={t.key} onPress={() => onPress(t.route)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <View>
              <Ionicons name={on ? t.iconOn : t.icon} size={24} color={on ? Colors.goldDark : Colors.textSecondary} />
              {t.badge ? <View style={styles.tabBadge} /> : null}
            </View>
            <Text style={[styles.tabLabel, on && styles.tabLabelOn]} numberOfLines={1}>
              {t.label}
            </Text>
            <View style={[styles.tabUnderline, on && styles.tabUnderlineOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs backBehavior="history" tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Colors.white } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="network" />
      <Tabs.Screen name="opportunities" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: "row", paddingTop: 10, borderTopWidth: 1, borderTopColor: "#EEF1F5", backgroundColor: Colors.white },
  tab: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, alignItems: "center", gap: 3 },
  tabBadge: { position: "absolute", top: -1, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  tabLabel: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 10, textAlign: "center", alignSelf: "stretch" },
  tabLabelOn: { color: Colors.goldDark, fontFamily: Fonts.bold },
  tabUnderline: { width: 32, height: 3, borderRadius: 2, backgroundColor: "transparent", marginTop: 2 },
  tabUnderlineOn: { backgroundColor: Colors.goldDark },
});
