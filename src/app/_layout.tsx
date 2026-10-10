import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Colors } from "@/constants/theme";

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
  const showStatusBarBg = pathname !== "/" && pathname !== "/welcome" && !pathname.startsWith("/event-details") && !pathname.startsWith("/partner-details");

  return (
    <>
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
    </>
  );
}
