export const GUEST_OPTIONS = [
  { key: "adults", label: "Adults", sub: "Ages 13+", min: 1 },
  { key: "children", label: "Children", sub: "Ages 2–12", min: 0 },
  { key: "infants", label: "Infants", sub: "Under 2", min: 0 },
] as const;

export type GuestType = typeof GUEST_OPTIONS[number]["key"];

export const POPULAR_LOCATIONS = [
  { 
    name: "Cox’s Bazar", 
    image: "https://images.unsplash.com/photo-1590001158193-790130ae8f2a?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Dhaka", 
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Sajek", 
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Sylhet", 
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Bandarban", 
    image: "https://images.unsplash.com/photo-1623944889288-cd147dbb517c?q=80&w=300&auto=format&fit=crop" 
  },
] as const;

import { ListingWithStats } from "./types/database";

export const FEATURED_LISTINGS: Partial<ListingWithStats>[] = [
  {
    id: "bd-1",
    slug: "bd-1",
    title: "Cox's Bazar Sea View Apartment",
    location: "Kolatoli Beach, Cox's Bazar",
    city: "Cox's Bazar",
    country: "Bangladesh",
    price: 4500,
    avg_rating: 4.9,
    review_count: 124,
    type: "apartment",
    beds: 3,
    baths: 2,
    max_guests: 6,
    images: ["https://images.unsplash.com/photo-1590603732440-236ca969c364?w=800"],
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Sea View"],
    description: "Experience the ultimate sea view from this premium apartment in Kolatoli Beach. Perfectly suited for families and groups looking for a luxury stay near the world's longest natural sea beach.",
    host_name: "Restiqa Team",
    host_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Restiqa",
  },
  {
    id: "bd-2",
    slug: "bd-2",
    title: "Sajek Valley Eco Resort",
    location: "Ruilui Para, Sajek",
    city: "Sajek",
    country: "Bangladesh",
    price: 3200,
    avg_rating: 4.8,
    review_count: 89,
    type: "cottage",
    beds: 2,
    baths: 1,
    max_guests: 4,
    images: ["https://images.unsplash.com/photo-1594738504031-74488182b133?w=800"],
    amenities: ["WiFi", "Hill View", "Breakfast Included"],
    description: "Stay among the clouds in our beautiful eco-resort at Sajek Valley. Wake up to the mesmerizing view of the hills and enjoy the serene atmosphere of nature.",
    host_name: "Hill Guide",
    host_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sajek",
  },
  {
    id: "bd-3",
    slug: "bd-3",
    title: "Dhaka Luxury Suite (Gulshan)",
    location: "Gulshan 2, Dhaka",
    city: "Dhaka",
    country: "Bangladesh",
    price: 8500,
    avg_rating: 5.0,
    review_count: 242,
    type: "apartment",
    beds: 2,
    baths: 2,
    max_guests: 4,
    images: ["https://images.unsplash.com/photo-1518173946687-a4c8a07d7e02?w=800"],
    amenities: ["WiFi", "Gym", "Parking", "City View"],
    description: "Premium luxury suite in the heart of Gulshan. Perfect for business travelers and those looking for the highest standard of living in Dhaka city.",
    host_name: "Corporate Stays",
    host_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhaka",
  },
  {
    id: "bd-4",
    slug: "bd-4",
    title: "Sylhet Tea Garden Cottage",
    location: "Srimangal, Sylhet",
    city: "Sylhet",
    country: "Bangladesh",
    price: 2500,
    avg_rating: 4.7,
    review_count: 67,
    type: "cottage",
    beds: 1,
    baths: 1,
    max_guests: 2,
    images: ["https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800"],
    amenities: ["WiFi", "Garden View", "Private Entry"],
    description: "Charming cottage surrounded by lush tea gardens. A perfect getaway for couples looking for peace and tranquility in the tea capital of Bangladesh.",
    host_name: "Green Host",
    host_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sylhet",
  },
];
