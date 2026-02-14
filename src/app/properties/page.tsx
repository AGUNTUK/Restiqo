"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/properties/PropertyCard";
import { Property } from "@/types";

// Demo properties data
const demoProperties: Property[] = [
  {
    id: "1",
    hostId: "demo-host",
    name: "Luxury Apartment in Gulshan",
    type: "APARTMENT",
    city: "Dhaka",
    location: "Gulshan",
    address: "123 Gulshan Avenue",
    description: "Beautiful luxury apartment in the heart of Gulshan with modern amenities and stunning city views.",
    capacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    price: 150,
    amenities: ["wifi", "ac", "kitchen", "parking", "pool", "gym"],
    images: [
      "https://images.unsplash.com/photo-1522708323598-d08c74b8f0a2?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f9c1d1150?w=800",
    ],
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
    description: "Stunning seaside resort with ocean views, private beach access, and world-class facilities.",
    capacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    price: 250,
    amenities: ["wifi", "pool", "beach", "restaurant", "spa", "parking"],
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    ],
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
  {
    id: "3",
    hostId: "demo-host",
    name: "Boutique Hotel in Sylhet",
    type: "HOTEL",
    city: "Sylhet",
    location: "Zindabazar",
    address: "789 Zindabazar",
    description: "Charming boutique hotel in the tea garden region with personalized service.",
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    price: 100,
    amenities: ["wifi", "breakfast", "room-service", "parking"],
    images: [
      "https://images.unsplash.com/photo-1566073721258-4eaa1aa1a06c?w=800",
    ],
    latitude: null,
    longitude: null,
    rating: 4.7,
    reviewCount: 18,
    isFeatured: false,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    hostId: "demo-host",
    name: "Hillside Cottage in Bandarban",
    type: "COTTAGE",
    city: "Bandarban",
    location: "Nilgiri",
    address: "Nilgiri Hill Top",
    description: "Peaceful cottage in the hills with breathtaking mountain views and hiking trails nearby.",
    capacity: 8,
    bedrooms: 4,
    beds: 4,
    bathrooms: 3,
    price: 180,
    amenities: ["wifi", "kitchen", "parking", "garden"],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad93723fa?w=800",
    ],
    latitude: null,
    longitude: null,
    rating: 4.6,
    reviewCount: 12,
    isFeatured: true,
    isVerified: false,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    hostId: "demo-host",
    name: "Heritage Guesthouse in Old Dhaka",
    type: "GUESTHOUSE",
    city: "Dhaka",
    location: "Old Dhaka",
    address: "321 Old City Street",
    description: "Traditional guesthouse with authentic Bangladeshi architecture and local cuisine.",
    capacity: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    price: 60,
    amenities: ["wifi", "breakfast", "kitchen"],
    images: [
      "https://images.unsplash.com/photo-1555834830-8e6eb29570a3?w=800",
    ],
    latitude: null,
    longitude: null,
    rating: 4.4,
    reviewCount: 8,
    isFeatured: false,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    hostId: "demo-host",
    name: "Beach Villa in Kuakata",
    type: "VILLA",
    city: "Kuakata",
    location: "Beach Road",
    address: "567 Beach Road",
    description: "Private beachfront villa with stunning sunrise and sunset views over the Bay of Bengal.",
    capacity: 10,
    bedrooms: 5,
    beds: 5,
    bathrooms: 4,
    price: 350,
    amenities: ["wifi", "pool", "beach", "kitchen", "parking", "garden"],
    images: [
      "https://images.unsplash.com/photo-1499793983623-e8bcb8bfc5e3?w=800",
    ],
    latitude: null,
    longitude: null,
    rating: 4.9,
    reviewCount: 32,
    isFeatured: true,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const propertyTypes = ["APARTMENT", "HOTEL", "RESORT", "GUESTHOUSE", "VILLA", "COTTAGE"];
const amenitiesList = [
  { id: "wifi", label: "WiFi" },
  { id: "ac", label: "Air Conditioning" },
  { id: "kitchen", label: "Kitchen" },
  { id: "parking", label: "Parking" },
  { id: "pool", label: "Pool" },
  { id: "gym", label: "Gym" },
  { id: "beach", label: "Beach Access" },
  { id: "spa", label: "Spa" },
  { id: "restaurant", label: "Restaurant" },
  { id: "breakfast", label: "Breakfast" },
];

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("location") || "");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("rating");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperties(demoProperties);
      setFilteredProperties(demoProperties);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let result = [...properties];

    // Search by location
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      result = result.filter((p) => p.type === selectedType);
    }

    // Filter by price
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
      result = result.filter((p) =>
        selectedAmenities.every((a) => p.amenities.includes(a))
      );
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    setFilteredProperties(result);
  }, [searchQuery, selectedType, priceRange, minRating, selectedAmenities, sortBy, properties]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setPriceRange([0, 500]);
    setMinRating(0);
    setSelectedAmenities([]);
    setSortBy("rating");
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Properties in Bangladesh
          </h1>
          <p className="text-slate-600">
            Discover {filteredProperties.length} properties across the country
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-80 shrink-0"
              >
                <Card className="sticky top-20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold text-lg">Filters</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-primary"
                      >
                        Clear all
                      </Button>
                    </div>

                    {/* Search */}
                    <div className="space-y-4 mb-6">
                      <Label>Search Location</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="City or area..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div className="space-y-4 mb-6">
                      <Label>Property Type</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedType === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedType("all")}
                        >
                          All
                        </Button>
                        {propertyTypes.map((type) => (
                          <Button
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedType(type)}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4 mb-6">
                      <Label>
                        Price Range: BDT {priceRange[0]} - {priceRange[1]}
                      </Label>
                      <div className="flex gap-4">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([priceRange[0], parseInt(e.target.value) || 500])
                          }
                        />
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-4 mb-6">
                      <Label>Minimum Rating</Label>
                      <div className="flex gap-2">
                        {[0, 3, 3.5, 4, 4.5].map((rating) => (
                          <Button
                            key={rating}
                            variant={minRating === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMinRating(rating)}
                            className="flex items-center"
                          >
                            {rating === 0 ? "Any" : `${rating}+`}
                            {rating > 0 && <Star className="h-3 w-3 ml-1 fill-current" />}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                      <Label>Amenities</Label>
                      <div className="flex flex-wrap gap-2">
                        {amenitiesList.map((amenity) => (
                          <Button
                            key={amenity.id}
                            variant={
                              selectedAmenities.includes(amenity.id)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleAmenity(amenity.id)}
                          >
                            {amenity.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                {showFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-slate-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Sort by:</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="rating">Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/3] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">No properties found matching your criteria.</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>}>
      <PropertiesContent />
    </Suspense>
  );
}