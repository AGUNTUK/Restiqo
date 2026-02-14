"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, Users, Clock, Compass } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Tour } from "@/types";

interface TourCardProps {
  tour: Tour;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export default function TourCard({
  tour,
  showFavorite = true,
  isFavorite = false,
  onFavoriteToggle,
}: TourCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images = tour.images || [];
  const mainImage = images[0] || "/placeholder-tour.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
          )}
          <Image
            src={mainImage}
            alt={tour.name}
            fill
            className={`object-cover transition-transform duration-500 ${
              isHovered ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {tour.isFeatured && (
              <Badge className="bg-primary text-white">Featured</Badge>
            )}
            {tour.isVerified && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                Verified
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/90 text-slate-700">
              <Compass className="h-3 w-3 mr-1" />
              Tour
            </Badge>
          </div>

          {/* Favorite Button */}
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white ${
                isFavorite ? "text-red-500" : "text-slate-600"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onFavoriteToggle?.();
              }}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
              />
            </Button>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-slate-900/80 text-white text-sm px-3 py-1">
              {formatPrice(tour.pricePerPerson)}/person
            </Badge>
          </div>
        </div>

        {/* Content */}
        <Link href={`/tours/${tour.id}`}>
          <CardContent className="p-4">
            {/* Location */}
            <div className="flex items-center text-slate-500 text-sm mb-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{tour.location}</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-slate-900 text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {tour.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center mb-3">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="ml-1 text-sm font-medium">
                {tour.rating?.toFixed(1) || "New"}
              </span>
              {tour.reviewCount && tour.reviewCount > 0 && (
                <span className="ml-1 text-sm text-slate-500">
                  ({tour.reviewCount} reviews)
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>Max {tour.maxGroupSize}</span>
              </div>
            </div>

            {/* Highlights Preview */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {tour.highlights.slice(0, 2).map((highlight, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-slate-50"
                  >
                    {highlight}
                  </Badge>
                ))}
                {tour.highlights.length > 2 && (
                  <Badge variant="outline" className="text-xs bg-slate-50">
                    +{tour.highlights.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}