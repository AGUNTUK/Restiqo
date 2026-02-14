"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Settings,
  Building,
  Compass,
  Star,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { Booking } from "@/types";

// Demo bookings data
const demoBookings: Booking[] = [
  {
    id: "1",
    userId: "demo-user",
    propertyId: "1",
    tourId: null,
    checkIn: new Date("2024-03-15"),
    checkOut: new Date("2024-03-18"),
    travelDate: null,
    guestCount: 2,
    totalPrice: 495,
    platformFee: 45,
    hostRevenue: 450,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    specialRequests: "Early check-in requested",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
    property: {
      id: "1",
      hostId: "demo-host",
      name: "Luxury Apartment in Gulshan",
      type: "APARTMENT",
      city: "Dhaka",
      location: "Gulshan",
      address: "123 Gulshan Avenue",
      description: "Beautiful luxury apartment",
      capacity: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      price: 150,
      amenities: ["wifi", "ac"],
      images: ["https://images.unsplash.com/photo-1522708323598-d08c74b8f0a2?w=200"],
      latitude: null,
      longitude: null,
      rating: 4.8,
      reviewCount: 24,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: "2",
    userId: "demo-user",
    propertyId: null,
    tourId: "1",
    checkIn: null,
    checkOut: null,
    travelDate: new Date("2024-04-10"),
    guestCount: 3,
    totalPrice: 1155,
    platformFee: 105,
    hostRevenue: 1050,
    status: "PENDING",
    paymentStatus: "PENDING",
    specialRequests: null,
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-02-25"),
    tour: {
      id: "1",
      hostId: "demo-host",
      name: "Sundarbans Adventure",
      location: "Sundarbans",
      duration: "3 days",
      description: "Explore the mangrove forest",
      pricePerPerson: 350,
      maxGroupSize: 12,
      highlights: ["Wildlife Safari"],
      images: ["https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=200"],
      included: ["Transportation"],
      excluded: ["Tips"],
      rating: 4.9,
      reviewCount: 42,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: "3",
    userId: "demo-user",
    propertyId: "2",
    tourId: null,
    checkIn: new Date("2024-02-01"),
    checkOut: new Date("2024-02-04"),
    travelDate: null,
    guestCount: 4,
    totalPrice: 825,
    platformFee: 75,
    hostRevenue: 750,
    status: "COMPLETED",
    paymentStatus: "PAID",
    specialRequests: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-04"),
    property: {
      id: "2",
      hostId: "demo-host",
      name: "Seaside Resort in Cox's Bazar",
      type: "RESORT",
      city: "Cox's Bazar",
      location: "Marine Drive",
      address: "456 Marine Drive",
      description: "Stunning seaside resort",
      capacity: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      price: 250,
      amenities: ["wifi", "pool"],
      images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200"],
      latitude: null,
      longitude: null,
      rating: 4.9,
      reviewCount: 56,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setBookings(demoBookings);
      setIsLoading(false);
    }, 500);
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* User Card */}
            <Card>
              <CardContent className="p-6 text-center">
                <img
                  src={session?.user?.image || "/placeholder-avatar.jpg"}
                  alt={session?.user?.name || "User"}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h2 className="font-semibold text-lg">{session?.user?.name}</h2>
                <p className="text-sm text-slate-500">{session?.user?.email}</p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-600">Member since</p>
                  <p className="font-medium">January 2024</p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-primary/10 text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/bookings")}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    My Bookings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push("/favorites")}
                  >
                    <Heart className="h-4 w-4 mr-3" />
                    Favorites
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/reviews")}
                  >
                    <Star className="h-4 w-4 mr-3" />
                    My Reviews
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {session?.user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-slate-600">
                Here's an overview of your bookings and activities.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                    <p className="text-sm text-slate-500">Upcoming Trips</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pastBookings.length}</p>
                    <p className="text-sm text-slate-500">Past Trips</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-slate-500">Saved Items</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Bookings</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/bookings")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No upcoming bookings</p>
                    <Button onClick={() => router.push("/properties")}>
                      Explore Properties
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                      >
                        <img
                          src={
                            booking.property?.images?.[0] ||
                            booking.tour?.images?.[0] ||
                            "/placeholder.jpg"
                          }
                          alt={booking.property?.name || booking.tour?.name || "Booking"}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {booking.property ? (
                              <Building className="h-4 w-4 text-primary" />
                            ) : (
                              <Compass className="h-4 w-4 text-primary" />
                            )}
                            <span className="font-medium">
                              {booking.property?.name || booking.tour?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            {booking.property ? (
                              <>
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {booking.property.city}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(booking.checkIn!)} - {formatDate(booking.checkOut!)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {booking.tour?.location}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(booking.travelDate!)}
                                </span>
                              </>
                            )}
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {booking.guestCount} guests
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[booking.status]}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            {formatPrice(booking.totalPrice + booking.platformFee)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-primary text-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    Planning your next trip?
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Discover amazing properties and tours across Bangladesh.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push("/properties")}
                    >
                      Browse Properties
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white/10"
                      onClick={() => router.push("/tours")}
                    >
                      Browse Tours
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    Share your experience
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Help others by reviewing your past bookings.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/reviews")}
                  >
                    Write a Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}