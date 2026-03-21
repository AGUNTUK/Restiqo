"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface FilterSectionProps {
  dict: any;
}

export default function FilterSection({ dict }: FilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get("amenities")?.split(",").filter(Boolean) || []
  );

  const amenitiesOptions = [
    { label: "WiFi", icon: "📶" },
    { label: "Pool", icon: "🏊" },
    { label: "AC", icon: "❄️" },
    { label: "Kitchen", icon: "🍳" },
    { label: "TV", icon: "📺" },
    { label: "Parking", icon: "🚗" },
    { label: "Gym", icon: "🏋️" },
    { label: "Security", icon: "🛡️" },
  ];

  const propertyTypes = [
    { label: "All", value: "all", icon: "🏠" },
    { label: "Villas", value: "villa", icon: "🌴" },
    { label: "Apartments", value: "apartment", icon: "🏙️" },
    { label: "Studios", value: "studio", icon: "🎨" },
    { label: "Penthouses", value: "penthouse", icon: "🌆" },
  ];

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    if (type !== "all") params.set("type", type);
    else params.delete("type");
    
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));
    else params.delete("amenities");

    router.push(`/listings?${params.toString()}`);
  };

  const toggleAmenity = (label: string) => {
    setSelectedAmenities(prev => 
      prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]
    );
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setType("all");
    setSelectedAmenities([]);
    router.push("/listings");
  };

  return (
    <div className="neo-card p-6 md:p-8 rounded-[32px] mb-10 border border-white/40">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Price Range */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Price Range (৳)</p>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full neo-inset p-3 rounded-xl text-sm font-bold bg-transparent outline-none focus:placeholder-transparent"
            />
            <span className="text-[#a0aec0]">-</span>
            <input 
              type="number" 
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full neo-inset p-3 rounded-xl text-sm font-bold bg-transparent outline-none focus:placeholder-transparent"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Property Type</p>
          <div className="flex flex-wrap gap-3">
            {propertyTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === t.value 
                    ? "bg-[#6c63ff] text-white shadow-lg neo-shadow-sm scale-105" 
                    : "bg-white/50 text-[#718096] hover:bg-white/80"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-end gap-3">
          <button 
            onClick={handleApply}
            className="w-full neo-btn-primary py-3 rounded-2xl text-sm font-extrabold shadow-lg"
          >
            Apply Filters
          </button>
          <button 
            onClick={clearFilters}
            className="w-full py-2 rounded-xl text-xs font-bold text-[#a0aec0] hover:text-[#ff6584] transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Amenities Selection */}
      <div className="mt-8 pt-8 border-t border-white/20">
        <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-4">Popular Amenities</p>
        <div className="flex flex-wrap gap-4">
          {amenitiesOptions.map((amenity) => (
            <button
              key={amenity.label}
              onClick={() => toggleAmenity(amenity.label)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                selectedAmenities.includes(amenity.label)
                  ? "bg-[#43e97b]/10 border-[#43e97b]/50 text-[#28a745] neo-shadow-sm"
                  : "bg-transparent border-transparent text-[#718096] hover:border-white/40"
              }`}
            >
              <span className="text-lg">{amenity.icon}</span>
              {amenity.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
