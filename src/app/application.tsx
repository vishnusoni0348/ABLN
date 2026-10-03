import { Field, MultiSelect, Select, UploadCard, usePickImage, Label } from "@/components/form-fields";
import { Stepper } from "@/components/stepper";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Indore"];
const STATES = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal", "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Haryana", "Punjab"];
const INDUSTRIES = ["Manufacturing", "Retail & Wholesale", "Real Estate", "Finance & Banking", "IT & Software", "Healthcare", "Education", "Hospitality", "Textiles", "Logistics", "Agriculture", "Other"];
const BUSINESS_TYPES = ["Proprietorship", "Partnership", "Private Limited", "Public Limited", "LLP", "Other"];
const TARGET_CUSTOMERS = ["Individuals", "Small Businesses", "Enterprises", "Government", "Exporters", "Retailers", "Distributors"];
const HIGHLIGHTS = ["Award Winning", "ISO Certified", "10+ Years in Business", "Pan-India Presence", "Export Quality", "Unique USP"];
const PRODUCT_OPTIONS = ["Products", "Services", "Consulting", "Software", "Wholesale Supply", "Manufacturing", "Distribution", "Installation & Support"];

const STEP_TITLES = [
  { title: "Let’s Get to Know You", sub: "Tell us a few basic details to create\nyour ABLN profile." },
  { title: "Tell Us About Your Business", sub: "Help us understand your business better\nso we can connect you with the right opportunities." },
  { title: "Create Your Business Profile", sub: "Showcase your business to ABLN members\nand get discovered by the right people." },
  { title: "Profile Visibility", sub: "Control who can see your profile on ABLN.\nYou can change this anytime from settings." },
  { title: "Review Your Application", sub: "Please review your information\nbefore submitting." },
];
const REVIEW_STEP = 4;
// Design mode: set to false to turn form validation back on.
const SKIP_VALIDATION = true;

