// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "USER" | "HOST" | "ADMIN";
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Host types
export interface HostProfile {
  id: string;
  userId: string;
  hostType: "APARTMENT" | "HOTEL" | "TOUR_OPERATOR" | "RESORT" | "GUESTHOUSE";
  companyName: string | null;
  description: string | null;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

// Property types
export interface Property {
  id: string;
  hostId: string;
  name: string;
  type: "APARTMENT" | "HOTEL" | "RESORT" | "GUESTHOUSE" | "VILLA" | "COTTAGE";
  city: string;
  location: string;
  address: string;
  description: string;
  capacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  price: number;
  amenities: string[];
  images: string[];
  latitude: number | null;
  longitude: number | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  createdAt: Date;
  updatedAt: Date;
  host?: HostProfile & { user: User };
}

// Tour types
export interface Tour {
  id: string;
  hostId: string;
  name: string;
  location: string;
  duration: string;
  description: string;
  pricePerPerson: number;
  maxGroupSize: number;
  highlights: string[];
  images: string[];
  included: string[];
  excluded: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  createdAt: Date;
  updatedAt: Date;
  host?: HostProfile & { user: User };
}

// Booking types
export interface Booking {
  id: string;
  userId: string;
  propertyId: string | null;
  tourId: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
  travelDate: Date | null;
  guestCount: number;
  totalPrice: number;
  platformFee: number;
  hostRevenue: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  specialRequests: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  property?: Property;
  tour?: Tour;
}

// Review types
export interface Review {
  id: string;
  userId: string;
  propertyId: string | null;
  tourId: string | null;
  bookingId: string;
  rating: number;
  title: string;
  comment: string;
  hostResponse: string | null;
  hostRespondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  property?: Property;
  tour?: Tour;
}

// Favorite types
export interface Favorite {
  id: string;
  userId: string;
  propertyId: string | null;
  tourId: string | null;
  createdAt: Date;
  property?: Property;
  tour?: Tour;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Search & Filter types
export interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guestCount?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  sortBy?: "rating" | "price-low" | "price-high" | "newest";
}

// Form types
export interface PropertyFormData {
  name: string;
  type: string;
  city: string;
  location: string;
  address: string;
  description: string;
  capacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  price: number;
  amenities: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
}

export interface TourFormData {
  name: string;
  location: string;
  duration: string;
  description: string;
  pricePerPerson: number;
  maxGroupSize: number;
  highlights: string[];
  images: string[];
  included: string[];
  excluded: string[];
}

export interface BookingFormData {
  propertyId?: string;
  tourId?: string;
  checkIn?: Date;
  checkOut?: Date;
  travelDate?: Date;
  guestCount: number;
  specialRequests?: string;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}