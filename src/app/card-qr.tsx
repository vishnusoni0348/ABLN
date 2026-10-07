import { QrCode } from "@/components/qr-code";
import { CARD_SHADOW, ScreenHeader } from "@/components/member-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { cardLink, useBusinessCard } from "@/lib/card-store";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SIZE = 220;

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const top = pos[0] === "t";
  const left = pos[1] === "l";
  return (
    <View
      style={[
        styles.corner,
        top ? { top: 0, borderTopWidth: 4 } : { bottom: 0, borderBottomWidth: 4 },
        left ? { left: 0, borderLeftWidth: 4 } : { right: 0, borderRightWidth: 4 },
        { borderTopLeftRadius: top && left ? 14 : 0, borderTopRightRadius: top && !left ? 14 : 0, borderBottomLeftRadius: !top && left ? 14 : 0, borderBottomRightRadius: !top && !left ? 14 : 0 },
      ]}
    />
  );
}

export default function CardQr() {
  const insets = useSafeAreaInsets();
  const card = useBusinessCard();
  const link = cardLink(card);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="QR Code" />

        <View style={styles.qrCard}>
          <View style={styles.frame}>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <QrCode value={link} size={SIZE} />
            <View style={styles.logoBox}>
              <Image source={require("../../assets/images/abln-logo.png")} style={styles.logo} resizeMode="contain" />
            </View>
          </View>
        </View>

        <View style={styles.scan}>
          <Text style={styles.scanTitle}>Scan to connect</Text>
          <Text style={styles.scanText}>Let others scan this QR code to view your ABLN profile and connect with you.</Text>
        </View>

        <View style={styles.btnRow}>
          <Pressable style={styles.btn} onPress={() => Alert.alert("Download QR", "This will be available soon.")} accessibilityRole="button">
            <Ionicons name="download-outline" size={18} color={Colors.navy} />
            <Text style={styles.btnText}>Download</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => Share.share({ message: `Scan or open to connect with ${card.name} on ABLN: ${link}` })} accessibilityRole="button">
            <Ionicons name="paper-plane-outline" size={18} color={Colors.navy} />
            <Text style={styles.btnText}>Share</Text>
          </Pressable>
        </View>

        <View style={styles.info}>
          <Ionicons name="information-circle-outline" size={20} color="#2F6FDE" />
          <Text style={styles.infoText}>Your QR code links to your ABLN business profile.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, gap: 16 },
  qrCard: { alignItems: "center", paddingVertical: 28, borderRadius: Radius.xl, backgroundColor: Colors.white, ...CARD_SHADOW },
  frame: { width: SIZE + 40, height: SIZE + 40, alignItems: "center", justifyContent: "center" },
  corner: { position: "absolute", width: 38, height: 38, borderColor: Colors.gold },
  logoBox: { position: "absolute", width: 58, height: 36, borderRadius: 6, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  logo: { width: 50, height: 28 },
  scan: { padding: 16, borderRadius: Radius.lg, backgroundColor: "#FEF6E6", alignItems: "center", gap: 4 },
  scanTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 14 },
  scanText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, textAlign: "center" },
  btnRow: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { color: Colors.navy, fontFamily: Fonts.semiBold, fontSize: 14 },
  info: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: "#EAF1FB" },
  infoText: { flex: 1, color: "#2F6FDE", fontFamily: Fonts.regular, fontSize: 12 },
});