type Visibility = "public" | "members" | "private";
const VISIBILITY: { key: Visibility; icon: IconName; title: string; desc: string }[] = [
  { key: "public", icon: "globe-outline", title: "Public", desc: "Your profile will be visible to all ABLN members. Get more visibility and connect with the right people." },
  { key: "members", icon: "people", title: "Members Only", desc: "Your profile will only be visible to logged-in ABLN members." },
  { key: "private", icon: "lock-closed", title: "Private", desc: "Your profile will be hidden from other members. You can still use ABLN to explore opportunities." },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Application() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.62, 260);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  // Step 2
  const [bizName, setBizName] = useState("");
  const [industry, setIndustry] = useState("");
  const [bizType, setBizType] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [bizState, setBizState] = useState("");
  const [bizCity, setBizCity] = useState("");
  // Step 3
  const [logo, setLogo] = useState<string>();
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  // Step 4
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [allowRequests, setAllowRequests] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  const pickPhoto = usePickImage(setPhoto);
  const pickLogo = usePickImage(setLogo);

  const validate = () => {
    if (SKIP_VALIDATION) return true;
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!name.trim()) e.name = "Please enter your full name";
      if (!/^\d{10}$/.test(mobile)) e.mobile = "Enter a valid 10-digit mobile number";
      if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address";
      if (!city) e.city = "Please select your city";
    } else if (step === 1) {
      if (!bizName.trim()) e.bizName = "Please enter your business name";
      if (!industry) e.industry = "Please select an industry";
      if (!bizType) e.bizType = "Please select a business type";
      if (!address.trim()) e.address = "Please enter your business address";
      if (!bizState) e.bizState = "Please select a state";
      if (!bizCity) e.bizCity = "Please select a city";
    } else if (step === 2) {
      if (!description.trim()) e.description = "Please describe your business";
      if (!products.length) e.products = "Add at least one product or service";
      if (!targets.length) e.targets = "Select at least one target customer";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step === REVIEW_STEP) {
      if (!SKIP_VALIDATION && !confirmed) {
        setErrors({ confirm: "Please confirm that the information is accurate" });
        return;
      }
      router.replace("/application-submitted");
    } else if (editing) {
      setEditing(false);
      setStep(REVIEW_STEP);
    } else {
      setStep(step + 1);
    }
  };

  const edit = (i: number) => {
    setErrors({});
    setEditing(true);
    setStep(i);
  };

  const back = () => {
    if (editing) {
      setEditing(false);
      setErrors({});
      setStep(REVIEW_STEP);
    } else if (step > 0) {
      setErrors({});
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={
          step === REVIEW_STEP
            ? require("../../assets/images/white-bg.png")
            : require("../../assets/images/application-bg.png")
        }
        style={[styles.bg, { width, height }]}
        resizeMode="cover"
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={back} hitSlop={12} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={Colors.navy} />
          </Pressable>

          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/abln-logo.png")}
              style={{ width: logoWidth, height: logoWidth * (773 / 2033) }}
              resizeMode="contain"
            />
            <View style={styles.divider} />
          </View>

          {step === REVIEW_STEP ? (
            <View style={styles.progress}>
              <View style={styles.progressFill} />
            </View>
          ) : (
            <Stepper current={step} />
          )}

          <Text style={styles.title}>{STEP_TITLES[step].title}</Text>
          <Text style={styles.subtitle}>{STEP_TITLES[step].sub}</Text>

          {step === 0 && (
            <>
              <Field
                label="Full Name"
                icon="person-outline"
                required
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                error={errors.name}
              />
              <View style={styles.group}>
                <Label text="Profile Photo" />
                <UploadCard
                  uri={photo}
                  onPick={pickPhoto}
                  title="Upload a clear profile photo"
                  lines={["This will be visible to ABLN members.", "JPG, PNG (Max 2MB)"]}
                  circle={
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={52} color="#B6BFCC" style={styles.avatarIcon} />
                    </View>
                  }
                />
                <View style={styles.camBadge} pointerEvents="none">
                  <Ionicons name="camera-outline" size={18} color={Colors.white} />
                </View>
              </View>
              <Field
                label="Mobile Number"
                icon="call-outline"
                required
                prefix="+91"
                placeholder="Enter your mobile number"
                value={mobile}
                onChangeText={(t) => setMobile(t.replace(/\D/g, "").slice(0, 10))}
                keyboardType="number-pad"
                error={errors.mobile}
              />
              <Field
                label="Email Address"
                icon="mail-outline"
                required
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
              />
              <Select
                label="City"
                icon="location-outline"
                required
                placeholder="Select your city"
                value={city}
                options={CITIES}
                onChange={setCity}
                error={errors.city}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Field
                label="Business Name"
                icon="business-outline"
                required
                placeholder="Enter your business name"
                value={bizName}
                onChangeText={setBizName}
                autoCapitalize="words"
                error={errors.bizName}
              />
              <Select
                label="Industry / Business Category"
                icon="grid-outline"
                required
                placeholder="Select your industry"
                value={industry}
                options={INDUSTRIES}
                onChange={setIndustry}
                error={errors.industry}
              />
              <Select
                label="Business Type"
                icon="briefcase-outline"
                required
                placeholder="Select business type"
                value={bizType}
                options={BUSINESS_TYPES}
                onChange={setBizType}
                error={errors.bizType}
              />
              <Field
                label="Business Website"
                icon="link-outline"
                placeholder="https://www.yourwebsite.com (Optional)"
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Field
                label="Business Address"
                icon="location-outline"
                required
                placeholder="Enter your business address"
                value={address}
                onChangeText={setAddress}
                error={errors.address}
              />
              <Select
                label="State"
                icon="map-outline"
                required
                placeholder="Select state"
                value={bizState}
                options={STATES}
                onChange={setBizState}
                error={errors.bizState}
              />
              <Select
                label="City"
                icon="location-outline"
                required
                placeholder="Select city"
                value={bizCity}
                options={CITIES}
                onChange={setBizCity}
                error={errors.bizCity}
              />
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.group}>
                <Label text="Business Logo" />
                <UploadCard
                  uri={logo}
                  onPick={pickLogo}
                  title="Upload your company logo"
                  lines={["Recommended size: 300 x 300 px", "JPG, PNG (Max 2MB)"]}
                  circle={
                    <View style={styles.logoUpload}>
                      <Ionicons name="cloud-upload-outline" size={34} color={Colors.navy} />
                      <Text style={styles.logoUploadText}>Upload Logo</Text>
                    </View>
                  }
                />
              </View>
              <View style={styles.group}>
                <Label text="Business Description" required />
                <View style={[styles.textArea, !!errors.description && styles.boxError]}>
                  <Ionicons name="document-text-outline" size={22} color={Colors.navy} />
                  <TextInput
                    style={styles.textAreaInput}
                    placeholder="Tell us about your business, products or services..."
                    placeholderTextColor={Colors.textMuted}
                    value={description}
                    onChangeText={(t) => setDescription(t.slice(0, 500))}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <View style={styles.counterRow}>
                  <Text style={styles.error}>{errors.description}</Text>
                  <Text style={styles.counter}>{description.length}/500</Text>
                </View>
              </View>
              <MultiSelect
                label="Products / Services"
                icon="pricetag-outline"
                required
                placeholder="Add products or services"
                values={products}
                options={PRODUCT_OPTIONS}
                onChange={setProducts}
                error={errors.products}
              />
              <MultiSelect
                label="Target Customers"
                icon="people-outline"
                required
                placeholder="Select target customers"
                values={targets}
                options={TARGET_CUSTOMERS}
                onChange={setTargets}
                error={errors.targets}
              />
              <MultiSelect
                label="Business Highlights"
                optional
                icon="star-outline"
                placeholder="Add key highlights (e.g. awards, achievements, USP)"
                values={highlights}
                options={HIGHLIGHTS}
                onChange={setHighlights}
              />
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.visList}>
                {VISIBILITY.map((v) => {
                  const on = visibility === v.key;
                  return (
                    <Pressable
                      key={v.key}
                      onPress={() => setVisibility(v.key)}
                      style={[styles.visCard, on && styles.visCardOn]}
                    >
                      <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                      <View style={styles.visIcon}>
                        <Ionicons name={v.icon} size={26} color={Colors.navy} />
                      </View>
                      <View style={styles.flex}>
                        <View style={styles.visTitleRow}>
                          <Text style={styles.visTitle}>{v.title}</Text>
                          {v.key === "public" ? (
                            <View style={styles.recommended}>
                              <Text style={styles.recommendedText}>Recommended</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.visDesc}>{v.desc}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { marginTop: 24 }]}>Allow others to</Text>
              {(
                [
                  ["chatbubble-ellipses-outline", "Send you connection requests", allowRequests, setAllowRequests],
                  ["mail-outline", "Send you messages", allowMessages, setAllowMessages],
                ] as const
              ).map(([icon, text, value, set]) => (
                <View key={text} style={styles.toggleRow}>
                  <Ionicons name={icon} size={22} color={Colors.navy} />
                  <Text style={styles.toggleText}>{text}</Text>
                  <Switch
                    value={value}
                    onValueChange={set}
                    trackColor={{ true: Colors.gold, false: Colors.border }}
                    thumbColor={Colors.white}
                  />
                </View>
              ))}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={26} color="#1A6FE0" />
                <View style={styles.flex}>
                  <Text style={styles.infoTitle}>You can update your visibility anytime</Text>
                  <Text style={styles.infoDesc}>Go to Settings &gt; Profile Visibility to change these preferences later.</Text>
                </View>
              </View>
            </>
          )}

          {step === REVIEW_STEP && (
            <>
              <View style={styles.reviewList}>
                {(
                  [
                    ["Personal Details", [name, city].filter(Boolean).join(", "), 0],
                    ["Business Details", [bizName, bizType].filter(Boolean).join(", "), 1],
                    ["Business Profile", products.join(", "), 2],
                    ["Profile Visibility", VISIBILITY.find((v) => v.key === visibility)?.title ?? "", 3],
                  ] as const
                ).map(([title, value, target]) => (
                  <View key={title} style={styles.reviewRow}>
                    <View style={styles.flex}>
                      <Text style={styles.reviewTitle}>{title}</Text>
                      <Text style={styles.reviewValue} numberOfLines={2}>
                        {value}
                      </Text>
                    </View>
                    <Pressable onPress={() => edit(target)} hitSlop={10}>
                      <Text style={styles.editLink}>Edit</Text>
                    </Pressable>
                  </View>
                ))}
              </View>

              <Pressable
                style={styles.confirmRow}
                onPress={() => {
                  setConfirmed(!confirmed);
                  setErrors({});
                }}
              >
                <View style={[styles.checkbox, confirmed && styles.checkboxOn]}>
                  {confirmed ? <Ionicons name="checkmark" size={16} color={Colors.white} /> : null}
                </View>
                <Text style={styles.confirmText}>I confirm that all information provided is accurate and complete.</Text>
              </Pressable>
              {errors.confirm ? <Text style={styles.error}>{errors.confirm}</Text> : null}
            </>
          )}

          <Pressable onPress={next} style={({ pressed }) => [styles.btnWrap, pressed && styles.pressed]}>
            <LinearGradient
              colors={[Colors.goldLight, Colors.champagne, Colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryText}>{step === REVIEW_STEP ? "Submit Application" : editing ? "Save & Return" : step === 3 ? "Complete & Create Profile" : "Continue"}</Text>
              <Ionicons name="arrow-forward" size={24} color={Colors.navy} style={styles.arrow} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  bg: { position: "absolute", top: 0, left: 0 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  back: { paddingVertical: 8, alignSelf: "flex-start" },
  logoWrap: { alignItems: "center" },
  divider: { width: 50, height: 1.5, backgroundColor: Colors.gold, marginTop: 10 },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
    marginTop: 28,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  group: { marginTop: 16 },
  label: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15, marginBottom: 8 },
  error: { color: Colors.error, fontFamily: Fonts.regular, fontSize: 12, marginTop: 4 },
  boxError: { borderColor: Colors.error },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E6EAF0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarIcon: { marginBottom: -6 },
  camBadge: {
    position: "absolute",
    left: 64,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  logoUpload: { alignItems: "center", gap: 2 },
  logoUploadText: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: 11 },

  textArea: {
    minHeight: 110,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  textAreaInput: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 16, minHeight: 78, padding: 0 },
  counterRow: { flexDirection: "row", justifyContent: "space-between" },
  counter: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 4 },

  visList: { marginTop: 20, gap: 12 },
  visCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  visCardOn: { borderColor: Colors.champagne, backgroundColor: "#FDF4E0" },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: Colors.gold },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.gold },
  visIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FBF1DE",
    alignItems: "center",
    justifyContent: "center",
  },
  visTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  visTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  visDesc: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, marginTop: 2 },
  recommended: { backgroundColor: "#E3F5EB", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  recommendedText: { color: Colors.success, fontFamily: Fonts.medium, fontSize: 12 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  toggleText: { flex: 1, color: Colors.navy, fontFamily: Fonts.medium, fontSize: 16 },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    marginTop: 8,
    borderRadius: Radius.md,
    backgroundColor: "#E9F0FA",
  },
  infoTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 15 },
  infoDesc: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, marginTop: 2 },

  progress: { height: 4, borderRadius: 2, backgroundColor: Colors.border, marginTop: 20, overflow: "hidden" },
  progressFill: { width: "100%", height: "100%", backgroundColor: Colors.gold },
  reviewList: { marginTop: 20, gap: 12 },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  reviewTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 16 },
  reviewValue: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, marginTop: 2 },
  editLink: { color: "#1A6FE0", fontFamily: Fonts.semiBold, fontSize: 16 },
  confirmRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: "#1A6FE0", borderColor: "#1A6FE0" },
  confirmText: { flex: 1, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 21 },
  btnWrap: { marginTop: 28 },
  primaryBtn: {
    height: 58,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 20 },
  arrow: { position: "absolute", right: 22 },
  pressed: { opacity: 0.85 },
});
