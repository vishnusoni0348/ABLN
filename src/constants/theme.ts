export const Colors = {
  // Brand
  navy: "#061B33",
  deepNavy: "#031225",
  royalNavy: "#0B2A4A",

  // Gold
  gold: "#D4A72C",
  goldDark: "#B88618",
  goldLight: "#F4D27A",
  champagne: "#E8C66A",

  // Neutral
  white: "#FFFFFF",
  softWhite: "#F5F7FA",
  background: "#F8FAFC",
  textPrimary: "#061B33",
  textSecondary: "#64748B",
  textMuted: "#AAB6C5",

  // UI
  border: "#D9E0E8",
  loadingTrack: "#253B52",
  success: "#22A06B",
  error: "#D64545",
  overlay: "rgba(3, 18, 37, 0.55)",
} as const;

export const Gradients = {
  primary: [Colors.deepNavy, Colors.navy, Colors.royalNavy],
  gold: [Colors.goldDark, Colors.gold, Colors.goldLight],
} as const;

export const Radius = { sm: 8, md: 12, lg: 18, xl: 24 } as const;

export const Fonts = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
} as const;

export const Typography = {
  heading: { fontFamily: Fonts.bold, fontSize: 32, lineHeight: 37 },
  section: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 29 },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  featureTitle: { fontFamily: Fonts.bold, fontSize: 16 },
  featureDesc: { fontFamily: Fonts.regular, fontSize: 14 },
  button: { fontFamily: Fonts.bold, fontSize: 16 },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
} as const;
