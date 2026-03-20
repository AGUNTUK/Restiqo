"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import Image from "next/image";
import Link from "next/link";
import { type Listing } from "@/lib/types/database";

interface ListingsMapProps {
  listings: Listing[];
}

export default function ListingsMap({ listings }: ListingsMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  // Default center (Bangladesh coordinates)
  const defaultCenter = listings.length > 0 && listings[0].latitude && listings[0].longitude
    ? { lat: listings[0].latitude, lng: listings[0].longitude }
    : { lat: 23.6850, lng: 90.3563 }; // Bangladesh Center

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-[#e8edf2] rounded-3xl flex items-center justify-center p-6 text-center shadow-inner border border-[#d1d9e0]">
        <div>
          <span className="text-3xl mb-2 block">🗺️</span>
          <p className="font-bold text-[#1a202c]">Map Unavailable</p>
          <p className="text-xs text-[#718096]">Google Maps API Key is missing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-lg border-4 border-white">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultZoom={7}
          defaultCenter={defaultCenter}
          mapId="RESTIQA_MAP_ID"
          disableDefaultUI={true}
          gestureHandling="greedy"
        >
          {listings.map((listing) => {
            if (!listing.latitude || !listing.longitude) return null;

            return (
              <AdvancedMarker
                key={listing.id}
                position={{ lat: listing.latitude, lng: listing.longitude }}
                onClick={() => setActiveListing(listing)}
              >
                <div className={`px-3 py-1.5 rounded-full font-bold text-sm shadow-md transition-transform ${
                  activeListing?.id === listing.id 
                    ? "bg-[#1a202c] text-white scale-110 z-50" 
                    : "bg-white text-[#1a202c] hover:scale-105"
                }`}>
                  ৳{Math.round(listing.price)}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Map Effects / Controls */}
          <MapBoundsFit listings={listings} />
        </Map>
      </APIProvider>

      {/* Floating Info Card Overlay (replaces native InfoWindow for better styling) */}
      {activeListing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[320px] z-10 transition-all duration-300 animate-in slide-in-from-bottom-5">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex gap-4 relative">
            <button 
              onClick={() => setActiveListing(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-xs font-bold text-[#718096] hover:text-[#1a202c] transition-colors"
            >
              ✕
            </button>
            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative">
              <Image 
                src={activeListing.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=200"}
                alt={activeListing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="text-sm font-extrabold text-[#1a202c] truncate">{activeListing.title}</h3>
                <p className="text-xs font-bold text-[#718096] truncate">{activeListing.city}, {activeListing.country}</p>
              </div>
              <Link 
                href={`/listing/${activeListing.id}`}
                className="text-xs font-bold text-[#6c63ff] hover:underline"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component to auto-fit map bounds to listings
function MapBoundsFit({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || listings.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasCoords = false;

    listings.forEach((listing) => {
      if (listing.latitude && listing.longitude) {
        bounds.extend({ lat: listing.latitude, lng: listing.longitude });
        hasCoords = true;
      }
    });

    if (hasCoords) {
      map.fitBounds(bounds, 50); // 50px padding
    }
  }, [map, listings]);

  return null;
}
