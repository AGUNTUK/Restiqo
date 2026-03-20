"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { locations, Location } from "@/lib/data/locations";

interface LocationAutocompleteProps {
  placeholder?: string;
  onSelect: (location: Location) => void;
  defaultValue?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ 
  placeholder = "Search destination...", 
  onSelect,
  defaultValue = ""
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 2. Filter & Prioritize Logic
  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const lowerQuery = debouncedQuery.toLowerCase();
    
    const filtered = locations.filter(loc => 
      loc.name.toLowerCase().includes(lowerQuery) || 
      loc.name_bn.includes(debouncedQuery)
    );

    // Sort: Exact matches first
    return filtered.sort((a, b) => {
      const aExact = a.name.toLowerCase() === lowerQuery || a.name_bn === debouncedQuery;
      const bExact = b.name.toLowerCase() === lowerQuery || b.name_bn === debouncedQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    }).slice(0, 10);
  }, [debouncedQuery]);

  // 3. Grouped Results
  const groupedSuggestions = useMemo(() => {
    const groups = {
      districts: suggestions.filter(s => s.type === "district"),
      areas: suggestions.filter(s => s.type === "area")
    };
    return groups;
  }, [suggestions]);

  // 4. Click Outside Closer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 5. Handlers
  const handleSelect = useCallback((location: Location) => {
    setQuery(location.name);
    setIsOpen(false);
    onSelect(location);
  }, [onSelect]);

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse Geocoding via Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await res.json();
          
          const cityName = data.address.city || data.address.town || data.address.village || data.address.state_district || "Dhaka";
          
          // Try to find a match in our locations dataset
          const match = locations.find(l => 
            l.name.toLowerCase().includes(cityName.toLowerCase()) || 
            cityName.toLowerCase().includes(l.name.toLowerCase())
          );

          if (match) {
            handleSelect(match);
          } else {
            // If no match in dataset, just set the text and try to match dummy location or similar
            const cityLoc: Location = {
              name: cityName,
              name_bn: "আপনার এলাকা", // Generic "Your Area" in Bangla
              type: "area",
              district: "Detected",
              lat: latitude,
              lng: longitude
            };
            handleSelect(cityLoc);
          }
        } catch (error) {
          console.error("Geocoding failed", error);
          setLocationError("Could not detect city");
          handleSelect(locations.find(l => l.name === "Dhaka")!);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setLocationError("Permission denied");
        setIsLocating(false);
        handleSelect(locations.find(l => l.name === "Dhaka")!);
      },
      { timeout: 10000 }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => (
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} className="text-[#6c63ff] font-extrabold">{part}</strong>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="neo-inset flex items-center bg-[#f7fafc] px-4 py-3 rounded-2xl border border-white/50 transition-all focus-within:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
        <span className="mr-3 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-[#2d3748] font-bold placeholder:text-[#a0aec0]"
        />
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 z-50 neo-card overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-[24px] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Geo-location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-left group hover:bg-[#6c63ff]/5 text-[#6c63ff] border-b border-gray-100 mb-2"
          >
            <span className={`text-xl transition-transform duration-300 ${isLocating ? "animate-spin" : "group-hover:scale-125"}`}>
              {isLocating ? "⏳" : "📍"}
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm uppercase tracking-wider">
                {isLocating ? "Detecting location..." : "Use my current location"}
              </span>
              <span className="text-[10px] text-[#a0aec0] font-medium">
                {locationError || "Near you • Bangladesh"}
              </span>
            </div>
          </button>

          {suggestions.length === 0 && !isLocating && !query.trim() && (
            <div className="px-4 py-6 text-center text-[#a0aec0]">
              <p className="text-xl mb-1">🔍</p>
              <p className="text-xs font-bold uppercase tracking-widest">Start typing to find locations</p>
            </div>
          )}
          
          {/* Districts Group */}
          {groupedSuggestions.districts.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-extrabold text-[#a0aec0] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff]"></span> Districts
              </div>
              {groupedSuggestions.districts.map((loc) => {
                const globalIdx = suggestions.indexOf(loc);
                return (
                  <button
                    key={`${loc.name}-${loc.lat}`}
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      activeIndex === globalIdx ? "bg-[#6c63ff] text-white shadow-lg -translate-y-0.5" : "text-[#4a5568] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">📍</span>
                    <div className="flex flex-col">
                      <span className="font-bold">{highlightText(loc.name, query)}</span>
                      <span className={`text-[10px] ${activeIndex === globalIdx ? "text-white/70" : "text-[#a0aec0]"}`}>
                        {loc.name_bn} • Bangladesh
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Areas Group */}
          {groupedSuggestions.areas.length > 0 && (
            <div className={groupedSuggestions.districts.length > 0 ? "mt-2 pt-2 border-t border-gray-100" : ""}>
              <div className="px-4 py-2 text-[10px] font-extrabold text-[#a0aec0] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6584]"></span> Local Areas
              </div>
              {groupedSuggestions.areas.map((loc) => {
                const globalIdx = suggestions.indexOf(loc);
                return (
                  <button
                    key={`${loc.name}-${loc.lat}`}
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      activeIndex === globalIdx ? "bg-[#6c63ff] text-white shadow-lg -translate-y-0.5" : "text-[#4a5568] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">🏠</span>
                    <div className="flex flex-col">
                      <span className="font-bold">{highlightText(loc.name, query)}</span>
                      <span className={`text-[10px] ${activeIndex === globalIdx ? "text-white/70" : "text-[#a0aec0]"}`}>
                        {loc.name_bn} • {loc.district}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
