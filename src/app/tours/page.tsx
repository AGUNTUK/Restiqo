"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TourCard from "@/components/tours/TourCard";
import { Tour } from "@/types";

// Demo tours data
const demoTours: Tour[] = [
  {
    id: "1",
    hostId: "demo-host",
    name: "Sundarbans Adventure",
    location: "Sundarbans, Khulna",
    duration: "3 days, 2 nights",
    description: "Explore the world's largest mangrove forest, home to the Royal Bengal Tiger. This adventure includes boat cruises, wildlife safaris, and authentic local cuisine.",
    pricePerPerson: 350,
    maxGroupSize: 12,
    highlights: ["Wildlife Safari", "Boat Cruise", "Royal Bengal Tiger Spotting", "Local Seafood"],
    images: [
      "https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=800",
    ],
    included: ["Transportation from Dhaka", "All meals", "Boat accommodation", "Guide", "Entry permits"],
    excluded: ["Personal expenses", "Tips", "Travel insurance"],
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    hostId: "demo-host",
    name: "Sreemangal Tea Garden Tour",
    location: "Sreemangal, Sylhet",
    duration: "2 days, 1 night",
    description: "Discover the tea capital of Bangladesh. Visit lush tea gardens, Lawachara National Park, and experience tribal culture in the beautiful hills of Sylhet.",
    pricePerPerson: 180,
    maxGroupSize: 8,
    highlights: ["Tea Garden Visit", "Lawachara National Park", "Tribal Village Experience", "Seven Layer Tea"],
    images: [
      "https://images.unsplash.com/photo-1564890368449-1b3c853e1e1a?w=800",
    ],
    included: ["Transportation", "Accommodation", "Guide", "Tea tasting"],
    excluded: ["Meals", "Personal expenses"],
    rating: 4.8,
    reviewCount: 28,
    isFeatured: true,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    hostId: "demo-host",
    name: "Cox's Bazar Beach Escape",
    location: "Cox's Bazar",
    duration: "3 days, 2 nights",
    description: "Experience the world's longest unbroken beach. Enjoy beach activities, visit Himchari National Park, and explore the vibrant local culture.",
    pricePerPerson: 250,
    maxGroupSize: 15,
    highlights: ["World's Longest Beach", "Himchari National Park", "Inani Beach", "Seafood Feast"],
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    ],
    included: ["Hotel accommodation", "Breakfast", "Local transportation", "Guide"],
    excluded: ["Lunch & Dinner", "Personal activities", "Tips"],
    rating: 4.7,
    reviewCount: 56,
    isFeatured: true,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    hostId: "demo-host",
    name: "Bandarban Hill Adventure",
    location: "Bandarban, Chittagong Hill Tracts",
    duration: "4 days, 3 nights",
    description: "Trek through the beautiful hills of Bandarban. Visit Golden Temple, Nilgiri, and experience the unique culture of indigenous communities.",
    pricePerPerson: 300,
    maxGroupSize: 10,
    highlights: ["Hill Trekking", "Golden Temple", "Nilgiri Sunrise", "Indigenous Culture"],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad93723fa?w=800",
    ],
    included: ["All transportation", "Resort accommodation", "All meals", "Trekking guide", "Entry fees"],
    excluded: ["Personal shopping", "Tips"],
    rating: 4.9,
    reviewCount: 34,
    isFeatured: false,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    hostId: "demo-host",
    name: "Old Dhaka Heritage Walk",
    location: "Old Dhaka",
    duration: "1 day",
    description: "Walk through the historic streets of Old Dhaka. Visit Lalbagh Fort, Ahsan Manzil, and taste authentic Bengali street food.",
    pricePerPerson: 50,
    maxGroupSize: 20,
    highlights: ["Lalbagh Fort", "Ahsan Manzil", "Street Food Tour", "Local Markets"],
    images: [
      "https://images.unsplash.com/photo-1596895331957-f493c81c6a3a?w=800",
    ],
    included: ["Guide", "Street food tasting", "Entry fees"],
    excluded: ["Transportation", "Personal shopping"],
    rating: 4.6,
    reviewCount: 89,
    isFeatured: false,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    hostId: "demo-host",
    name: "Ratargul Swamp Forest Tour",
    location: "Sylhet",
    duration: "2 days, 1 night",
    description: "Explore Bangladesh's only freshwater swamp forest. Boat through submerged trees, visit Jaflong, and experience the natural beauty of Sylhet.",
    pricePerPerson: 160,
    maxGroupSize: 10,
    highlights: ["Ratargul Swamp Forest", "Jaflong Stone Collection", "Boat Safari", "Tea Garden Visit"],
    images: [
      "https://images.unsplash.com/photo-1544735728-9a64d7a667c7?w=800",
    ],
    included: ["Transportation", "Boat ride", "Guide", "Accommodation"],
    excluded: ["Meals", "Personal expenses"],
    rating: 4.7,
    reviewCount: 23,
    isFeatured: false,
    isVerified: false,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function ToursContent() {
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("location") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("rating");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTours(demoTours);
      setFilteredTours(demoTours);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let result = [...tours];

    // Search by location
    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price
    result = result.filter(
      (t) => t.pricePerPerson >= priceRange[0] && t.pricePerPerson <= priceRange[1]
    );

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((t) => t.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        result.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
        break;
      case "price-high":
        result.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
        break;
      case "newest":
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    setFilteredTours(result);
  }, [searchQuery, priceRange, minRating, sortBy, tours]);

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 500]);
    setMinRating(0);
    setSortBy("rating");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Tours in Bangladesh
          </h1>
          <p className="text-slate-600">
            Discover {filteredTours.length} unique tour experiences
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
                          placeholder="Location or tour name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
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
                    <div className="space-y-4">
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
            ) : filteredTours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">No tours found matching your criteria.</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToursPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>}>
      <ToursContent />
    </Suspense>
  );
}