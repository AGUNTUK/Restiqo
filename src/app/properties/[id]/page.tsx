"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Users,
  Bed,
  Bath,
  Heart,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, calculateNights, calculateTotalPrice } from "@/lib/utils";
import { Property } from "@/types";

// Demo property data
const demoProperty: Property = {
  id: "1",
  hostId: "demo-host",
  name: "Luxury Apartment in Gulshan",
  type: "APARTMENT",
  city: "Dhaka",
  location: "Gulshan",
  address: "123 Gulshan Avenue, Gulshan 2, Dhaka 1212",
  description: `Experience luxury living in the heart of Dhaka's most prestigious neighborhood. This beautifully designed apartment offers stunning city views, modern amenities, and easy access to the best restaurants, shopping, and entertainment in Gulshan.

The apartment features:
- Spacious living area with floor-to-ceiling windows
- Fully equipped modern kitchen
- Master bedroom with en-suite bathroom
- High-speed WiFi throughout
- 24/7 security and building management
- Reserved parking space

Located just minutes away from Gulshan Park, diplomatic zone, and major corporate offices. Perfect for business travelers, families, or anyone looking for a premium stay in Dhaka.`,
  capacity: 4,
  bedrooms: 2,
  beds: 2,
  bathrooms: 2,
  price: 150,
  amenities: ["wifi", "ac", "kitchen", "parking", "pool", "gym", "security", "tv"],
  images: [
    "https://images.unsplash.com/photo-1522708323598-d08c74b8f0a2?w=1200",
    "https://images.unsplash.com/photo-1560448204-e02f9c1d1150?w=1200",
    "https://images.unsplash.com/photo-1502672290453-46166849d9a6?w=1200",
    "https://images.unsplash.com/photo-1560185007-cde436f6a04a?w=1200",
  ],
  latitude: 23.7925,
  longitude: 90.4078,
  rating: 4.8,
  reviewCount: 24,
  isFeatured: true,
  isVerified: true,
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  host: {
    id: "demo-host",
    userId: "demo-user",
    hostType: "APARTMENT",
    companyName: "Gulshan Properties Ltd.",
    description: "Premium apartment rentals in Dhaka",
    status: "APPROVED",
    totalRevenue: 50000,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "demo-user",
      name: "Ahmed Rahman",
      email: "ahmed@example.com",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      role: "HOST",
      phone: "+880 1712-345678",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
};

const amenityLabels: Record<string, string> = {
  wifi: "High-speed WiFi",
  ac: "Air Conditioning",
  kitchen: "Fully Equipped Kitchen",
  parking: "Free Parking",
  pool: "Swimming Pool",
  gym: "Fitness Center",
  security: "24/7 Security",
  tv: "Smart TV",
  beach: "Beach Access",
  spa: "Spa & Wellness",
  restaurant: "On-site Restaurant",
  breakfast: "Complimentary Breakfast",
  garden: "Garden Area",
  "room-service": "Room Service",
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking states
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperty(demoProperty);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const { totalPrice, hostRevenue, platformFee } = property
    ? calculateTotalPrice(property.price, nights)
    : { totalPrice: 0, hostRevenue: 0, platformFee: 0 };

  const handleBooking = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/properties/" + params.id);
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Error",
        description: "Please select check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    if (guestCount > (property?.capacity || 0)) {
      toast({
        title: "Error",
        description: `Maximum capacity is ${property?.capacity} guests.`,
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    // Simulate booking API call
    setTimeout(() => {
      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been successfully created.",
        variant: "default",
      });
      router.push("/dashboard/bookings");
    }, 1500);
  };

  const handleFavoriteToggle = () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? "Property removed from your wishlist."
        : "Property added to your wishlist.",
    });
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="aspect-[21/9] rounded-xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Button onClick={() => router.push("/properties")}>
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative aspect-[21/9] overflow-hidden">
        <img
          src={property.images?.[currentImageIndex] || "/placeholder-property.jpg"}
          alt={property.name}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {property.images && property.images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {property.images?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/80 hover:bg-white"
            onClick={handleFavoriteToggle}
          >
            <Heart
              className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
            {isFavorite ? "Saved" : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/80 hover:bg-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.city}, {property.location}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      {property.rating.toFixed(1)} ({property.reviewCount} reviews)
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary text-white">{property.type}</Badge>
              </div>
            </div>

            {/* Host Info */}
            {property.host && (
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={property.host.user?.image || "/placeholder-avatar.jpg"}
                    alt={property.host.user?.name || "Host"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">Hosted by {property.host.user?.name}</p>
                    <p className="text-sm text-slate-600">{property.host.companyName}</p>
                  </div>
                  {property.isVerified && (
                    <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Verified Host
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About this property</h2>
              <p className="text-slate-600 whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{property.capacity} guests</p>
                    <p className="text-sm text-slate-500">Capacity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{property.bedrooms} bedrooms</p>
                    <p className="text-sm text-slate-500">{property.beds} beds</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{property.bathrooms} bathrooms</p>
                    <p className="text-sm text-slate-500">Full baths</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{property.location}</p>
                    <p className="text-sm text-slate-500">{property.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {amenityLabels[amenity] || amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <Card>
                <CardContent className="p-4">
                  <p className="text-slate-600 mb-2">{property.address}</p>
                  <div className="aspect-[16/9] bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-slate-500">Map placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-lg">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold">
                      {formatPrice(property.price)}
                    </span>
                    <span className="text-slate-600"> / night</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                    {property.rating.toFixed(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Check In</Label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Check Out</Label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input
                    type="number"
                    min={1}
                    max={property.capacity}
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-slate-500">
                    Maximum {property.capacity} guests
                  </p>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>
                        {formatPrice(property.price)} x {nights} nights
                      </span>
                      <span>{formatPrice(property.price * nights)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform fee (10%)</span>
                      <span>{formatPrice(platformFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Book Now"
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  You won't be charged yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}