// Sample profile-view log until the analytics API is wired up.
export type ProfileViewer = {
  id: string;
  name: string;
  role: string;
  company: string;
  ago: string;
  member: boolean;
};

export const PROFILE_VIEWS: ProfileViewer[] = [
  { id: "1", name: "Amit Gupta", role: "CEO & Co-Founder", company: "Gupta Industries", ago: "2h ago", member: true },
  { id: "2", name: "Neha Agarwal", role: "Business Head", company: "Agarwal Exports", ago: "5h ago", member: true },
  { id: "3", name: "Rohit Bansal", role: "Director", company: "Bansal Group", ago: "1d ago", member: false },
  { id: "4", name: "Pooja Sharma", role: "Founder", company: "Sharma Tech Solutions", ago: "2d ago", member: true },
  { id: "5", name: "Vikram Jalan", role: "Managing Director", company: "Jalan Enterprises", ago: "3d ago", member: true },
  { id: "6", name: "Ritika Singhal", role: "Head - Marketing", company: "Singhal Global", ago: "4d ago", member: false },
];

// Totals for the last 30 days; the list above is only the most recent page.
export const PROFILE_VIEW_TOTALS = { all: 6, members: 4, nonMembers: 2 };
