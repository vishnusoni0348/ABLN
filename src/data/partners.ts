// Sample partners until the partners API is wired up.
export const PARTNER_CATEGORIES = ["Hospitality", "Technology", "Banking & Finance", "Automobile", "Education", "Food & Beverage", "Real Estate", "Legal & Compliance", "Marketing", "Other"] as const;
export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export const OFFER_TYPES = ["Discount", "Free Service", "Special Pricing", "Exclusive Access"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export const PARTNER_TIERS = ["Founding Partner", "Premium Partner", "Regular Partner"] as const;
export type PartnerTier = (typeof PARTNER_TIERS)[number];

export const PARTNER_LOCATIONS = ["Pan India", "Jaipur", "Mumbai", "Delhi", "Bangalore"] as const;

export type Partner = {
  id: string;
  name: string;
  mark: string; // short monogram shown as the logo until real logos come from the API
  color: string; // brand colour for the monogram
  category: PartnerCategory;
  tags: string[];
  tier: PartnerTier;
  reach: string;
  website: string;
  featured?: boolean;
  nearby?: boolean;
  about: string;
  benefits: { title: string; note: string }[];
  locations: string[];
  terms: string[];
  offer: {
    type: OfferType;
    label: string; // short chip text, e.g. "Upto 20% OFF"
    headline: string;
    on: string;
    validTill: string; // ISO date
    appliesAt: string;
    appliesOn: string;
    howToAvail: string;
    code: string;
    additional: string[];
  };
};

const COMMON_TERMS = [
  "Offer is valid for active ABLN members only. Show your ABLN Membership ID at the time of booking or purchase.",
  "Offer cannot be combined with other promotions, coupons or corporate rates.",
  "Partner reserves the right to modify or withdraw the offer without prior notice.",
  "Subject to availability. Blackout dates may apply.",
];

export const PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "Taj Hotels",
    mark: "TAJ",
    color: "#B88618",
    category: "Hospitality",
    tags: ["Hospitality", "Travel"],
    tier: "Premium Partner",
    reach: "Pan India",
    website: "www.tajhotels.com",
    featured: true,
    nearby: true,
    about: "Taj Hotels is one of India's most prestigious hospitality brands, offering world-class experiences across luxury hotels and resorts.",
    benefits: [
      { title: "Upto 20% OFF", note: "on room bookings" },
      { title: "15% OFF", note: "on dining" },
      { title: "Complimentary room upgrade", note: "(subject to availability)" },
    ],
    locations: ["Pan India", "Jaipur", "Mumbai", "Delhi", "Bangalore"],
    terms: COMMON_TERMS,
    offer: {
      type: "Discount",
      label: "Upto 20% OFF",
      headline: "Upto 20% OFF",
      on: "on Room Bookings",
      validTill: "2026-12-31",
      appliesAt: "All Taj Hotels (Pan India)",
      appliesOn: "Room Bookings",
      howToAvail: "Show your ABLN Membership ID at booking or use the partner code.",
      code: "ABLNTAJ20",
      additional: ["15% OFF on dining", "Complimentary room upgrade (subject to availability)", "Early check-in / late check-out (subject to availability)"],
    },
  },
  {
    id: "p2",
    name: "ITC Hotels",
    mark: "ITC",
    color: "#8A1C1C",
    category: "Hospitality",
    tags: ["Hospitality", "Travel"],
    tier: "Premium Partner",
    reach: "Pan India",
    website: "www.itchotels.com",
    nearby: true,
    about: "ITC Hotels blends Indian heritage with responsible luxury across its portfolio of business and leisure hotels.",
    benefits: [
      { title: "15% OFF", note: "on room bookings" },
      { title: "10% OFF", note: "on banquets and meetings" },
    ],
    locations: ["Pan India", "Mumbai", "Delhi", "Bangalore"],
    terms: COMMON_TERMS,
    offer: {
      type: "Discount",
      label: "15% OFF",
      headline: "15% OFF",
      on: "on Room Bookings",
      validTill: "2026-12-31",
      appliesAt: "All ITC Hotels (Pan India)",
      appliesOn: "Room Bookings",
      howToAvail: "Book through the ITC Hotels member desk and quote your ABLN Membership ID.",
      code: "ABLN-ITC-2026",
      additional: ["10% OFF on banquets and meetings", "Welcome drink on arrival"],
    },
  },
  {
    id: "p3",
    name: "Marriott Hotels",
    mark: "M",
    color: "#B0232A",
    category: "Hospitality",
    tags: ["Hospitality", "Travel"],
    tier: "Regular Partner",
    reach: "Pan India",
    website: "www.marriott.com",
    featured: true,
    about: "Marriott Hotels offers a global network of upscale hotels with consistent service and loyalty benefits.",
    benefits: [
      { title: "Upto 20% OFF", note: "on room bookings" },
      { title: "Free breakfast", note: "on stays of 2 nights or more" },
    ],
    locations: ["Pan India", "Jaipur", "Mumbai", "Delhi"],
    terms: COMMON_TERMS,
    offer: {
      type: "Discount",
      label: "Upto 20% OFF",
      headline: "Upto 20% OFF",
      on: "on Room Bookings",
      validTill: "2026-11-30",
      appliesAt: "Participating Marriott Hotels",
      appliesOn: "Room Bookings",
      howToAvail: "Use the partner code on the Marriott booking page or at the front desk.",
      code: "ABLN-MAR-2026",
      additional: ["Free breakfast on stays of 2 nights or more", "Late check-out (subject to availability)"],
    },
  },
  {
    id: "p4",
    name: "Hyatt Hotels",
    mark: "HYATT",
    color: "#1F3A5F",
    category: "Hospitality",
    tags: ["Hospitality", "Travel"],
    tier: "Regular Partner",
    reach: "Pan India",
    website: "www.hyatt.com",
    about: "Hyatt Hotels offers thoughtful hospitality across business, leisure and wellness stays.",
    benefits: [
      { title: "10% OFF", note: "on room bookings" },
      { title: "Complimentary Wi-Fi", note: "during the stay" },
    ],
    locations: ["Pan India", "Delhi", "Bangalore"],
    terms: COMMON_TERMS,
    offer: {
      type: "Discount",
      label: "10% OFF",
      headline: "10% OFF",
      on: "on Room Bookings",
      validTill: "2026-12-15",
      appliesAt: "Participating Hyatt Hotels",
      appliesOn: "Room Bookings",
      howToAvail: "Share your ABLN Membership ID with the reservations team while booking.",
      code: "ABLN-HYT-2026",
      additional: ["Complimentary Wi-Fi during the stay", "Welcome amenity on arrival"],
    },
  },
  {
    id: "p5",
    name: "Dell Technologies",
    mark: "DELL",
    color: "#0076CE",
    category: "Technology",
    tags: ["Technology", "Hardware"],
    tier: "Founding Partner",
    reach: "Pan India",
    website: "www.dell.com",
    featured: true,
    nearby: true,
    about: "Dell Technologies provides laptops, servers and IT infrastructure for growing businesses.",
    benefits: [
      { title: "Upto 15% OFF", note: "on business laptops and desktops" },
      { title: "Free setup service", note: "on orders above ₹1,00,000" },
    ],
    locations: ["Pan India", "Jaipur", "Mumbai", "Delhi", "Bangalore"],
    terms: COMMON_TERMS,
    offer: {
      type: "Special Pricing",
      label: "Upto 15% OFF",
      headline: "Upto 15% OFF",
      on: "on Business Devices",
      validTill: "2027-03-31",
      appliesAt: "Dell Exclusive Stores and Online",
      appliesOn: "Laptops and Desktops",
      howToAvail: "Order through the Dell member portal using the partner code at checkout.",
      code: "ABLN-DELL-2026",
      additional: ["Free setup service on orders above ₹1,00,000", "Extended warranty at a special price"],
    },
  },
  {
    id: "p6",
    name: "Amazon Web Services",
    mark: "aws",
    color: "#FF9900",
    category: "Technology",
    tags: ["Technology", "Cloud"],
    tier: "Founding Partner",
    reach: "Global",
    website: "aws.amazon.com",
    featured: true,
    about: "AWS offers cloud computing, storage and AI services that help businesses scale securely.",
    benefits: [
      { title: "Upto 30% OFF", note: "on eligible cloud credits" },
      { title: "Free architecture review", note: "by an AWS solutions architect" },
    ],
    locations: ["Pan India", "Mumbai", "Bangalore"],
    terms: COMMON_TERMS,
    offer: {
      type: "Free Service",
      label: "Upto 30% OFF",
      headline: "Upto 30% OFF",
      on: "on Cloud Credits",
      validTill: "2027-01-31",
      appliesAt: "AWS India (Online)",
      appliesOn: "Eligible Cloud Services",
      howToAvail: "Request the member credit pack from the ABLN partner desk and redeem it in your AWS console.",
      code: "ABLN-AWS-2026",
      additional: ["Free architecture review", "Startup onboarding workshop"],
    },
  },
  {
    id: "p7",
    name: "Tata Motors",
    mark: "TATA",
    color: "#1D4ED8",
    category: "Automobile",
    tags: ["Automobile", "Fleet"],
    tier: "Premium Partner",
    reach: "Pan India",
    website: "www.tatamotors.com",
    nearby: true,
    about: "Tata Motors offers commercial and passenger vehicles with dedicated corporate fleet programmes.",
    benefits: [
      { title: "Upto 12% OFF", note: "on commercial vehicles" },
      { title: "Free first service", note: "on new purchases" },
    ],
    locations: ["Pan India", "Jaipur", "Delhi"],
    terms: COMMON_TERMS,
    offer: {
      type: "Special Pricing",
      label: "Upto 12% OFF",
      headline: "Upto 12% OFF",
      on: "on Commercial Vehicles",
      validTill: "2026-12-31",
      appliesAt: "Authorised Tata Motors Dealerships",
      appliesOn: "Commercial Vehicles",
      howToAvail: "Visit any authorised dealership and present your ABLN Membership ID.",
      code: "ABLN-TATA-2026",
      additional: ["Free first service on new purchases", "Priority delivery slots"],
    },
  },
  {
    id: "p8",
    name: "HDFC Bank",
    mark: "HDFC",
    color: "#004C8F",
    category: "Banking & Finance",
    tags: ["Banking & Finance", "Business Loans"],
    tier: "Regular Partner",
    reach: "Pan India",
    website: "www.hdfcbank.com",
    about: "HDFC Bank provides business banking, working capital and credit solutions for entrepreneurs.",
    benefits: [
      { title: "Upto 25% OFF", note: "on loan processing fees" },
      { title: "Dedicated relationship manager", note: "for ABLN members" },
    ],
    locations: ["Pan India", "Jaipur", "Mumbai", "Delhi", "Bangalore"],
    terms: COMMON_TERMS,
    offer: {
      type: "Exclusive Access",
      label: "Upto 25% OFF",
      headline: "Upto 25% OFF",
      on: "on Loan Processing Fees",
      validTill: "2027-03-31",
      appliesAt: "All HDFC Bank Branches",
      appliesOn: "Business Loans",
      howToAvail: "Mention the ABLN partnership to the relationship manager when applying.",
      code: "ABLN-HDFC-2026",
      additional: ["Dedicated relationship manager", "Zero-balance current account for 12 months"],
    },
  },
];

