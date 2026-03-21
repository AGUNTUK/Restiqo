"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

interface SinglePropertyMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function SinglePropertyMap({ lat, lng, title }: SinglePropertyMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] bg-[#e8edf2] rounded-3xl flex items-center justify-center p-6 text-center shadow-inner border border-[#d1d9e0]">
        <div>
          <span className="text-3xl mb-2 block">🗺️</span>
          <p className="font-bold text-[#1a202c]">Map Unavailable</p>
          <p className="text-xs text-[#718096]">Google Maps API Key is missing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border border-[#e2e8f0]">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultZoom={15}
          defaultCenter={{ lat, lng }}
          mapId="SINGLE_PROPERTY_MAP_ID"
          disableDefaultUI={false}
          gestureHandling="greedy"
        >
          <AdvancedMarker position={{ lat, lng }}>
            <div className="relative">
              <div className="w-10 h-10 bg-[#6c63ff] rounded-full flex items-center justify-center text-white text-xl shadow-xl neo-shadow-sm border-2 border-white animate-bounce">
                🏠
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-[#e2e8f0]" />
            </div>
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
