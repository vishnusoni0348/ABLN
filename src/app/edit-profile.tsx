import { Field, MultiSelect, Select, usePickImage } from "@/components/form-fields";
import { Avatar } from "@/components/member-ui";
import { DateBox, PhoneBox, PickBox, TextBox } from "@/components/profile-fields";
import { GoldButton, SegmentTabs, SettingsScreen } from "@/components/settings-ui";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { BUSINESS_TYPES, CAN_OFFER, CITIES, COUNTRIES, EMPLOYEE_RANGES, EXPERTISE, INDIAN_CITIES, INDUSTRIES, LOOKING_FOR, placeCountry, placeLabel, STATES, TURNOVER_RANGES } from "@/data/members";
import { DIAL_CODES, GENDERS, updateProfile, useSettings } from "@/lib/profile-store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Tab = "personal" | "business" | "expertise";
const TABS: { key: Tab; label: string; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { key: "personal", label: "Personal", icon: "person" },
  { key: "business", label: "Business", icon: "business" },
  { key: "expertise", label: "Expertise", icon: "ribbon" },
];

const ABOUT_MAX = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;
const withCurrent = (options: string[], current: string[]) => [...options, ...current.filter((c) => !options.includes(c))];

export default function EditProfile() {
  const { profile } = useSettings();
  const [tab, setTab] = useState<Tab>("personal");
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };
  const pickCover = usePickImage((uri) => set("cover", { uri }), [16, 9]);
  const pickPhoto = usePickImage((uri) => set("photo", { uri }));

  const save = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.city.trim()) next.city = "Location is required";
    if (!form.designation.trim()) next.designation = "Designation is required";
    if (!form.pocName.trim()) next.pocName = "Contact person name is required";
    if (!EMAIL_RE.test(form.pocEmail.trim())) next.pocEmail = "Enter a valid email address";
    if (form.pocMobile.replace(/\D/g, "").length < 10) next.pocMobile = "Enter a valid 10-digit mobile number";
    const offersProducts = form.canOffer.includes("Products");
    const offersServices = form.canOffer.includes("Services");
    if (offersProducts && form.productLink.trim() && !URL_RE.test(form.productLink.trim())) next.productLink = "Enter a valid link";
    if (offersServices && form.serviceLink.trim() && !URL_RE.test(form.serviceLink.trim())) next.serviceLink = "Enter a valid link";
    setErrors(next);
    if (Object.keys(next).length) {
      setTab(
        next.name || next.city
          ? "personal"
          : next.productLink || next.serviceLink
            ? "expertise"
            : "business",
      );
      return;
    }
    updateProfile({
      ...form,
      name: form.name.trim(),
      designation: form.designation.trim(),
      email: form.email.trim(),
      pocName: form.pocName.trim(),
      pocEmail: form.pocEmail.trim(),
      productLink: offersProducts ? form.productLink.trim() : "",
      serviceLink: offersServices ? form.serviceLink.trim() : "",
    });
    Alert.alert("Profile updated", "Your changes have been saved.", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SettingsScreen title="Edit Profile" footer={<GoldButton label="Save Changes" onPress={save} />}>
      <SegmentTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "personal" ? (
        <View>
          <View style={styles.coverWrap}>
            <Pressable onPress={pickCover} accessibilityRole="button" accessibilityLabel="Change cover photo" style={styles.cover}>
              <Image source={form.cover ?? require("../../assets/images/profile-banner.png")} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="right" />
              <View style={styles.coverLabel}>
                <Ionicons name="image-outline" size={14} color={Colors.navy} />
                <Text style={styles.coverText}>Change Cover Photo</Text>
              </View>
            </Pressable>
            <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Change profile photo" style={styles.avatarWrap}>
              <View style={styles.ring}>
                <Avatar name={form.name} photo={form.photo} size={92} />
              </View>
              <View style={styles.camera}>
                <Ionicons name="camera" size={14} color={Colors.white} />
              </View>
            </Pressable>
          </View>

          <View style={styles.sectionHead}>
            <View style={styles.sectionIcon}>
              <Ionicons name="person" size={20} color={Colors.goldDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <Text style={styles.sectionSub}>Update your personal details and contact information</Text>
            </View>
          </View>

          <TextBox label="Full Name" icon="person-outline" required value={form.name} onChangeText={(v) => set("name", v)} error={errors.name} autoCapitalize="words" />
          <DateBox label="Date of Birth" icon="gift-outline" value={form.dob} onChange={(v) => set("dob", v)} />
          <TextBox label="Email" icon="mail-outline" disabled value={form.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <PhoneBox label="Mobile Number" disabled dialCode={form.dialCode} dialCodes={DIAL_CODES} onDialCode={() => {}} value={form.mobile} onChangeText={() => {}} />
          <PickBox label="Gender" icon="person-circle-outline" placeholder="Select" value={form.gender} options={GENDERS} onChange={(v) => set("gender", v)} />
          <PickBox
            label="Location"
            icon="location-outline"
            required
            placeholder="Select location"
            value={form.city ? placeLabel(form.city) : ""}
            options={withCurrent(CITIES, [form.city].filter(Boolean))}
            render={placeLabel}
            onChange={(city) => {
              setForm((f) => ({ ...f, city, country: placeCountry(city) || f.country, region: placeLabel(city) }));
              setErrors((e) => ({ ...e, city: "" }));
            }}
            error={errors.city}
          />

          <Text style={styles.aboutLabel}>About Me</Text>
          <TextInput
            value={form.about}
            onChangeText={(v) => set("about", v.slice(0, ABOUT_MAX))}
            multiline
            textAlignVertical="top"
            placeholder="Tell members about yourself"
            placeholderTextColor={Colors.textMuted}
            style={styles.textarea}
          />
          <Text style={styles.count}>
            {form.about.length}/{ABOUT_MAX}
          </Text>
        </View>
      ) : null}

      {tab === "business" ? (
        <View>
          <Field label="Company Name" icon="business-outline" value={form.company} onChangeText={(v) => set("company", v)} />
          <Field label="Designation" icon="briefcase-outline" required value={form.designation} onChangeText={(v) => set("designation", v)} error={errors.designation} autoCapitalize="words" />
          <Select label="Industry" icon="layers-outline" placeholder="Select industry" value={form.industry} options={withCurrent(INDUSTRIES, [form.industry])} onChange={(v) => set("industry", v)} />
          <Select label="Business Type" icon="briefcase-outline" placeholder="Select business type" value={form.bizType} options={BUSINESS_TYPES} onChange={(v) => set("bizType", v)} />
          <Select label="Number of Employees" icon="people-outline" placeholder="Select employee range" value={form.employees} options={EMPLOYEE_RANGES} onChange={(v) => set("employees", v)} />
          <Select label="Annual Turnover" icon="cash-outline" placeholder="Select turnover range" value={form.turnover} options={TURNOVER_RANGES} onChange={(v) => set("turnover", v)} />
          <Field label="Website" icon="globe-outline" optional value={form.website} onChangeText={(v) => set("website", v)} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
          <Field label="Business Address" icon="location-outline" value={form.bizAddress} onChangeText={(v) => set("bizAddress", v)} />
          <Select label="State" icon="map-outline" placeholder="Select state" value={form.bizState} options={STATES} onChange={(v) => set("bizState", v)} />
          <Select label="City" icon="location-outline" placeholder="Select city" value={form.bizCity} options={INDIAN_CITIES} onChange={(v) => set("bizCity", v)} />

          <View style={styles.sectionHead}>
            <View style={styles.sectionIcon}>
              <Ionicons name="call" size={20} color={Colors.goldDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Point of Contact (POC)</Text>
              <Text style={styles.sectionSub}>Person members can reach for business enquiries</Text>
            </View>
          </View>
          <TextBox label="Contact Person Name" icon="person-outline" required value={form.pocName} onChangeText={(v) => set("pocName", v)} error={errors.pocName} autoCapitalize="words" />
          <TextBox label="Contact Email" icon="mail-outline" required value={form.pocEmail} onChangeText={(v) => set("pocEmail", v)} error={errors.pocEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <PhoneBox label="Contact Phone Number" required dialCode={form.pocDialCode} dialCodes={DIAL_CODES} onDialCode={(v) => set("pocDialCode", v)} value={form.pocMobile} onChangeText={(v) => set("pocMobile", v)} error={errors.pocMobile} />
        </View>
      ) : null}

      {tab === "expertise" ? (
        <View>
          <MultiSelect label="Expertise" icon="ribbon-outline" placeholder="Select expertise" allowOther values={form.expertise} options={withCurrent(EXPERTISE, form.expertise)} onChange={(v) => set("expertise", v)} />
          <MultiSelect label="Looking For" icon="search-outline" placeholder="What are you looking for?" allowOther values={form.lookingFor} options={withCurrent(LOOKING_FOR, form.lookingFor)} onChange={(v) => set("lookingFor", v)} />
          <MultiSelect label="Can Offer" icon="gift-outline" placeholder="What can you offer?" allowOther values={form.canOffer} options={withCurrent(CAN_OFFER, form.canOffer)} onChange={(v) => set("canOffer", v)} />
          {form.canOffer.includes("Products") ? (
            <Field label="Products Link" icon="link-outline" optional placeholder="https://yourcompany.com/products" value={form.productLink} onChangeText={(v) => set("productLink", v)} error={errors.productLink} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
          ) : null}
          {form.canOffer.includes("Services") ? (
            <Field label="Services Link" icon="link-outline" optional placeholder="https://yourcompany.com/services" value={form.serviceLink} onChangeText={(v) => set("serviceLink", v)} error={errors.serviceLink} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
          ) : null}
          <MultiSelect label="Countries" icon="earth-outline" placeholder="Countries you do business in" allowOther values={form.countries} options={withCurrent(COUNTRIES, form.countries)} onChange={(v) => set("countries", v)} />
        </View>
      ) : null}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  coverWrap: { marginBottom: 56 },
  cover: { height: 120, borderRadius: Radius.lg, overflow: "hidden", backgroundColor: "#FFF9EE", justifyContent: "flex-end", alignItems: "flex-end", padding: 10 },
  coverLabel: { flexDirection: "row", alignItems: "center", gap: 5, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: Colors.white },
  coverText: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 12 },
  avatarWrap: { position: "absolute", left: 16, bottom: -52 },
  ring: { padding: 4, borderRadius: 60, borderWidth: 2, borderColor: Colors.gold, backgroundColor: Colors.white },
  camera: { position: "absolute", right: 2, bottom: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.navy, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.white },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  sectionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FEF3DC", alignItems: "center", justifyContent: "center" },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 17 },
  sectionSub: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  aboutLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: 13, marginTop: 16, marginBottom: 8 },
  textarea: { minHeight: 110, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, padding: 14, color: Colors.navy, fontFamily: Fonts.regular, fontSize: 15 },
  count: { alignSelf: "flex-end", color: Colors.textMuted, fontFamily: Fonts.regular, fontSize: 11, marginTop: 4 },
});
