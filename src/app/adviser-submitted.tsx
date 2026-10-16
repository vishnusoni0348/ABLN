import { ResultBody } from "@/components/adviser-ui";
import { GoldButton, OutlineBtn } from "@/components/settings-ui";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdviserSubmitted() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24 }]} showsVerticalScrollIndicator={false}>
        <ResultBody
          illustration={<Image source={require("../../assets/images/adviser-submitted.png")} style={styles.art} contentFit="contain" />}
          title={"Request Submitted\nSuccessfully!"}
          message="Your adviser profile is under review. We'll notify you once it's approved."
        />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <GoldButton label="Back to Profile" onPress={() => router.dismissTo("/my-profile")} />
        <OutlineBtn label="Explore Network" color={Colors.goldDark} onPress={() => router.navigate("/network")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingBottom: 16 },
  art: { width: "100%", height: 280 },
  footer: { paddingHorizontal: 20, gap: 12 },
});
