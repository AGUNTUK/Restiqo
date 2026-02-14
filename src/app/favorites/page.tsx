"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Building, Compass, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

// Demo favorites data
const demoFavorites = [
  {
    id: "1",
    type: "property",
    item: {
      id: "1",
      name: "Luxury Apartment in Gulshan",
      city: "Dhaka",
      location: "Gulshan",
      price: 150,
      rating: 4.8,
      reviewCount: 24,
      images: ["https://images.unsplash.com/photo-1522708323598-d08c74b8f0a2?w=400"],
      type: "APARTMENT",
    },
  },
  {
    id: "2",
    type: "property",
    item: {
      id: "2",
      name: "Seaside Resort in Cox's Bazar",
      city: "Cox's Bazar",
      location: "Marine Drive",
      price: 250,
      rating: 4.9,
      reviewCount: 56,
      images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"],
      type: "RESORT",
    },
  },
  {
    id: "3",
    type: "tour",
    item: {
      id: "1",
      name: "Sundarbans Adventure",
      location: "Sundarbans",
      pricePerPerson: 350,
      rating: 4.9,
      reviewCount: 42,
      images: ["https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=400"],
      duration: "3 days",
    },
  },
  {
    id: "4",
    type: "tour",
    item: {
      id: "2",
      name: "Sreemangal Tea Garden Tour",
      location: "Sreemangal",
      pricePerPerson: 180,
      rating: 4.8,
      reviewCount: 28,
      images: ["https://images.unsplash.com/photo-1564890368449-1b3c853e1e1a?w=400"],
      duration: "2 days",
    },
  },
];

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState(demoFavorites);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "properties" | "tours">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/favorites");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [status, router]);

  const handleRemove = (id: string, name: string) => {
    setFavorites(favorites.filter((f) => f.id !== id));
    toast({
      title: "Removed from favorites",
      description: `${name} has been removed from your wishlist.`,
    });
  };

  const filteredFavorites = favorites.filter((f) => {
    if (activeTab === "all") return true;
    return f.type === (activeTab === "properties" ? "property" : "tour");
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Your Favorites
          </h1>
          <p className="text-slate-600">
            {favorites.length} saved {favorites.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
          >
            All
          </Button>
          <Button
            variant={activeTab === "properties" ? "default" : "outline"}
            onClick={() => setActiveTab("properties")}
          >
            <Building className="h-4 w-4 mr-2" />
            Properties
          </Button>
          <Button
            variant={activeTab === "tours" ? "default" : "outline"}
            onClick={() => setActiveTab("tours")}
          >
            <Compass className="h-4 w-4 mr-2" />
            Tours
          </Button>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-slate-500 mb-6">
              Start exploring and save your favorite properties and tours.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/properties">
                <Button>Browse Properties</Button>
              </Link>
              <Link href="/tours">
                <Button variant="outline">Browse Tours</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={favorite.item.images[0]}
                      alt={favorite.item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={
                          favorite.type === "property"
                            ? "bg-primary text-white"
                            : "bg-green-500 text-white"
                        }
                      >
                        {favorite.type === "property" ? (
                          <>
                            <Building className="h-3 w-3 mr-1" />
                            Property
                          </>
                        ) : (
                          <>
                            <Compass className="h-3 w-3 mr-1" />
                            Tour
                          </>
                        )}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-red-500"
                      onClick={() =>
                        handleRemove(favorite.id, favorite.item.name)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Link
                    href={
                      favorite.type === "property"
                        ? `/properties/${favorite.item.id}`
                        : `/tours/${favorite.item.id}`
                    }
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {favorite.item.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-2">
                        {favorite.item.location}
                        {favorite.type === "property" && `, ${favorite.item.city}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm font-medium">
                            {favorite.item.rating}
                          </span>
                          <span className="text-sm text-slate-400 ml-1">
                            ({favorite.item.reviewCount})
                          </span>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatPrice(
                            favorite.type === "property"
                              ? (favorite.item as any).price
                              : (favorite.item as any).pricePerPerson
                          )}
                          <span className="text-xs text-slate-500 font-normal">
                            {favorite.type === "property" ? "/night" : "/person"}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}