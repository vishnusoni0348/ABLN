export type Company = { name: string; sector: string; location: string; verified: boolean; owner: string; ownerRole: string };

// Posting company per opportunity id (sample data until the API is wired up).
export const COMPANIES: Record<string, Company> = {
  o1: { name: "TechVision Pvt Ltd", sector: "IT Services & Consulting", location: "Jaipur, Rajasthan, India", verified: true, owner: "Rahul Mehta", ownerRole: "Director, Business Development" },
  o2: { name: "NeuralWorks Technologies", sector: "Software & AI", location: "Bangalore, Karnataka, India", verified: false, owner: "Sneha Kapoor", ownerRole: "Founder & CEO" },
  o3: { name: "CogniScale Systems", sector: "Enterprise AI", location: "Bangalore, Karnataka, India", verified: true, owner: "Amit Verma", ownerRole: "VP, Partnerships" },
  o4: { name: "Rajputana Crafts Co.", sector: "Handicraft Manufacturing", location: "Jaipur, Rajasthan, India", verified: false, owner: "Priya Sharma", ownerRole: "Managing Partner" },
  o5: { name: "LearnLoop Education", sector: "EdTech", location: "Delhi, India", verified: true, owner: "Karan Malhotra", ownerRole: "Co-founder" },
  o6: { name: "GreenGrid Energy", sector: "Renewable Energy", location: "Pune, Maharashtra, India", verified: false, owner: "Vikram Joshi", ownerRole: "Head of Projects" },
  o7: { name: "InfraCare IT Solutions", sector: "Managed IT Services", location: "Chennai, Tamil Nadu, India", verified: false, owner: "Anita Raman", ownerRole: "Operations Director" },
  o9: { name: "SwiftCart Retail", sector: "E-commerce", location: "Mumbai, Maharashtra, India", verified: true, owner: "Neha Bansal", ownerRole: "Head of Logistics" },
  o8: { name: "Skyline Developers", sector: "Real Estate Development", location: "Mumbai, Maharashtra, India", verified: true, owner: "Rohan Desai", ownerRole: "Managing Director" },
};
