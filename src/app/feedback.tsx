import { GoldButton, OutlineBtn, SettingsScreen, SuccessDialog } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { FEEDBACK_CATEGORIES, FEEDBACK_MAX, FeedbackCategory, submitFeedback } from "@/lib/feedback-store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const STORE_LABEL = Platform.OS === "android" ? "Rate us on Google Play" : "Rate us on the App Store";
const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// TODO: replace with the published store listing ids once the app is live.
const STORE_URL = Platform.OS === "android" ? "market://details?id=in.abln.app" : "itms-apps://apps.apple.com/app/id0000000000";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>("experience");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (rating === 0) return Alert.alert("Rate your experience", "Tap a star to tell us how ABLN is working for you.");
    submitFeedback({ rating, category, comment: comment.trim() });
    setDone(true);
  };

  const rate = async () => {
    try {
      await Linking.openURL(STORE_URL);
    } catch {
      Alert.alert("Couldn't open the store", "Please try again later.");
    }
  };

  return (
    <SettingsScreen title="Feedback">
      <Image source={require("../../assets/images/feedback-hero.png")} style={styles.hero} contentFit="contain" accessibilityLabel="Five star rating" />
      <View style={styles.titleBlock}>
        <Text style={styles.title}>How is your ABLN experience?</Text>
        <Text style={styles.sub}>Your feedback helps us improve and deliver a better experience.</Text>
      </View>

      <View style={styles.rateBlock}>
        <Text style={styles.tap}>{rating ? RATING_WORDS[rating] : "Tap to rate"}</Text>
        <View style={styles.stars} accessibilityRole="adjustable" accessibilityLabel="Rating" accessibilityValue={{ min: 0, max: 5, now: rating }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`}>
              <Ionicons name={n <= rating ? "star" : "star-outline"} size={40} color={n <= rating ? Colors.gold : "#D9C28A"} />
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.q}>What best describes your feedback?</Text>
      <View style={styles.chips}>
        {FEEDBACK_CATEGORIES.map((c) => {
          const on = c.key === category;
          return (
            <Pressable key={c.key} onPress={() => setCategory(c.key)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[styles.chip, on && styles.chipOn]}>
              <Ionicons name={c.icon} size={17} color={on ? Colors.goldDark : Colors.navy} />
              <Text style={[styles.chipText, on && { color: Colors.navy }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.q}>
        Additional Feedback <Text style={styles.optional}>(Optional)</Text>
      </Text>
      <View style={styles.inputBox}>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Tell us what you think about ABLN..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={FEEDBACK_MAX}
          textAlignVertical="top"
          style={styles.input}
          accessibilityLabel="Additional feedback"
        />
        <Text style={styles.count}>
          {comment.length}/{FEEDBACK_MAX}
        </Text>
      </View>

      <GoldButton label="Submit Feedback" onPress={submit} />
      <OutlineBtn label={STORE_LABEL} icon={Platform.OS === "android" ? "logo-google-playstore" : "logo-apple"} onPress={rate} />

      <SuccessDialog visible={done} title="Thank you!" message="Your feedback has been submitted. We appreciate you helping us improve ABLN." onAction={() => router.back()} />
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", height: 190 },
  titleBlock: { alignItems: "center", gap: 6, paddingHorizontal: 8 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 22, textAlign: "center" },
  sub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, textAlign: "center" },
  rateBlock: { alignItems: "center", gap: 10 },
  tap: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: 14 },
  stars: { flexDirection: "row", gap: 10 },
  q: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginTop: 4 },
  optional: { fontFamily: Fonts.regular, color: Colors.textSecondary },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, height: 44, borderRadius: Radius.md, backgroundColor: "#EEF2FA", borderWidth: 1, borderColor: "transparent" },
  chipOn: { backgroundColor: "#FEF6E6", borderColor: Colors.gold },
  chipText: { color: Colors.textSecondary, fontFamily: Fonts.semiBold, fontSize: 13 },
  inputBox: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 12 },
  input: { minHeight: 90, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 14, padding: 0 },
  count: { alignSelf: "flex-end", color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 6 },
});
