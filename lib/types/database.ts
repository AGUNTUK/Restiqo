export type UserRole = "guest" | "host" | "admin";
export type ListingType = "apartment" | "villa" | "studio" | "penthouse" | "house" | "cabin" | "cottage";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  type: ListingType;
  beds: number;
  baths: number;
  max_guests: number;
  amenities: string[];
  is_available: boolean;
  host_id: string;
  created_at: string;
  updated_at: string;
}

export interface ListingWithStats extends Listing {
  host_name: string | null;
  host_avatar: string | null;
  avg_rating: number;
  review_count: number;
}

export interface Booking {
  id: string;
  user_id: string;
  listing_id: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  guests_count: number;
  total_price: number;
  total_amount: number;
  commission_amount: number;
  host_earnings: number;
  payment_status: "pending" | "paid";
  payout_status: "pending" | "released";
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  type: "payment" | "payout" | "commission";
  status: string;
  created_at: string;
}

export interface Payout {
  id: string;
  host_id: string;
  amount: number;
  status: "pending" | "processing" | "completed";
  method: "bkash" | "nagad" | "bank";
  created_at: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user_id: string;
  listing_id: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutMethod {
  id: string;
  host_id: string;
  provider: "bKash" | "Nagad" | "Bank";
  account_details: string;
  is_default: boolean;
  created_at: string;
}
