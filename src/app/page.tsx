"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building,
  Compass,
  Shield,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/properties/PropertyCard";
import TourCard from "@/components/tours/TourCard";
import HeroSearchBar from "@/components/search/HeroSearchBar";
import { Property, Tour } from "@/types";

// Demo data for initial display
const demoProperties: Property[] = [
  {
    id: "1",
    hostId: "demo-host",
    name: "Luxury Apartment in Gulshan",
    type: "APARTMENT",
    city: "Dhaka",
    location: "Gulshan",
    address: "123 Gulshan Avenue",
    description: "Beautiful luxury apartment in the heart of Gulshan",
    capacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    price: 150,
    amenities: ["wifi", "ac", "kitchen", "parking"],
    images: [
      "https://images.unsplash.com/photo-1522708323598-d08c74b8f0a2?w=800",
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
    description: "Stunning seaside resort with ocean views",
    capacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    price: 250,
    amenities: ["wifi", "pool", "beach", "restaurant"],
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
    description: "Charming boutique hotel in the tea garden region",
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    price: 100,
    amenities: ["wifi", "breakfast", "room-service"],
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
];

const demoTours: Tour[] = [
  {
    id: "1",
    hostId: "demo-host",
    name: "Sundarbans Adventure",
    location: "Sundarbans",
    duration: "3 days",
    description: "Explore the world's largest mangrove forest",
    pricePerPerson: 350,
    maxGroupSize: 12,
    highlights: ["Wildlife Safari", "Boat Cruise", "Local Guide"],
    images: [
      "https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=800",
    ],
    included: ["Transportation", "Meals", "Accommodation"],
    excluded: ["Personal expenses", "Tips"],
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
    location: "Sreemangal",
    duration: "2 days",
    description: "Discover the tea capital of Bangladesh",
    pricePerPerson: 180,
    maxGroupSize: 8,
    highlights: ["Tea Gardens", "Lawachara National Park", "Tribal Villages"],
    images: [
      "https://images.unsplash.com/photo-1564890368449-1b3c853e1e1a?w=800",
    ],
    included: ["Transportation", "Guide", "Tea tasting"],
    excluded: ["Meals", "Personal expenses"],
    rating: 4.8,
    reviewCount: 28,
    isFeatured: true,
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const popularDestinations = [
  {
    name: "Dhaka",
    image: "https://images.unsplash.com/photo-1596895331957-f493c81c6a3a?w=400",
    count: 45,
  },
  {
    name: "Cox's Bazar",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    count: 32,
  },
  {
    name: "Sylhet",
    image: "https://images.unsplash.com/photo-1544735728-9a64d7a667c7?w=400",
    count: 28,
  },
  {
    name: "Sundarbans",
    image: "https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=400",
    count: 15,
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Hosts",
    description: "All hosts are verified for your safety and peace of mind",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer support for any assistance",
  },
  {
    icon: Building,
    title: "Diverse Properties",
    description: "From apartments to resorts, find your perfect stay",
  },
  {
    icon: Compass,
    title: "Unique Tours",
    description: "Curated tours to explore Bangladesh's beauty",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=1920"
            alt="Bangladesh landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Discover Bangladesh's
              <br />
              <span className="text-primary">Finest Stays & Tours</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Book your perfect property or adventure with trusted local hosts.
              Experience the beauty of Bangladesh.
            </p>
          </motion.div>

          {/* New Airbnb-style Search Bar */}
          <HeroSearchBar />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Popular Destinations
              </h2>
              <p className="text-slate-600 mt-1">
                Explore the most visited places in Bangladesh
              </p>
            </div>
            <Link
              href="/properties"
              className="text-primary hover:text-primary/80 flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularDestinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/properties?location=${destination.name}`}>
                  <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-square">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold text-lg">
                          {destination.name}
                        </h3>
                        <p className="text-sm text-white/80">
                          {destination.count} properties
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Featured Properties
              </h2>
              <p className="text-slate-600 mt-1">
                Hand-picked properties for your perfect stay
              </p>
            </div>
            <Link
              href="/properties"
              className="text-primary hover:text-primary/80 flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Featured Tours
              </h2>
              <p className="text-slate-600 mt-1">
                Unforgettable experiences across Bangladesh
              </p>
            </div>
            <Link
              href="/tours"
              className="text-primary hover:text-primary/80 flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-dark to-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Host on Restiqo?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of hosts earning income by sharing their properties
              and tour experiences with travelers from around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/host/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary-dark hover:bg-white/90"
                >
                  Become a Host
                </Button>
              </Link>
              <Link href="/properties">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Explore Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