// Stand-in for the signed-in member until profile data is wired up.
export const MEMBERSHIP_ID = "ABLN256789";

export type PartnerFilters = { category: "All" | PartnerCategory; offerType: "All" | OfferType; tier: "All" | PartnerTier; location: string };
export const EMPTY_PARTNER_FILTERS: PartnerFilters = { category: "All", offerType: "All", tier: "All", location: "" };

export const activePartnerFilterCount = (f: PartnerFilters) => [f.category !== "All", f.offerType !== "All", f.tier !== "All", f.location !== ""].filter(Boolean).length;

export type PartnerTab = "All" | "Featured" | "Nearby";

export function searchPartners(query: string, f: PartnerFilters, tab: PartnerTab = "All") {
  const q = query.trim().toLowerCase();
  return PARTNERS.filter(
    (p) =>
      (!q || [p.name, p.category, p.offer.label, ...p.tags].join(" ").toLowerCase().includes(q)) &&
      (f.category === "All" || p.category === f.category) &&
      (f.offerType === "All" || p.offer.type === f.offerType) &&
      (f.tier === "All" || p.tier === f.tier) &&
      (!f.location || p.locations.includes(f.location)) &&
      (tab === "All" || (tab === "Featured" ? p.featured : p.nearby)),
  );
}

export function formatValidTill(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

// Offers stay valid through the end of their `validTill` day.
export const isOfferExpired = (p: Partner) => new Date(`${p.offer.validTill}T23:59:59`).getTime() < Date.now();
