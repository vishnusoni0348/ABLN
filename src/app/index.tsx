import { useEffect } from "react";
import { Colors, Fonts } from "@/constants/theme";
import { Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SPLASH_DURATION_MS = 3000; // 3 seconds
const GOLD = Colors.gold;
const NAVY = Colors.navy;

export default function Splash() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const rotation = useSharedValue(0);
  const fade = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 900 });
    rotation.value = withRepeat(
      withTiming(360, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
    const timer = setTimeout(() => router.replace("/welcome"), SPLASH_DURATION_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimation(rotation);
    };
  }, [router, rotation, fade]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const logoWidth = Math.min(width * 0.78, 340);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/splash-bg.png")}
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />

      <Animated.View style={[styles.top, { paddingTop: height * 0.12 }, fadeStyle]}>
        <Image
          source={require("../../assets/images/abln-logo.png")}
          style={{ width: logoWidth, height: logoWidth * (773 / 2033) }}
          resizeMode="contain"
        />
        <View style={styles.divider} />
        <View style={styles.taglineRow}>
          <Text style={styles.tagline}>CONNECT</Text>
          <View style={styles.bar} />
          <Text style={styles.tagline}>COLLABORATE</Text>
          <View style={styles.bar} />
          <Text style={styles.tagline}>GROW</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.bottom, fadeStyle]}>
        <View style={styles.ringTrack}>
          <Animated.View style={[styles.ringArc, spinnerStyle]} />
        </View>
        <Text style={styles.loading}>Loading...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  bg: { position: "absolute", top: 0, left: 0 },
  top: { alignItems: "center" },
  divider: {
    width: 60,
    height: 1.5,
    backgroundColor: GOLD,
    marginTop: 18,
    marginBottom: 22,
  },
  taglineRow: { flexDirection: "row", alignItems: "center" },
  tagline: { color: Colors.white, fontFamily: Fonts.semiBold, fontSize: 12, letterSpacing: 1.5 },
  bar: { width: 1, height: 16, backgroundColor: GOLD, marginHorizontal: 14 },
  bottom: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  ringTrack: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: Colors.loadingTrack,
  },
  ringArc: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: GOLD,
    borderRightColor: GOLD,
  },
  loading: { color: Colors.white, fontFamily: Fonts.medium, fontSize: 16, marginTop: 16 },
});
