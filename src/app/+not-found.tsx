import { StatusView } from "@/components/status-ui";
import { router } from "expo-router";

export default function NotFound() {
  return (
    <StatusView
      icon="search"
      badge="404"
      title="Page not found"
      text={"The page you're looking for may\nhave moved or no longer exists."}
      primary={{ label: "Back to Home", icon: "home", onPress: () => router.replace("/home") }}
    />
  );
}
