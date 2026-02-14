"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building,
  Compass,
  Calendar,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { Property, Tour, Booking } from "@/types";

// Demo data
const demoProperties: Property[] = [
  {
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
  {
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
];

const demoTours: Tour[] = [
  {
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
];

const demoBookings: Booking[] = [
  {
    id: "1",
    userId: "user1",
    propertyId: "1",
    tourId: null,
    checkIn: new Date("2024-03-15"),
    checkOut: new Date("2024-03-18"),
    travelDate: null,
    guestCount: 2,
    totalPrice: 450,
    platformFee: 45,
    hostRevenue: 405,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    specialRequests: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "user2",
    propertyId: null,
    tourId: "1",
    checkIn: null,
    checkOut: null,
    travelDate: new Date("2024-04-10"),
    guestCount: 3,
    totalPrice: 1050,
    platformFee: 105,
    hostRevenue: 945,
    status: "PENDING",
    paymentStatus: "PENDING",
    specialRequests: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type TabType = "properties" | "tours" | "bookings";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-slate-100 text-slate-700",
  DRAFT: "bg-slate-100 text-slate-500",
};

export default function HostDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("properties");
  const [properties, setProperties] = useState<Property[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/host");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setProperties(demoProperties);
      setTours(demoTours);
      setBookings(demoBookings);
      setIsLoading(false);
    }, 500);
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + b.hostRevenue, 0);
  const totalBookings = bookings.length;
  const activeListings = properties.filter((p) => p.status === "ACTIVE").length + 
                         tours.filter((t) => t.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Host Dashboard</h1>
            <p className="text-slate-600">Manage your properties, tours, and bookings</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/host/properties/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
            <Button variant="outline" onClick={() => router.push("/host/tours/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tour
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <p className="text-lg font-bold">{formatPrice(totalRevenue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Bookings</p>
                    <p className="text-lg font-bold">{totalBookings}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active Listings</p>
                    <p className="text-lg font-bold">{activeListings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "properties" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("properties")}
                  >
                    <Building className="h-4 w-4 mr-3" />
                    Properties
                    <Badge variant="outline" className="ml-auto">
                      {properties.length}
                    </Badge>
                  </Button>
                  <Button
                    variant={activeTab === "tours" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("tours")}
                  >
                    <Compass className="h-4 w-4 mr-3" />
                    Tours
                    <Badge variant="outline" className="ml-auto">
                      {tours.length}
                    </Badge>
                  </Button>
                  <Button
                    variant={activeTab === "bookings" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Bookings
                    <Badge variant="outline" className="ml-auto">
                      {bookings.length}
                    </Badge>
                  </Button>
                </nav>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pro Tip</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Listings with high-quality photos get 2x more bookings.
                      Update your images regularly!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Properties Tab */}
            {activeTab === "properties" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Properties</CardTitle>
                  <Button size="sm" onClick={() => router.push("/host/properties/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </CardHeader>
                <CardContent>
                  {properties.length === 0 ? (
                    <div className="text-center py-12">
                      <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No properties yet</p>
                      <Button onClick={() => router.push("/host/properties/new")}>
                        Add Your First Property
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.map((property) => (
                        <motion.div
                          key={property.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                        >
                          <img
                            src={property.images?.[0] || "/placeholder.jpg"}
                            alt={property.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{property.name}</h3>
                              <Badge className={statusColors[property.status]}>
                                {property.status}
                              </Badge>
                              {property.isVerified && (
                                <Badge variant="outline" className="text-green-600">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {property.city}
                              </span>
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {property.rating.toFixed(1)}
                              </span>
                              <span>{formatPrice(property.price)}/night</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tours Tab */}
            {activeTab === "tours" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Tours</CardTitle>
                  <Button size="sm" onClick={() => router.push("/host/tours/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </CardHeader>
                <CardContent>
                  {tours.length === 0 ? (
                    <div className="text-center py-12">
                      <Compass className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No tours yet</p>
                      <Button onClick={() => router.push("/host/tours/new")}>
                        Add Your First Tour
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tours.map((tour) => (
                        <motion.div
                          key={tour.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                        >
                          <img
                            src={tour.images?.[0] || "/placeholder.jpg"}
                            alt={tour.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{tour.name}</h3>
                              <Badge className={statusColors[tour.status]}>
                                {tour.status}
                              </Badge>
                              {tour.isVerified && (
                                <Badge variant="outline" className="text-green-600">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {tour.location}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {tour.duration}
                              </span>
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {tour.rating.toFixed(1)}
                              </span>
                              <span>{formatPrice(tour.pricePerPerson)}/person</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => {
                        const listing = booking.property || booking.tour;
                        return (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                          >
                            <img
                              src={listing?.images?.[0] || "/placeholder.jpg"}
                              alt={listing?.name || "Booking"}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{listing?.name}</h3>
                                <Badge className={statusColors[booking.status]}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                {booking.property ? (
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(booking.checkIn!)} - {formatDate(booking.checkOut!)}
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(booking.travelDate!)}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {booking.guestCount} guests
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(booking.hostRevenue)}</p>
                              <p className="text-xs text-slate-500">Your revenue</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}