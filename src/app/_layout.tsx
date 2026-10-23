import { Stack, router, usePathname, type ErrorBoundaryProps } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { OfflineGate } from "@/components/offline-gate";
import { StatusView } from "@/components/status-ui";
import { Colors } from "@/constants/theme";

function ScreenErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <StatusView
      icon="warning"
      iconColor={Colors.gold}
      title="Something went wrong"
      text={"We couldn't complete your request.\nPlease try again."}
      primary={{ label: "Retry", icon: "refresh", onPress: retry }}
      link={{
        label: "Go to Home",
        onPress: () => {
          retry();
          router.replace("/home");
        },
      }}
    />
  );
}

export const unstable_settings = { screenErrorBoundary: ScreenErrorBoundary };
export { ScreenErrorBoundary as ErrorBoundary };

export default function RootLayout() {
  const [loaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  if (!loaded) return null;

  // Full-bleed screens (splash/welcome, event hero) keep a transparent status bar.
  const FULL_BLEED = ["/event-details", "/partner-details", "/adviser-intro", "/app-tour"];
  const showStatusBarBg = pathname !== "/" && pathname !== "/welcome" && !FULL_BLEED.some((p) => pathname.startsWith(p));

  return (
    <OfflineGate>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
      {showStatusBarBg && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: Colors.background,
          }}
        />
      )}
      {/* Solid white behind the gesture navigation bar so it looks the same on every screen. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: Colors.white,
        }}
      />
    </OfflineGate>
  );
}
