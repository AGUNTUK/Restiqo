"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Users,
  Heart,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Compass,
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
import { formatPrice } from "@/lib/utils";
import { Tour } from "@/types";

// Demo tour data
const demoTour: Tour = {
  id: "1",
  hostId: "demo-host",
  name: "Sundarbans Adventure",
  location: "Sundarbans, Khulna Division",
  duration: "3 days, 2 nights",
  description: `Embark on an unforgettable journey through the world's largest mangrove forest - the Sundarbans, a UNESCO World Heritage Site.

This 3-day adventure takes you deep into the heart of this unique ecosystem, home to the majestic Royal Bengal Tiger, spotted deer, wild boars, and countless bird species.

**What to Expect:**

Day 1: Depart from Dhaka early morning and travel to Khulna. Board our comfortable boat and begin your journey into the forest. Enjoy a sunset cruise and overnight stay on the boat.

Day 2: Full day of exploration! Visit various wildlife sanctuaries, spot crocodiles sunbathing, and if luck favors, catch a glimpse of the Royal Bengal Tiger. Enjoy authentic Bengali cuisine prepared fresh on board.

Day 3: Early morning bird watching session, visit a local village to experience traditional life, and begin the return journey to Dhaka.

**Why Choose This Tour:**
- Experienced local guides with deep knowledge of the forest
- Comfortable boat accommodation with modern amenities
- Authentic local cuisine featuring fresh seafood
- Small group sizes for personalized experience
- Responsible tourism practices supporting local communities`,
  pricePerPerson: 350,
  maxGroupSize: 12,
  highlights: [
    "Wildlife Safari",
    "Boat Cruise",
    "Royal Bengal Tiger Spotting",
    "Bird Watching",
    "Local Seafood",
    "Village Visit",
  ],
  images: [
    "https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=1200",
    "https://images.unsplash.com/photo-1544735728-9a64d7a667c7?w=1200",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
  ],
  included: [
    "Transportation from Dhaka",
    "All meals (Breakfast, Lunch, Dinner)",
    "Boat accommodation",
    "Experienced guide",
    "Entry permits",
    "Safety equipment",
  ],
  excluded: [
    "Personal expenses",
    "Tips for guides",
    "Travel insurance",
    "Alcoholic beverages",
  ],
  rating: 4.9,
  reviewCount: 42,
  isFeatured: true,
  isVerified: true,
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  host: {
    id: "demo-host",
    userId: "demo-user",
    hostType: "TOUR_OPERATOR",
    companyName: "Bangladesh Eco Tours",
    description: "Leading eco-tourism operator in Bangladesh",
    status: "APPROVED",
    totalRevenue: 75000,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "demo-user",
      name: "Karim Hassan",
      email: "karim@example.com",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      role: "HOST",
      phone: "+880 1812-345678",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
};

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking states
  const [travelDate, setTravelDate] = useState("");
  const [travelerCount, setTravelerCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTour(demoTour);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const totalPrice = tour ? tour.pricePerPerson * travelerCount : 0;
  const platformFee = totalPrice * 0.1;
  const finalPrice = totalPrice + platformFee;

  const handleBooking = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/tours/" + params.id);
      return;
    }

    if (!travelDate) {
      toast({
        title: "Error",
        description: "Please select a travel date.",
        variant: "destructive",
      });
      return;
    }

    if (travelerCount > (tour?.maxGroupSize || 0)) {
      toast({
        title: "Error",
        description: `Maximum group size is ${tour?.maxGroupSize} travelers.`,
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    // Simulate booking API call
    setTimeout(() => {
      toast({
        title: "Booking Confirmed!",
        description: "Your tour booking has been successfully created.",
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
        ? "Tour removed from your wishlist."
        : "Tour added to your wishlist.",
    });
  };

  const nextImage = () => {
    if (tour?.images) {
      setCurrentImageIndex((prev) =>
        prev === tour.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (tour?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? tour.images.length - 1 : prev - 1
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

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tour not found</h1>
          <Button onClick={() => router.push("/tours")}>Browse Tours</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative aspect-[21/9] overflow-hidden">
        <img
          src={tour.images?.[currentImageIndex] || "/placeholder-tour.jpg"}
          alt={tour.name}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {tour.images && tour.images.length > 1 && (
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
          {tour.images?.map((_, index) => (
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
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary text-white">
                      <Compass className="h-3 w-3 mr-1" />
                      Tour
                    </Badge>
                    {tour.isFeatured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {tour.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tour.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      {tour.rating.toFixed(1)} ({tour.reviewCount} reviews)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Info */}
            {tour.host && (
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={tour.host.user?.image || "/placeholder-avatar.jpg"}
                    alt={tour.host.user?.name || "Host"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">Operated by {tour.host.user?.name}</p>
                    <p className="text-sm text-slate-600">{tour.host.companyName}</p>
                  </div>
                  {tour.isVerified && (
                    <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Verified Operator
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About this tour</h2>
              <p className="text-slate-600 whitespace-pre-line">
                {tour.description}
              </p>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Tour Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tour.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg"
                  >
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">What's Included</h2>
                <div className="space-y-2">
                  {tour.included.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">What's Not Included</h2>
                <div className="space-y-2">
                  {tour.excluded.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Tour Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{tour.duration}</p>
                    <p className="text-sm text-slate-500">Duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Max {tour.maxGroupSize}</p>
                    <p className="text-sm text-slate-500">Group Size</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{tour.location}</p>
                    <p className="text-sm text-slate-500">Location</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-lg">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold">
                      {formatPrice(tour.pricePerPerson)}
                    </span>
                    <span className="text-slate-600"> / person</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                    {tour.rating.toFixed(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Input */}
                <div className="space-y-2">
                  <Label>Travel Date</Label>
                  <Input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Travelers */}
                <div className="space-y-2">
                  <Label>Number of Travelers</Label>
                  <Input
                    type="number"
                    min={1}
                    max={tour.maxGroupSize}
                    value={travelerCount}
                    onChange={(e) => setTravelerCount(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-slate-500">
                    Maximum {tour.maxGroupSize} travelers per group
                  </p>
                </div>

                {/* Price Breakdown */}
                {travelerCount > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>
                        {formatPrice(tour.pricePerPerson)} x {travelerCount} travelers
                      </span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform fee (10%)</span>
                      <span>{formatPrice(platformFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(finalPrice)}</span>
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