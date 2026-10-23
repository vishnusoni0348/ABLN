import { StatusView } from "@/components/status-ui";
import { useNetworkState } from "expo-network";
import { ReactNode, useState } from "react";

/** Shows the offline screen whenever the device loses its connection; "Try Again" re-checks. */
export function OfflineGate({ children }: { children: ReactNode }) {
  const net = useNetworkState();
  const [dismissed, setDismissed] = useState(false);
  // Fields are undefined until the first reading arrives, so only block on an explicit `false`.
  const offline = net.isConnected === false || net.isInternetReachable === false;

  if (offline && !dismissed) {
    return (
      <StatusView
        icon="cloud-offline-outline"
        title="You're Offline"
        text={"Check your internet connection\nand try again."}
        outlined={{ label: "Try Again", icon: "refresh", onPress: () => setDismissed(true) }}
        note="Some features may be unavailable."
      />
    );
  }
  // Re-arm once the connection returns so a later drop shows the screen again.
  if (!offline && dismissed) setDismissed(false);
  return <>{children}</>;
}
