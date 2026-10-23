import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { Provider } from "./profile-store";

export const PROVIDERS: Record<Provider, { label: string; icon: ComponentProps<typeof Ionicons>["name"]; color: string; bg: string }> = {
  google: { label: "Google", icon: "logo-google", color: "#DB4437", bg: "#FDECEA" },
  linkedin: { label: "LinkedIn", icon: "logo-linkedin", color: "#FFFFFF", bg: "#0A66C2" },
};
