import { useSettings } from "@/lib/profile-store";
import { inviteLink, referralCode } from "@/lib/referral-store";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Share } from "react-native";

/** The member's referral code, link and the message shared with invitees. */
export function useInviteInfo() {
  const { profile } = useSettings();
  const code = referralCode(profile.name, profile.memberId);
  const link = inviteLink(code);
  const url = `https://${link}`;
  const message = `Join me on ABLN – Agarwal Business Leaders Network. Sign up with my invite: ${url} (referral code: ${code})`;
  return { code, link, url, message };
}

async function open(url: string, failure: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Couldn't open", failure);
  }
}

/** `phone` is optional; without it WhatsApp lets the member pick the recipient. */
export const shareWhatsApp = (message: string, phone?: string) =>
  open(`https://wa.me/${phone?.replace(/\D/g, "") ?? ""}?text=${encodeURIComponent(message)}`, "WhatsApp isn't available on this device.");

export const shareEmail = (message: string) =>
  open(`mailto:?subject=${encodeURIComponent("Join me on ABLN")}&body=${encodeURIComponent(message)}`, "No email app is set up on this device.");

export async function shareMore(message: string) {
  try {
    await Share.share({ message });
  } catch {
    Alert.alert("Couldn't share", "Please try again.");
  }
}

/** Copies text and reports which item was copied for ~2s, so buttons can flash a checkmark. */
export function useCopied<K extends string>() {
  const [copied, setCopied] = useState<K | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async (key: K, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}
